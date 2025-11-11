import React, { useState, useEffect } from 'react'
import axios from 'axios'
import {
  CRow,
  CCol,
  CCard,
  CCardBody,
  CInputGroup,
  CInputGroupText,
  CFormInput,
  CButton,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CModal,
} from '@coreui/react'
import { FaReply, FaTrash, FaEdit } from 'react-icons/fa'
import { IoEyeSharp } from 'react-icons/io5'
import { ToastContainer, toast } from 'react-toastify'
import Swal from 'sweetalert2'
import 'react-toastify/dist/ReactToastify.css'

const Reviews = () => {
  const [viewModal, setViewModal] = useState(false)
  const [selectedReview, setSelectedReview] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [reviews, setReviews] = useState([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
  })

  const [activeReplyId, setActiveReplyId] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [selectedRows, setSelectedRows] = useState([])

  const handleReplyClick = (id) => {
    setActiveReplyId(id)
    setReplyText('')
  }

  const handleReplySubmit = async (id) => {
    if (!replyText.trim()) {
      toast.error('Please enter your reply!')
      return
    }

    try {
      const res = await axios.put(`https://udemandme.cloud/api/reviews/reply/${id}`, {
        reply: replyText,
      })

      // Update review in local state
      setReviews((prev) => prev.map((r) => (r._id === id ? { ...r, reply: replyText } : r)))

      toast.success('Reply submitted!')
      setActiveReplyId(null)
      setReplyText('')
    } catch (err) {
      console.error(err)
      toast.error('Failed to submit reply')
    }
  }

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This will permanently delete the review!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`https://udemandme.cloud/api/reviews/${id}`)
          setReviews(reviews.filter((item) => item._id !== id))
          toast.success('Review deleted!')
        } catch (error) {
          console.error(error)
          toast.error('Failed to delete review')
        }
      }
    })
  }

  const renderStars = (count) => {
    const fullStars = '★'.repeat(count)
    const emptyStars = '☆'.repeat(5 - count)
    return (
      <span className="text-warning fw-bold" style={{ letterSpacing: '1px' }}>
        {fullStars + emptyStars}
      </span>
    )
  }

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(reviews)
    } else {
      setSelectedRows([])
    }
  }

  const handleCheckboxChange = (row) => {
    const exists = selectedRows.some((r) => JSON.stringify(r) === JSON.stringify(row))

    if (exists) {
      setSelectedRows(selectedRows.filter((r) => JSON.stringify(r) !== JSON.stringify(row)))
    } else {
      setSelectedRows([...selectedRows, row])
    }
  }
  const handleDeleteSelected = () => {
    if (selectedRows.length === 0) {
      toast.warning('Please select at least one Item to delete!')
      return
    }

    Swal.fire({
      title: 'Are you sure?',
      text: 'This will delete all selected reviews!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete all!',
    }).then((result) => {
      if (result.isConfirmed) {
        const updated = reviews.filter(
          (review) => !selectedRows.some((r) => JSON.stringify(r) === JSON.stringify(review)),
        )
        setReviews(updated)
        setSelectedRows([])
        toast.success('Selected Item deleted!')
      }
    })
  }

  const fetchReviews = async (params = {}) => {
    try {
      const query = new URLSearchParams({
        page: params.page || pagination.page,
        limit: params.limit || pagination.limit,
      }).toString()

      const res = await axios.get(`https://udemandme.cloud/api/reviews`)
      setReviews(res.data.data || res.data)

      // Update pagination if API returns total count
      if (res.data.pagination) {
        setPagination(res.data.pagination)
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to fetch reviews')
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [])

  const filteredReviews =
    filterStatus === 'all' ? reviews : reviews.filter((review) => review.status === filterStatus)
  return (
    <CRow className="g-4">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Modal for View */}
      <CModal visible={viewModal} onClose={() => setViewModal(false)} size="lg">
        <CCard className="border-0 position-relative">
          <CCardBody>
            {selectedReview && (
              <>
                {/* Close Button */}
                <CButton
                  color="danger"
                  size="sm"
                  className="position-absolute top-0 end-0 m-2"
                  onClick={() => setViewModal(false)}
                >
                  Close
                </CButton>

                {/* Product Images */}
                <div className="d-flex flex-wrap gap-2 justify-content-center mb-4 mt-3">
                  {[1, 2, 3, 4, 5].map((img, idx) => (
                    <img
                      key={idx}
                      src={`https://via.placeholder.com/100?text=Img+${idx + 1}`}
                      alt={`Product ${idx + 1}`}
                      style={{
                        width: '90px',
                        height: '90px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                      }}
                    />
                  ))}
                </div>

                {/* Star Rating */}
                <h6 className="fw-bold mb-1">Rating</h6>
                <p>{renderStars(selectedReview.star || 0)}</p>

                {/* Customer Review */}
                <h6 className="fw-bold mt-3 mb-1">Customer Review</h6>
                <p>{selectedReview.review || 'No review provided'}</p>

                {/* Reply */}
                <h6 className="fw-bold mt-3 mb-1">Reply</h6>
                <p className="text-success">{selectedReview.reply || 'No reply yet'}</p>
              </>
            )}
          </CCardBody>
        </CCard>
      </CModal>

      {/* Reviews List */}
      <CCol xs={12}>
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
          <h5 className="fw-bold mb-0">Reviews List</h5>

          <div className="d-flex gap-2">
            {/* Delete Selected Button (Styled like list actions) */}
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
          </div>
        </div>

        <CCard>
          <CCardBody>
            <div className="table-responsive">
              <CTable striped hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>
                      <input
                        type="checkbox"
                        checked={selectedRows.length === reviews.length}
                        onChange={handleSelectAll}
                      />
                    </CTableHeaderCell>
                    <CTableHeaderCell>Rating</CTableHeaderCell>
                    <CTableHeaderCell>Product</CTableHeaderCell>
                    <CTableHeaderCell>Submitted On</CTableHeaderCell>
                    <CTableHeaderCell>Review</CTableHeaderCell>
                    <CTableHeaderCell>Reply</CTableHeaderCell>
                    <CTableHeaderCell className="text-end">Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>

                <CTableBody>
                  {reviews.map((item) => (
                    <CTableRow key={item._id}>
                      <CTableDataCell>
                        <input
                          type="checkbox"
                          checked={selectedRows.some((r) => r._id === item._id)}
                          onChange={() => handleCheckboxChange(item)}
                        />
                      </CTableDataCell>
                      <CTableDataCell>
                        {item.rating ? renderStars(item.rating) : 'N/A'}
                      </CTableDataCell>
                      <CTableDataCell>
                        {item.productName
                          ? item.productName.length > 30
                            ? item.productName.slice(0, 30) + '...'
                            : item.productName
                          : 'N/A'}
                      </CTableDataCell>
                      <CTableDataCell>
                        {new Date(item.createdAt).toLocaleString() || 'N/A'}
                      </CTableDataCell>
                      <CTableDataCell>{item.reviewText || 'N/A'}</CTableDataCell>

                      <CTableDataCell>
                        {item.reply ? (
                          <span className="text-success">{item.reply}</span>
                        ) : (
                          <span className="text-muted">No reply yet</span>
                        )}
                      </CTableDataCell>

                      <CTableDataCell className="text-end d-flex gap-2 justify-content-end flex-wrap">
                        <CButton
                          size="sm"
                          color="success"
                          variant="outline"
                          onClick={() => handleReplyClick(item._id)}
                        >
                          <FaReply /> Reply
                        </CButton>

                        <CButton
                          size="sm"
                          color="danger"
                          variant="outline"
                          onClick={() => handleDelete(item._id)}
                        >
                          <FaTrash /> Delete
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      {/* Reply Form */}
      {activeReplyId && (
        <CCol xs={12}>
          <h6 className="fw-bold">Reply to Review</h6>
          <CCard className="border-top border-success border-2">
            <CCardBody>
              <CInputGroup>
                <CInputGroupText>
                  <FaReply />
                </CInputGroupText>
                <CFormInput
                  placeholder="Write your reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
                <CButton color="primary" onClick={() => handleReplySubmit(activeReplyId)}>
                  Submit
                </CButton>
              </CInputGroup>
            </CCardBody>
          </CCard>
        </CCol>
      )}
    </CRow>
  )
}

export default Reviews
