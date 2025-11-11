import { useEffect, useState } from 'react'
import axios from 'axios'
import {
  CRow,
  CCol,
  CCard,
  CCardBody,
  CButton,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CFormSelect,
} from '@coreui/react'
import { FaList, FaLink, FaTrash, FaEdit } from 'react-icons/fa'
import { ToastContainer, toast } from 'react-toastify'
import Swal from 'sweetalert2'
import 'react-toastify/dist/ReactToastify.css'
const Annularcutter = () => {
  const [addForm, setAddForm] = useState({
    title: '',
    youtubeurl: '',
    status: 1,
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [editForm, setEditForm] = useState({})
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [alldata, setAlldata] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const blogsPerPage = 1

  // 1️⃣ Filter first
  const filteredTags = alldata.filter((tag) =>
    tag.title.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // 2️⃣ Then paginate
  const indexOfLastBlog = currentPage * blogsPerPage
  const indexOfFirstBlog = indexOfLastBlog - blogsPerPage
  const currentBlogs = filteredTags.slice(indexOfFirstBlog, indexOfLastBlog)

  // 3️⃣ Total pages
  const totalPages = Math.ceil(filteredTags.length / blogsPerPage)
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])
  //Cancel Form
  const handleCancel = () => {
    setAddForm({
      title: '',
      youtubeurl: '',
      status: 1,
    })
    setShowAddForm(false)
    setShowEditForm(false)
  }
  // Get All Data
  const fetchdata = async () => {
    try {
      const response = await axios.get('http://udemandme.cloud/api/annularget')
      setAlldata(response.data.data)
    } catch (err) {
      console.error('Error fetching Url:', err)
      toast.error(err.response?.data?.message || 'Something went wrong')
      setAlldata([]) // fallback
    }
  }
  useEffect(() => {
    fetchdata()
  }, [])

  // Submit Add
  const handleAddSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.post('http://udemandme.cloud/api/postannular', addForm, {
        headers: { 'Content-Type': 'application/json' },
      })
      // console.log('addForm as JSON:', addForm)
      if (res.data.success) {
        toast.success('Annular Cutter Youtube added successfully!')
        setAddForm({ title: '', youtubeurl: '', status: 1 }) // reset
        setShowAddForm(false)
        fetchdata()
      }
    } catch (err) {
      console.error('--- API Error ---', err.response?.data || err)
      toast.error(err.response?.data?.message || 'Failed to add ❌')
    }
  }
  // Handle Delete
  const handleDelete = async (id) => {
    // console.log('Deleting ID:', id)
    if (!id) return toast.error('ID undefined, cannot delete')
    Swal.fire({
      title: 'Are you sure?',
      text: 'This will delete the video!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.delete(`http://udemandme.cloud/api/annulardelete/${id}`)
          if (response.data.success) {
            setAlldata((prev) => prev.filter((item) => item._id !== id))
            toast.success('Annular Deleted successfully!')
          } else {
            toast.error(response.data.message || 'Failed to delete')
          }
        } catch (error) {
          console.error(error)
          toast.error('Error deleting')
        }
      }
    })
  }
  // handle Add Change
  const handleAddChange = (e) => {
    const { name, value } = e.target
    setAddForm((prev) => ({ ...prev, [name]: value }))
  }
  // handle Edit Change
  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditForm((prev) => ({ ...prev, [name]: value }))
  }
  const handleEditSubmit = async () => {
    try {
      const res = await axios.put(
        `http://udemandme.cloud/api/annularupdate/${editForm._id}`,
        editForm,
        { headers: { 'Content-Type': 'application/json' } },
      )
      if (res.data.success) {
        toast.success('Annular Cutter Youtube updated successfully!')
        setShowEditForm(false) // Hide edit form
        fetchdata() // Refresh the table after update
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update ❌')
    }
  }
  const handleEditClick = (youtube) => {
    setEditForm({
      _id: youtube._id, // ✅ use _id to match backend
      title: youtube.title || '',
      youtubeurl: youtube.youtubeurl || '',
      status: youtube.status, // ✅ keep 0 or 1
    })
    setShowEditForm(true)
    setShowAddForm(false)
  }
  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await axios.patch(`http://udemandme.cloud/api/annularupdatestatus/${id}`, {
        status: newStatus,
      })
      if (res.data.success) {
        toast.success('Youtube status updated successfully!')
        setAlldata((prev) => prev.map((b) => (b._id === id ? { ...b, status: newStatus } : b)))
      } else {
        toast.error(res.data.message || 'Failed to update status ❌')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status ❌')
    }
  }
  return (
    <CRow className="g-4">
      <ToastContainer position="top-right" autoClose={3000} />
      <CCol xs={12} className="d-flex justify-content-between align-items-center">
        <h4 className="fw-bold mb-0 d-flex align-items-center gap-2">
          {showAddForm
            ? 'Annular Cutter Add YouTube Video'
            : showEditForm
              ? 'Annular Cutter Edit YouTube Video'
              : 'Annular Cutter YouTube Video List'}
          {!showAddForm && !showEditForm && (
            <span
              className="badge"
              style={{ background: '#5856d6', fontSize: '0.9rem', padding: '8px 12px' }}
            >
              {alldata.length === 1 ? `Blog (${alldata.length})` : `Total Video ${alldata.length}`}
            </span>
          )}
        </h4>
        <div className="d-flex gap-2">
          {!showAddForm && !showEditForm && (
            <>
              <div className="flex-grow-1 d-flex  justify-content-end">
                <input
                  type="text"
                  placeholder="Search Blog..."
                  className="form-control"
                  style={{ maxWidth: '500px', height: '35px' }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <CButton color="primary" onClick={() => setShowAddForm(true)}>
                + Add YouTube Video
              </CButton>
            </>
          )}
        </div>
      </CCol>
      {/* Add Form */}
      {showAddForm && (
        <CCol xs={12}>
          <CCard>
            <CCardBody>
              <CRow>
                <CCol md={6} className="mb-3">
                  <label className="form-label">YouTube Title</label>
                  <CInputGroup>
                    <CInputGroupText>
                      <FaList />
                    </CInputGroupText>
                    <CFormInput
                      name="title"
                      placeholder="Enter YouTube Title"
                      value={addForm.title}
                      onChange={handleAddChange}
                    />
                  </CInputGroup>
                </CCol>
                <CCol md={6} className="mb-3">
                  <label className="form-label">YouTube URL</label>
                  <CInputGroup>
                    <CInputGroupText>
                      <FaLink />
                    </CInputGroupText>
                    <CFormInput
                      name="youtubeurl"
                      placeholder="Enter YouTube URL"
                      value={addForm.youtubeurl}
                      onChange={handleAddChange}
                    />
                  </CInputGroup>
                </CCol>
                <CCol md={6} className="mb-3">
                  <label className="form-label">Status</label>
                  <CFormSelect name="status" value={addForm.status ?? 1} onChange={handleAddChange}>
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                  </CFormSelect>
                </CCol>
                <CCol xs={12} className="d-flex gap-2">
                  <CButton color="primary" onClick={handleAddSubmit}>
                    Submit
                  </CButton>
                  <CButton className="text-white" color="danger" onClick={handleCancel}>
                    Cancel
                  </CButton>
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        </CCol>
      )}
      {/* Edit Form */}
      {showEditForm && (
        <CCol xs={12}>
          <CCard>
            <CCardBody>
              <CRow>
                <CCol md={6} className="mb-3">
                  <label className="form-label">YouTube Title</label>
                  <CFormInput name="title" value={editForm.title} onChange={handleEditChange} />
                </CCol>
                <CCol md={6} className="mb-3">
                  <label className="form-label">YouTube URL</label>
                  <CFormInput
                    name="youtubeurl"
                    value={editForm.youtubeurl}
                    onChange={handleEditChange}
                  />
                </CCol>
                <CCol md={6} className="mb-3">
                  <label className="form-label">Status</label>
                  <CFormSelect name="status" value={editForm.status} onChange={handleEditChange}>
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                  </CFormSelect>
                </CCol>
                <CCol xs={12} className="d-flex gap-2">
                  <CButton color="primary" onClick={handleEditSubmit}>
                    Update YouTube Video
                  </CButton>
                  <CButton className="text-white" color="danger" onClick={handleCancel}>
                    Cancel
                  </CButton>
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        </CCol>
      )}
      {/* List */}
      {!showAddForm && !showEditForm && (
        <CCol xs={12}>
          <CCard>
            <CCardBody>
              <CTable striped hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>ID</CTableHeaderCell>
                    <CTableHeaderCell>Title</CTableHeaderCell>
                    <CTableHeaderCell>YouTube URL</CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                    <CTableHeaderCell className="text-end">Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {currentBlogs.map((v, index) => (
                    <CTableRow key={v._id}>
                      <CTableDataCell>{index + 1}</CTableDataCell>
                      <CTableDataCell>{v.title}</CTableDataCell>
                      <CTableDataCell>
                        <a href={v.youtubeurl} target="_blank" rel="noreferrer">
                          {v.youtubeurl}
                        </a>
                      </CTableDataCell>
                      <CTableDataCell>
                        <select
                          className="form-select form-select-sm"
                          value={v.status}
                          onChange={(e) => handleStatusChange(v._id, parseInt(e.target.value))}
                        >
                          <option value={1}>Active</option>
                          <option value={0}>Inactive</option>
                        </select>
                      </CTableDataCell>
                      <CTableDataCell className="text-end d-flex gap-2 justify-content-end">
                        <CButton
                          size="sm"
                          color="success"
                          variant="outline"
                          onClick={() => handleEditClick(v)}
                          className="d-flex align-items-center gap-1 rounded-sm custom-hover-success"
                        >
                          <FaEdit />
                          Edit
                        </CButton>
                        <CButton
                          size="sm"
                          color="danger"
                          variant="outline"
                          onClick={() => handleDelete(v._id)}
                          className="d-flex align-items-center gap-1 rounded-sm custom-hover-danger"
                        >
                          <FaTrash />
                          Delete
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

      {/* Pagination - Right side only */}
      {!showAddForm && !showEditForm && (
        <div className="d-flex justify-content-end mt-4">
          <div className="d-flex align-items-center">
            {/* Left Arrow */}
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border mx-1 rounded bg-white text-dark"
              style={{ fontSize: '14px', minWidth: '40px' }}
            >
              ‹
            </button>

            {/* Page Numbers */}
            {(() => {
              const total = totalPages
              const current = currentPage
              const pageNumbers = []

              // hamesha first page
              pageNumbers.push(1)

              // agar current 1 ya 2 se bada hai to left ellipsis
              if (current > 3) {
                pageNumbers.push('...')
              }

              // current ke left aur right ke liye 1 page ka range
              const start = Math.max(2, current - 1)
              const end = Math.min(total - 1, current + 1)

              for (let i = start; i <= end; i++) {
                pageNumbers.push(i)
              }

              // agar current last-2 se chhota hai to right ellipsis
              if (current < total - 2) {
                pageNumbers.push('...')
              }

              // hamesha last page
              if (total > 1) {
                pageNumbers.push(total)
              }

              return pageNumbers.map((num, idx) =>
                num === '...' ? (
                  <span key={idx} className="px-2">
                    ...
                  </span>
                ) : (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(num)}
                    className={`px-3 py-1 border mx-1 rounded ${
                      currentPage === num
                        ? 'bg-primary text-white fw-bold border-primary'
                        : 'bg-white text-dark border-secondary'
                    }`}
                    style={{ fontSize: '14px', minWidth: '40px' }}
                  >
                    {num}
                  </button>
                ),
              )
            })()}

            {/* Right Arrow */}
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border mx-1 rounded bg-white text-dark"
            >
              ›
            </button>
          </div>
        </div>
      )}
    </CRow>
  )
}
export default Annularcutter
