import { useState, useEffect } from 'react'
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
} from '@coreui/react'
import { FaList, FaTag, FaTrash, FaEdit } from 'react-icons/fa'
import { ToastContainer, toast } from 'react-toastify'
import Swal from 'sweetalert2'
import 'react-toastify/dist/ReactToastify.css'
import ReactQuill from 'react-quill'
const Tags = () => {
  const [addForm, setAddForm] = useState({
    tagname: '',
    tagslug: '',
    tagparagraph: '', // quill ka data yaha save hoga
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [alltsgs, setAlltags] = useState([])
  const [editForm, setEditForm] = useState({})
  const [selectedRows, setSelectedRows] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const blogsPerPage = 2

  // 1️⃣ Filter first
  const filteredTags = alltsgs.filter((tag) =>
    tag.tagname.toLowerCase().includes(searchTerm.toLowerCase()),
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
  const handleCancel = () => {
    // Hide forms
    setShowAddForm(false)
    setShowEditForm(false)

    // Reset Add Form
    setAddForm({ tagname: '', tagslug: '', tagparagraph: '' }) // reset
    setShowAddForm(false)
    fetchAlltags()
  }

  // ✅ Add Submit (without file)
  const handleAddSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.post('https://udemandme.cloud/api/blogtag', addForm, {
        headers: { 'Content-Type': 'application/json' },
      })

      if (res.data.success) {
        toast.success('Blog Tag added successfully!')
        setAddForm({ tagname: '', tagslug: '', tagparagraph: '' }) // reset
        setShowAddForm(false)
        fetchAlltags()
      }
    } catch (err) {
      console.error('--- API Error ---', err.response?.data || err)
      toast.error(err.response?.data?.message || 'Failed to add Blog Tag ❌')
    }
  }
  const handleAddChange = (e) => {
    const { name, value } = e.target

    if (name === 'tagname') {
      // ✅ ensure value is string
      const str = String(value)
      const generatedSlug = str
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // remove special chars
        .replace(/\s+/g, '-') // replace spaces with dash

      setAddForm((prev) => ({
        ...prev,
        tagname: str,
        tagslug: generatedSlug, // ✅ assign to slug
      }))
    } else {
      setAddForm((prev) => ({ ...prev, [name]: value }))
    }
  }
  // Component top level pe define karo
  const fetchAlltags = async () => {
    try {
      const response = await axios.get('https://udemandme.cloud/api/getalltag')
      setAlltags(response.data.data)
    } catch (err) {
      console.error('Error fetching Blog Tag:', err)
      toast.error(err.response?.data?.message || 'Something went wrong')
      setAlltags([]) // fallback
    }
  }
  useEffect(() => {
    fetchAlltags()
  }, [])
  const handleDelete = async (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This will delete the Blog Tag!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await axios.delete(`https://udemandme.cloud/api/deletetag/${id}`)

          if (res.data.success) {
            // frontend state se remove karna
            setAlltags((prev) => prev.filter((alltsgs) => alltsgs._id !== id))

            toast.success('Tag deleted successfully!')
          } else {
            toast.error(res.data.message || 'Failed to delete Blog Tag')
          }
        } catch (error) {
          console.error(error)
          toast.error('Error Deleting Blog  Tag')
        }
      }
    })
  }
  const handleEditClick = (tag) => {
    setEditForm({
      id: tag._id, // <-- Needed for update
      tagname: tag.tagname || '',
      tagslug: tag.tagslug || '',
      tagparagraph: tag.tagparagraph || '',
    })
    setShowEditForm(true)
    setShowAddForm(false)
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target
    if (name === 'tagname') {
      const slug = value
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
      setEditForm((prev) => ({
        ...prev,
        tagname: value,
        tagslug: slug,
      }))
    } else {
      setEditForm((prev) => ({ ...prev, [name]: value }))
    }
  }

  // 🔹 Edit Submit
  const handleEditSubmit = async () => {
    try {
      // PUT request to update tag by ID
      const res = await axios.put(
        `https://udemandme.cloud/api/tagupdate/${editForm.id}`,
        editForm,
        {
          headers: { 'Content-Type': 'application/json' },
        },
      )

      if (res.data.success) {
        toast.success('Blog Tag updated successfully!')
        setShowEditForm(false) // Hide edit form
        fetchAlltags() // Refresh the table after update
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update Blog Tag ❌')
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedRows.length === 0) return toast.warning('Select Blog Tags to Delete')

    const confirmed = await Swal.fire({
      title: 'Are you sure?',
      text: `This will delete ${selectedRows.length} selected  Blog Tags!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete all!',
    })

    if (!confirmed.isConfirmed) return

    try {
      // 1️⃣ Backend delete
      await Promise.all(
        selectedRows.map((tag) => axios.delete(`https://udemandme.cloud/api/deletetag/${tag._id}`)),
      )

      // 2️⃣ Frontend update
      setAlltags((prev) => {
        const updated = prev.filter((b) => !selectedRows.some((sel) => sel._id === b._id))

        // 3️⃣ Pagination fix
        const newTotalPages = Math.ceil(updated.length / blogsPerPage)
        if (currentPage > newTotalPages) {
          setCurrentPage(newTotalPages > 0 ? newTotalPages : 1)
        }

        return updated
      })

      setSelectedRows([])
      toast.success('Selected Tag deleted successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete selected Blog Tag ❌')
    }
  }

  // ✅ Checkbox select all
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(currentBlogs)
    } else {
      setSelectedRows([])
    }
  }

  // ✅ Checkbox select single
  const handleCheckboxChange = (setAlltags) => {
    if (selectedRows.some((r) => r._id === setAlltags._id)) {
      setSelectedRows(selectedRows.filter((r) => r._id !== setAlltags._id))
    } else {
      setSelectedRows([...selectedRows, setAlltags])
    }
  }

  return (
    <CRow className="g-4">
      <ToastContainer position="top-right" autoClose={3000} />
      <CCol xs={12} className="d-flex justify-content-between align-items-center">
        <h4 className="fw-bold mb-0 d-flex align-items-center gap-2">
          {showAddForm ? 'Add Blog Tag' : showEditForm ? 'Edit Blog Tag' : 'Blog Tag List'}
          {!showAddForm && !showEditForm && (
            <span
              className="badge"
              style={{ background: '#5856d6', fontSize: '0.9rem', padding: '8px 12px' }}
            >
              {alltsgs.length === 1 ? `Blog (${alltsgs.length})` : `Total Tags ${alltsgs.length}`}
            </span>
          )}
        </h4>
        <div className="d-flex gap-2">
          {!showAddForm && !showEditForm && (
            <>
              <div className="flex-grow-1 d-flex  justify-content-end">
                <input
                  type="text"
                  placeholder="Search Tag..."
                  className="form-control"
                  style={{ maxWidth: '500px', height: '33px' }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {/* Filter + Buttons */}

              <CButton
                size="sm"
                variant="outline"
                className="d-flex align-items-center gap-1 rounded-sm custom-hover-danger"
                color="danger"
                onClick={handleDeleteSelected}
              >
                <FaTrash />
                Delete
              </CButton>
              <CButton
                style={{
                  height: '32px',
                  width: '150px',
                  padding: '4px 12px',
                  fontSize: '14px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                color="primary"
                onClick={() => setShowAddForm(true)}
              >
                + Add Blog Tag
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
                  <label className="form-label ">Tag Name</label>
                  <CInputGroup>
                    <CInputGroupText>
                      <FaList />
                    </CInputGroupText>
                    <CFormInput
                      name="tagname"
                      placeholder="Enter Tag Name"
                      value={addForm.tagname}
                      onChange={handleAddChange}
                    />
                  </CInputGroup>
                </CCol>
                <CCol className="mb-3" md={6}>
                  <label className="form-label ">Tag Slug</label>
                  <CInputGroup>
                    <CInputGroupText>
                      <FaTag />
                    </CInputGroupText>
                    <CFormInput
                      name="tagslug"
                      placeholder="Tag slug"
                      value={addForm.tagslug}
                      onChange={handleAddChange}
                      readOnly
                    />
                  </CInputGroup>
                </CCol>

                <ReactQuill
                  theme="snow"
                  value={addForm.tagparagraph}
                  onChange={(value) => setAddForm((prev) => ({ ...prev, tagparagraph: value }))}
                  placeholder="Write a Tag description..."
                  style={{ height: '150px', marginBottom: '50px' }}
                />
                <CCol xs={12} className="d-flex gap-2">
                  <CButton color="primary" onClick={handleAddSubmit}>
                    Submit
                  </CButton>
                  <CButton color="danger" className="text-white" onClick={handleCancel}>
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
                {/* Blog Title */}
                <CCol md={6} className="mb-3">
                  <label className="form-label">Tag Name</label>
                  <CInputGroup>
                    <CInputGroupText>
                      <FaList />
                    </CInputGroupText>
                    <CFormInput
                      name="tagname"
                      placeholder="Enter Tag Name Name"
                      value={editForm.tagname}
                      onChange={handleEditChange}
                    />
                  </CInputGroup>
                </CCol>
                {/* Slug */}
                <CCol md={6} className="mb-3">
                  <label className="form-label">Tag Slug</label>
                  <CInputGroup>
                    <CInputGroupText>
                      <FaTag />
                    </CInputGroupText>
                    <CFormInput
                      name="tagslug"
                      placeholder="Enter Tag Slug"
                      value={editForm.tagslug}
                      onChange={handleEditChange}
                    />
                  </CInputGroup>
                </CCol>

                {/* Description */}
                <CCol md={12} className="mb-3">
                  <label className="form-label">Tag Description</label>
                  <ReactQuill
                    theme="snow"
                    value={editForm.tagparagraph}
                    onChange={(value) => setEditForm((prev) => ({ ...prev, tagparagraph: value }))}
                    placeholder="Write a Tag description..."
                    style={{ height: '150px', marginBottom: '50px' }}
                  />
                </CCol>
                {/* Status */}
                {/* Submit */}
                <CCol xs={12} className="d-flex gap-2">
                  <CButton color="primary" onClick={handleEditSubmit}>
                    Update Tag
                  </CButton>

                  <CButton
                    color="danger"
                    className="text-white"
                    onClick={() => {
                      setShowEditForm(false)
                      setShowAddForm(false)
                    }}
                  >
                    Cancel
                  </CButton>
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        </CCol>
      )}
      {/* Product List */}
      {!showAddForm && !showEditForm && (
        <CCol xs={12}>
          <CCard>
            <CCardBody>
              <CTable striped hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>
                      <input
                        type="checkbox"
                        checked={selectedRows.length === currentBlogs.length}
                        onChange={handleSelectAll}
                      />
                    </CTableHeaderCell>
                    <CTableHeaderCell>ID</CTableHeaderCell>

                    <CTableHeaderCell>Tag Name</CTableHeaderCell>
                    <CTableHeaderCell>Tag Slug</CTableHeaderCell>
                    <CTableHeaderCell>Tag Date</CTableHeaderCell>
                    <CTableHeaderCell className="text-end">Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {currentBlogs.map((p, index) => (
                    <CTableRow key={p._id}>
                      <CTableDataCell>
                        <input
                          type="checkbox"
                          checked={selectedRows.some((r) => r._id === p._id)}
                          onChange={() => handleCheckboxChange(p)}
                        />
                      </CTableDataCell>

                      <CTableDataCell>{indexOfFirstBlog + index + 1}</CTableDataCell>
                      <CTableDataCell>{p.tagname}</CTableDataCell>
                      <CTableDataCell>{p.tagslug}</CTableDataCell>

                      <CTableDataCell>{new Date(p.createdAt).toLocaleDateString()}</CTableDataCell>

                      <CTableDataCell className="text-end d-flex gap-2 justify-content-end">
                        <CButton
                          size="sm"
                          color="success"
                          variant="outline"
                          className="d-flex align-items-center gap-1 rounded-sm custom-hover-success"
                          onClick={() => handleEditClick(p)}
                        >
                          <FaEdit /> Edit
                        </CButton>

                        <CButton
                          size="sm"
                          color="danger"
                          variant="outline"
                          className="d-flex align-items-center gap-1 rounded-sm custom-hover-danger"
                          onClick={() => handleDelete(p._id)}
                        >
                          <FaTrash /> Delete
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
export default Tags
