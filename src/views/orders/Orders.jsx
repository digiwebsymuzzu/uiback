import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'

import {
  CRow,
  CCol,
  CCard,
  CCardBody,
  CFormSelect,
  CButton,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
} from '@coreui/react'
import { FaTrash } from 'react-icons/fa'
import { IoEyeSharp } from 'react-icons/io5'
import { ToastContainer, toast } from 'react-toastify'
import Swal from 'sweetalert2'
import 'react-toastify/dist/ReactToastify.css'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const Orders = () => {
  const invoiceRef = useRef(null)

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [totalOrders, setTotalOrders] = useState(0)

  const [showEditForm, setShowEditForm] = useState(false)
  const [selectedRows, setSelectedRows] = useState([])

  const [editForm, setEditForm] = useState({
    name: '',
    id: '',
    date: '',
    Status: '',
    email: '',
    phone: '',
    billingAddress: '',
    shippingAddress: '',
    notes: '',
  })

  const [invoiceItems] = useState([
    { image: 'https://via.placeholder.com/60', name: 'Product 1', price: 200, quantity: 2 },
    { image: 'https://via.placeholder.com/60', name: 'Product 2', price: 150, quantity: 1 },
  ])

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(`http://udemandme.cloud/api/order?page=${page}&limit=${limit}`)
        setOrders(res.data.data)
        setTotalPages(res.data.pages)
        setTotalOrders(res.data.total)
      } catch (err) {
        console.error(err)
        toast.error('Failed to load orders!')
      }
    }

    fetchOrders()
  }, [page])

  const handleEditClick = (order) => {
    setEditForm({
      id: order._id,
      name: `${order.user.firstName} ${order.user.lastName}`,
      date: order.createdAt,
      Status: order.status,
      email: order.user.email,
      phone: order.user.phone,
      billingAddress: order.user.address,
      shippingAddress: order.user.address,
      notes: order.user.notes || '',
      cartItems: order.cartItems || [],
      subtotal: order.subtotal,
      tax: order.tax,
      grandTotal: order.grandTotal,
    })
    setShowEditForm(true)
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleEditSubmit = async () => {
    if (!editForm.Status) {
      toast.error('Please select a status!')
      return
    }

    try {
      await axios.patch(`http://udemandme.cloud/api/order/${editForm.id}/status`, {
        status: editForm.Status,
      })

      toast.success('Order status updated!')
      setOrders((prev) =>
        prev.map((order) =>
          order._id === editForm.id ? { ...order, status: editForm.Status } : order,
        ),
      )

      setShowEditForm(false)
    } catch (error) {
      console.error(error)
      toast.error('Failed to update status')
    }
  }

  // ✅ Delete single order
  const handleDelete = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This will permanently delete the order!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://udemandme.cloud/api/order/${id}`)
          setOrders(orders.filter((order) => order._id !== id))
          toast.success('Order deleted successfully!')
        } catch (error) {
          toast.error('Failed to delete order!')
        }
      }
    })
  }

  // ✅ Select all
  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedRows(orders)
    else setSelectedRows([])
  }

  // ✅ Single checkbox toggle
  const handleCheckboxChange = (row) => {
    const exists = selectedRows.some((r) => r._id === row._id)
    setSelectedRows(exists ? selectedRows.filter((r) => r._id !== row._id) : [...selectedRows, row])
  }

  // ✅ Delete selected orders (bulk)
  const handleDeleteSelected = () => {
    if (selectedRows.length === 0) {
      toast.warning('Please select at least one order!')
      return
    }

    Swal.fire({
      title: 'Are you sure?',
      text: 'This will delete all selected orders!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete all!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const ids = selectedRows.map((row) => row._id)
          await axios.post('http://udemandme.cloud/api/order/delete-multiple', { ids })

          setOrders(orders.filter((order) => !ids.includes(order._id)))
          setSelectedRows([])
          toast.success('Selected orders deleted!')
        } catch (error) {
          toast.error('Failed to delete selected orders!')
        }
      }
    })
  }

  // ---- PDF DOWNLOAD (Hidden invoice -> Non-blank PDF) ----
  const handleDownload = async () => {
    const element = invoiceRef.current
    if (!element) return

    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#fff',
      useCORS: true,
      logging: false,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')

    const pdfWidth = pdf.internal.pageSize.getWidth() // 210mm for A4
    const pdfHeight = pdf.internal.pageSize.getHeight() // 297mm for A4

    // Scale image to fit width without cutting
    const imgWidth = pdfWidth
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    let heightLeft = imgHeight
    let position = 0

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pdfHeight

    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pdfHeight
    }

    pdf.save('invoice.pdf')
  }

  const subtotal = invoiceItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const tax = Math.round(subtotal * 0.18)
  const shipping = 50
  const grandTotal = Math.round(subtotal + tax + shipping)

  return (
    <CRow className="g-4">
      <ToastContainer position="top-right" autoClose={3000} />
      <CCol xs={12} className="d-flex justify-content-between align-items-center">
        <h4 className="fw-bold mb-0">
          {showEditForm ? 'View Order' : 'Orders List'}

          <small style={{ fontSize: '12px' }}>&nbsp;&nbsp;({totalOrders} Orders)</small>
        </h4>
        {!showEditForm && (
          <CButton
            size="sm"
            color="danger"
            variant="outline"
            onClick={handleDeleteSelected}
            className="d-flex align-items-center gap-1 rounded-sm custom-hover-danger"
          >
            <FaTrash />
            <span>Delete</span>
          </CButton>
        )}
      </CCol>

      {/* View / Edit Form */}
      {showEditForm && (
        <CCol xs={12}>
          <CCard>
            <CCardBody>
              <CRow>
                <CCol md={6} className="mb-3">
                  <label className="form-label fw-semibold">Customer Name</label>
                  <div className="form-control bg-light">{editForm.name || 'N/A'}</div>
                </CCol>

                <CCol md={6} className="mb-3">
                  <label className="form-label fw-semibold">Order ID</label>
                  <div className="form-control bg-light">{editForm.id || 'N/A'}</div>
                </CCol>

                <CCol md={6} className="mb-3">
                  <label className="form-label fw-semibold">Date & Time</label>
                  <div className="form-control bg-light">
                    {editForm.date ? new Date(editForm.date).toLocaleString() : 'N/A'}
                  </div>
                </CCol>

                <CCol md={6} className="mb-3">
                  <label className="form-label fw-semibold">Order Status</label>
                  <CFormSelect name="Status" value={editForm.Status} onChange={handleEditChange}>
                    <option value="">Select Status</option>
                    <option value="Payment Pending">Payment Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Refund">Refund</option>
                  </CFormSelect>
                </CCol>

                <CCol md={6} className="mb-3">
                  <label className="form-label fw-semibold">Customer Email</label>
                  <div className="form-control bg-light">{editForm.email || 'N/A'}</div>
                </CCol>

                <CCol md={6} className="mb-3">
                  <label className="form-label fw-semibold">Customer Number</label>
                  <div className="form-control bg-light">{editForm.phone || 'N/A'}</div>
                </CCol>

                <CCol md={6} className="mb-3">
                  <label className="form-label fw-semibold">Billing Address</label>
                  <textarea
                    className="form-control bg-light"
                    rows={3}
                    readOnly
                    value={editForm.billingAddress || 'N/A'}
                  />
                </CCol>

                <CCol md={6} className="mb-3">
                  <label className="form-label fw-semibold">Shipping Address</label>
                  <textarea
                    className="form-control bg-light"
                    rows={3}
                    readOnly
                    value={editForm.shippingAddress || 'N/A'}
                  />
                </CCol>

                <CCol md={6} className="mb-3">
                  <label className="form-label fw-semibold">Customer Notes</label>
                  <div className="form-control bg-light">{editForm.notes || 'N/A'}</div>
                </CCol>

                <CCol xs={12} className="mb-3">
                  <CButton color="primary" onClick={handleEditSubmit}>
                    Update Status
                  </CButton>
                </CCol>

                {/* ✅ INVOICE SECTION (uses real data now) */}
                <CCol xs={12}>
                  <CCard className="mt-4 shadow-sm">
                    <CCardBody id="invoice-section">
                      <h5 className="fw-bold mb-4 border-bottom pb-2">Invoice Summary</h5>

                      <CTable bordered responsive>
                        <CTableHead className="bg-light">
                          <CTableRow>
                            <CTableHeaderCell>No.</CTableHeaderCell>
                            <CTableHeaderCell>Product Name</CTableHeaderCell>
                            <CTableHeaderCell className="text-end">Price</CTableHeaderCell>
                            <CTableHeaderCell className="text-end">Quantity</CTableHeaderCell>
                            <CTableHeaderCell className="text-end">Total</CTableHeaderCell>
                          </CTableRow>
                        </CTableHead>

                        <CTableBody>
                          {editForm.cartItems?.map((item, index) => (
                            <CTableRow key={index}>
                              <CTableDataCell>{index + 1}</CTableDataCell>
                              <CTableDataCell>{item.productName}</CTableDataCell>
                              <CTableDataCell className="text-end">
                                ₹{item.price?.toLocaleString('en-IN')}
                              </CTableDataCell>
                              <CTableDataCell className="text-end">{item.qty}</CTableDataCell>
                              <CTableDataCell className="text-end">
                                ₹{(item.qty * item.price)?.toLocaleString('en-IN')}
                              </CTableDataCell>
                            </CTableRow>
                          ))}

                          <CTableRow>
                            <CTableDataCell colSpan={4} className="text-end fw-semibold">
                              Subtotal
                            </CTableDataCell>
                            <CTableDataCell className="text-end">
                              ₹{editForm.subtotal?.toLocaleString('en-IN')}
                            </CTableDataCell>
                          </CTableRow>
                          <CTableRow>
                            <CTableDataCell colSpan={4} className="text-end fw-semibold">
                              Tax
                            </CTableDataCell>
                            <CTableDataCell className="text-end">
                              ₹{editForm.tax?.toLocaleString('en-IN')}
                            </CTableDataCell>
                          </CTableRow>
                          <CTableRow>
                            <CTableDataCell colSpan={4} className="text-end fw-bold">
                              Grand Total
                            </CTableDataCell>
                            <CTableDataCell className="text-end fw-bold text-success">
                              ₹{editForm.grandTotal?.toLocaleString('en-IN')}
                            </CTableDataCell>
                          </CTableRow>
                        </CTableBody>
                      </CTable>
                    </CCardBody>
                  </CCard>
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        </CCol>
      )}

      {/* Orders Table */}
      {!showEditForm && (
        <CCol xs={12}>
          <CCard>
            <CCardBody>
              <CTable striped hover>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>
                      <input
                        type="checkbox"
                        checked={selectedRows.length === orders.length}
                        onChange={handleSelectAll}
                      />
                    </CTableHeaderCell>
                    <CTableHeaderCell>ID</CTableHeaderCell>
                    <CTableHeaderCell>Order Name</CTableHeaderCell>
                    <CTableHeaderCell>Order Date</CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                    <CTableHeaderCell>Price</CTableHeaderCell>
                    <CTableHeaderCell className="text-end">Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {orders.map((order) => (
                    <CTableRow key={order._id}>
                      <CTableDataCell>
                        <input
                          type="checkbox"
                          checked={selectedRows.some((r) => r._id === order._id)}
                          onChange={() => handleCheckboxChange(order)}
                        />
                      </CTableDataCell>

                      {/* Order ID */}
                      <CTableDataCell>
                        {order._id ? order._id.slice(-6).toUpperCase() : '---'}
                      </CTableDataCell>

                      {/* Order Name */}
                      <CTableDataCell>
                        {order.user ? `${order.user.firstName} ${order.user.lastName}` : 'N/A'}
                      </CTableDataCell>

                      {/* Order Date */}
                      <CTableDataCell>
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                      </CTableDataCell>

                      {/* Status */}
                      <CTableDataCell>
                        <span
                          className="text-white px-2 py-1 rounded fw-semibold"
                          style={{
                            backgroundColor:
                              order.status === 'Payment Pending'
                                ? '#FFA500'
                                : order.status === 'Processing'
                                  ? '#007BFF'
                                  : order.status === 'On Hold'
                                    ? '#ffbc00'
                                    : order.status === 'Completed'
                                      ? 'green'
                                      : order.status === 'Cancelled'
                                        ? 'red'
                                        : order.status === 'Refund'
                                          ? 'gray'
                                          : '#6c757d',
                          }}
                        >
                          {order.status || 'N/A'}
                        </span>
                      </CTableDataCell>

                      {/* Price */}
                      <CTableDataCell>
                        AED
                        {order.subtotal?.toLocaleString('en-IN') || '0'}
                      </CTableDataCell>

                      {/* Actions */}
                      <CTableDataCell className="text-end d-flex gap-2 justify-content-end">
                        <CButton
                          size="sm"
                          color="info"
                          variant="outline"
                          onClick={() => handleEditClick(order)}
                          className="d-flex align-items-center gap-1 rounded-sm"
                        >
                          <IoEyeSharp />
                          <span>View</span>
                        </CButton>
                        <CButton
                          size="sm"
                          color="danger"
                          variant="outline"
                          onClick={() => handleDelete(order._id)}
                          className="d-flex align-items-center gap-1 rounded-sm custom-hover-danger"
                        >
                          <FaTrash />
                          <span>Delete</span>
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>

              <div className="d-flex justify-content-end mt-3 gap-2">
                <CButton size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                  Prev
                </CButton>

                {[...Array(totalPages).keys()].map((num) => (
                  <CButton
                    key={num + 1}
                    size="sm"
                    color={page === num + 1 ? 'primary' : 'light'}
                    onClick={() => setPage(num + 1)}
                  >
                    {num + 1}
                  </CButton>
                ))}

                <CButton
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </CButton>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      )}
    </CRow>
  )
}

export default Orders
