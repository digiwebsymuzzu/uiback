import React, { useState } from 'react'
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
import { FaList, FaTrash } from 'react-icons/fa'
import { IoEyeSharp } from 'react-icons/io5'
import { ToastContainer, toast } from 'react-toastify'
import Swal from 'sweetalert2'
import 'react-toastify/dist/ReactToastify.css'
import html2pdf from 'html2pdf.js'

const Refundpolicy = () => {
    const [categories, setCategories] = useState([
        {
            id: 1,
            name: 'Order 1',
            Date: '12/8/2025',
            refunddate: '12/8/2025',
            Status: 'Refund Initiated',
            price: '300',

        },
        {
            id: 2,
            name: 'Order 2',
            Date: '12/8/2025',
            refunddate: '12/8/2025',
            Status: 'Refund Initiated',
            price: '500',

        },
        {
            id: 3,
            name: 'Order 3',
            Date: '12/8/2025',
            refunddate: '12/8/2025',
            Status: 'Refund Initiated',
            price: '500',

        },
        {
            id: 4,
            name: 'Order 4',
            Date: '12/8/2025',
            refunddate: '12/8/2025',
            Status: 'Refund Cancellation',
            price: '500',

        },
        {
            id: 5,
            name: 'Order 5',
            Date: '12/8/2025',
            refunddate: '12/8/2025',
            Status: 'Refund Cancellation',
            price: '500',

        },
        {
            id: 6,
            name: 'Order 6',
            Date: '12/8/2025',
            refunddate: '12/8/2025',
            Status: 'Refund Cancellation',
            price: '500',

        },
    ])

    const [showEditForm, setShowEditForm] = useState(false)
    const [selectedRows, setSelectedRows] = useState([])
    const [editForm, setEditForm] = useState({
        name: '',
        id: '',
        date: '',
        refunddate: '',
        price: '',
        Status: '',

    })
    const [invoiceItems] = useState([
        {
            image: 'https://via.placeholder.com/60',
            name: 'Product 1',
            price: 200,
            quantity: 2,
        },
        {
            image: 'https://via.placeholder.com/60',
            name: 'Product 2',
            price: 150,
            quantity: 1,
        },
    ])

    const handleEditClick = (cat) => {
        setEditForm({
            name: cat.name,
            id: cat.id,
            date: cat.Date,
            refunddate: cat.refunddate,
            price: cat.price,
            Status: cat.Status,
        })
        setShowEditForm(true)
    }

    const handleEditChange = (e) => {
        const { name, value } = e.target
        setEditForm((prev) => ({ ...prev, [name]: value }))
    }

    const handleEditSubmit = () => {
        // Validate
        if (!editForm.Status) {
            toast.error('Please select a status!')
            return
        }

        // Update status in categories list
        const updated = categories.map((order) =>
            order.id === editForm.id ? { ...order, Status: editForm.Status } : order,
        )
        setCategories(updated)

        toast.success('Refund status updated successfully!')
        setShowEditForm(false)
    }








    const downloadInvoice = () => {
        const element = document.getElementById('invoice-section')
        html2pdf().from(element).save('invoice.pdf')
    }
    return (
        <CRow className="g-4">
            <ToastContainer position="top-right" autoClose={3000} />
            <CCol xs={12} className="d-flex justify-content-between align-items-center">
                <h4 className="fw-bold mb-0">{showEditForm ? 'View Refund' : 'Refund List'}</h4>
            </CCol>

            {/* View / Edit Form */}
            {showEditForm && (
                <CCol xs={12}>
                    <CCard>
                        <CCardBody>
                            <CRow>

                                <CCol md={6} className="mb-3">
                                    <label className="form-label fw-semibold">Order Number</label>
                                    <div className="form-control bg-light">{editForm.id || 'N/A'}</div>
                                </CCol>

                                <CCol md={6} className="mb-3">
                                    <label className="form-label fw-semibold">Date Order</label>
                                    <div className="form-control bg-light">{editForm.date || 'N/A'}</div>
                                </CCol>
                                <CCol md={6} className="mb-3">
                                    <label className="form-label fw-semibold">Refund Date Order</label>
                                    <div className="form-control bg-light">{editForm.refunddate || 'N/A'}</div>
                                </CCol>
                                <CCol md={6} className="mb-3">
                                    <label className="form-label fw-semibold">Order Price</label>
                                    <div className="form-control bg-light">{editForm.price || 'N/A'}</div>
                                </CCol>

                                <CCol md={12} className="mb-3">
                                    <label className="form-label fw-semibold">Refund Status</label>
                                    <CFormSelect name="Status" value={editForm.Status} onChange={handleEditChange}>
                                        <option value="">Select Status</option>
                                        <option value="Refund Initiated">Refund Initiated</option>
                                        <option value="Refund Cancellation">Refund Cancellation</option>
                                    </CFormSelect>
                                </CCol>











                                <CCol xs={12}>
                                    <CButton color="primary" onClick={handleEditSubmit}>
                                        Update Status
                                    </CButton>
                                </CCol>
                                <CCol xs={12}>
                                    <CCard className="mt-4 shadow-sm">
                                        <CCardBody id="invoice-section">
                                            <h5 className="fw-bold mb-4 border-bottom pb-2">Invoice Summary</h5>

                                            <CTable bordered responsive>
                                                <CTableHead className="bg-light">
                                                    <CTableRow>
                                                        <CTableHeaderCell>Image</CTableHeaderCell>
                                                        <CTableHeaderCell>Product Name</CTableHeaderCell>
                                                        <CTableHeaderCell className="text-end">Price</CTableHeaderCell>
                                                        <CTableHeaderCell className="text-end">Quantity</CTableHeaderCell>
                                                        <CTableHeaderCell className="text-end">Total</CTableHeaderCell>
                                                    </CTableRow>
                                                </CTableHead>
                                                <CTableBody>
                                                    {invoiceItems.map((item, index) => (
                                                        <CTableRow key={index}>
                                                            <CTableDataCell>
                                                                <img src={item.image} alt={item.name} width="60" />
                                                            </CTableDataCell>
                                                            <CTableDataCell>{item.name}</CTableDataCell>
                                                            <CTableDataCell className="text-end">₹{item.price}</CTableDataCell>
                                                            <CTableDataCell className="text-end">{item.quantity}</CTableDataCell>
                                                            <CTableDataCell className="text-end">
                                                                ₹{item.price * item.quantity}
                                                            </CTableDataCell>
                                                        </CTableRow>
                                                    ))}

                                                    {/* Calculation Rows */}
                                                    <CTableRow>
                                                        <CTableDataCell colSpan={4} className="text-end fw-semibold">
                                                            Subtotal
                                                        </CTableDataCell>
                                                        <CTableDataCell className="text-end">
                                                            ₹
                                                            {invoiceItems.reduce(
                                                                (acc, item) => acc + item.price * item.quantity,
                                                                0,
                                                            )}
                                                        </CTableDataCell>
                                                    </CTableRow>

                                                    <CTableRow>
                                                        <CTableDataCell colSpan={4} className="text-end fw-semibold">
                                                            Shipping Charges
                                                        </CTableDataCell>
                                                        <CTableDataCell className="text-end">₹50</CTableDataCell>
                                                    </CTableRow>

                                                    <CTableRow>
                                                        <CTableDataCell colSpan={4} className="text-end fw-semibold">
                                                            Tax (18%)
                                                        </CTableDataCell>
                                                        <CTableDataCell className="text-end">
                                                            ₹
                                                            {Math.round(
                                                                invoiceItems.reduce(
                                                                    (acc, item) => acc + item.price * item.quantity,
                                                                    0,
                                                                ) * 0.18,
                                                            )}
                                                        </CTableDataCell>
                                                    </CTableRow>

                                                    <CTableRow>
                                                        <CTableDataCell colSpan={4} className="text-end fw-bold">
                                                            Grand Total
                                                        </CTableDataCell>
                                                        <CTableDataCell className="text-end fw-bold text-success">
                                                            ₹
                                                            {(() => {
                                                                const subtotal = invoiceItems.reduce(
                                                                    (acc, item) => acc + item.price * item.quantity,
                                                                    0,
                                                                )
                                                                const tax = subtotal * 0.18
                                                                const shipping = 50
                                                                return Math.round(subtotal + tax + shipping)
                                                            })()}
                                                        </CTableDataCell>
                                                    </CTableRow>
                                                </CTableBody>
                                            </CTable>

                                            <div className="text-end mt-4 ">
                                                <CButton className='text-white' color="success" onClick={downloadInvoice}>
                                                    Download Invoice
                                                </CButton>
                                            </div>
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

                                        <CTableHeaderCell>ID</CTableHeaderCell>
                                        <CTableHeaderCell>Order No</CTableHeaderCell>
                                        <CTableHeaderCell>Order Date</CTableHeaderCell>
                                        <CTableHeaderCell>Refund Date</CTableHeaderCell>
                                        <CTableHeaderCell>Refund Status</CTableHeaderCell>
                                        <CTableHeaderCell>Price</CTableHeaderCell>
                                        <CTableHeaderCell className="text-end">Actions</CTableHeaderCell>
                                    </CTableRow>
                                </CTableHead>
                                <CTableBody>
                                    {categories.map((cat) => (
                                        <CTableRow key={cat.id}>
                                            <CTableDataCell>{cat.id}</CTableDataCell>
                                            <CTableDataCell>{cat.name}</CTableDataCell>
                                            <CTableDataCell>{cat.Date}</CTableDataCell>
                                            <CTableDataCell>{cat.refunddate}</CTableDataCell>
                                            <CTableDataCell>
                                                <span
                                                    className="text-white px-2 py-1 rounded fw-semibold"
                                                    style={{
                                                        backgroundColor:
                                                            cat.Status === 'Refund Initiated'
                                                                ? 'green'
                                                                : cat.Status === 'Refund Cancellation'
                                                                    ? 'red'
                                                                    : '#6c757d',
                                                    }}
                                                >
                                                    {cat.Status}
                                                </span>
                                            </CTableDataCell>
                                            <CTableDataCell>{cat.price}</CTableDataCell>
                                            <CTableDataCell className="text-end d-flex gap-2 justify-content-end">
                                                <CButton
                                                    size="sm"
                                                    color="info"
                                                    variant="outline"
                                                    className="view-btn d-flex align-items-center gap-1 rounded-sm"
                                                    onClick={() => handleEditClick(cat)}
                                                >
                                                    <IoEyeSharp />
                                                    <span>View</span>
                                                </CButton>
                                            </CTableDataCell>
                                        </CTableRow>
                                    ))}
                                </CTableBody>
                            </CTable>
                        </CCardBody>
                    </CCard>
                </CCol>
            )}
        </CRow>
    )
}

export default Refundpolicy
