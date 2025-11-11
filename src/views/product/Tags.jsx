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
} from '@coreui/react'
import { FaList, FaTag, FaEdit, FaTrash, FaInfoCircle } from 'react-icons/fa'
import { ToastContainer, toast } from 'react-toastify'
import Swal from 'sweetalert2'
import 'react-toastify/dist/ReactToastify.css'

const Tags = () => {
  const [categories, setCategories] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [selectedRows, setSelectedRows] = useState([])
  const [csvFile, setCsvFile] = useState(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    limit: 20,
    total: 0,
  })

  const [addForm, setAddForm] = useState({
    name: '',
    slug: '',
    description: '',
  })

  const [editForm, setEditForm] = useState({
    id: '',
    name: '',
    slug: '',
    description: '',
  })

  const API_URL = 'http://udemandme.cloud/api/tags'

  const fetchTags = async (page = 1, limit = 20, search = searchTerm) => {
    try {
      const params = new URLSearchParams({ page, limit })

      if (search.trim() !== '') {
        params.append('search', search.trim())
      }

      const res = await axios.get(`${API_URL}?${params.toString()}`)

      setCategories(res.data.data || [])
      setPagination({
        page: res.data.page || 1,
        pages: res.data.totalPages || 1,
        limit: res.data.limit || limit,
        total: res.data.total || 0,
      })
    } catch (err) {
      setCategories([])
      setPagination({ page: 1, pages: 1, limit: 20, total: 0 })
      toast.error('Failed to fetch tags')
    }
  }

  useEffect(() => {
    fetchTags(1, pagination.limit, searchTerm)
  }, [searchTerm])

  const generateSlug = (text) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/&/g, '-and-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
  }

  const handleAddChange = (e) => {
    const { name, value } = e.target

    if (name === 'name') {
      setAddForm((prev) => ({
        ...prev,
        name: value,
        slug: generateSlug(value),
      }))
    } else {
      setAddForm((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target

    if (name === 'name') {
      setEditForm((prev) => ({
        ...prev,
        name: value,
        slug: generateSlug(value),
      }))
    } else {
      setEditForm((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleAddSubmit = async () => {
    const { name, slug } = addForm
    if (!name || !slug) {
      toast.error('Please fill all required fields!')
      return
    }

    try {
      const res = await axios.post(API_URL, addForm)
      setCategories([...categories, res.data.data])

      toast.success('Tag added successfully!')
      setAddForm({ name: '', slug: '', description: '' })
      setShowAddForm(false)
      fetchTags(pagination.page)
    } catch (err) {
      toast.error('Failed to add tag')
    }
  }

  const handleEditSubmit = async () => {
    const { id, name, slug, description } = editForm
    if (!name || !slug) {
      toast.error('Please fill all required fields!')
      return
    }

    try {
      const res = await axios.put(`${API_URL}/edit/${id}`, { name, slug, description })

      // Use res.data.data (the actual tag)
      const updatedTag = res.data.data

      setCategories(categories.map((cat) => (cat._id === id ? updatedTag : cat)))

      toast.success('Tag updated successfully!')
      setShowEditForm(false)
      fetchTags(pagination.page)
    } catch (err) {
      console.error('Update error:', err.response?.data || err.message)
      toast.error('Failed to update tag')
    }
  }

  const handleEditClick = (cat) => {
    setEditForm({
      id: cat._id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
    })
    setShowEditForm(true)
    setShowAddForm(false)
  }

  const refreshTable = async (page = pagination.page) => {
    try {
      const params = new URLSearchParams({ page, limit: pagination.limit })
      if (searchTerm.trim() !== '') params.append('search', searchTerm.trim())

      const res = await axios.get(`${API_URL}?${params.toString()}`)

      if (res.data.data.length === 0 && page > 1) {
        return refreshTable(page - 1)
      }

      setCategories(res.data.data || [])
      setPagination({
        page: res.data.page || 1,
        pages: res.data.totalPages || 1,
        limit: res.data.limit || pagination.limit,
        total: res.data.total || 0,
      })
    } catch (err) {
      toast.error('Failed to refresh data!')
    }
  }

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This will permanently delete the Tag!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    })

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_URL}/${id}`)
        toast.success('Tag successfully deleted!')
        refreshTable()
      } catch (err) {
        toast.error('Failed to delete tag!')
      }
    }
  }

  // Select all tags
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(categories.map((cat) => cat._id)) // store only _id list
    } else {
      setSelectedRows([])
    }
  }

  // Toggle one row
  const handleCheckboxChange = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id))
    } else {
      setSelectedRows([...selectedRows, id])
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedRows.length === 0) {
      toast.warning('Please select at least one tag to delete!')
      return
    }

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `This will permanently delete ${selectedRows.length} tag(s)!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete all!',
    })

    if (result.isConfirmed) {
      try {
        for (const id of selectedRows) {
          await axios.delete(`${API_URL}/${id}`)
        }
        setSelectedRows([])
        toast.success('Selected tags deleted!')
        refreshTable() // 🔥 refresh pagination correctly
      } catch (err) {
        toast.error('Failed to delete selected tags!')
      }
    }
  }

  const handleCSVChange = (e) => {
    setCsvFile(e.target.files[0])
  }

  const handleCSVUpload = async () => {
    if (!csvFile) {
      toast.error('Please select a CSV file first!')
      return
    }

    const formData = new FormData()
    formData.append('file', csvFile)

    try {
      await axios.post('http://udemandme.cloud/api/tags/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      toast.success('CSV imported successfully!')
      setCsvFile(null)
      fetchTags(pagination.page) // refresh list after upload
    } catch (err) {
      console.error('CSV Import Error:', err.response?.data || err.message)
      toast.error('Failed to import CSV!')
    }
  }

  return (
    <CRow className="g-4">
      <ToastContainer position="top-right" autoClose={3000} />
      <CCol xs={12} className="d-flex justify-content-between align-items-center">
        <h4 className="fw-bold mb-0">
          {showAddForm ? 'Add Tags' : showEditForm ? 'Edit Tags' : 'Tags List'}
          <small style={{ fontSize: '12px' }}>&nbsp;&nbsp;({pagination.total} Tags)</small>
        </h4>
        <div className="d-flex gap-2">
          {!showAddForm && !showEditForm && (
            <>
              {/* <input
    type="file"
    accept=".csv"
    onChange={handleCSVChange}
    style={{ fontSize: "14px" }}
  />
  <CButton size="sm" color="secondary" onClick={handleCSVUpload}>
    Import CSV
  </CButton> */}

              <CInputGroup className="w-auto">
                <CFormInput
                  type="text"
                  placeholder="Search tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </CInputGroup>

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
              <CButton
                color="primary"
                style={{
                  height: '32px',
                  width: '150px',
                  padding: '4px 12px',
                  fontSize: '14px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                onClick={() => {
                  setShowAddForm(true)
                  setShowEditForm(false)
                }}
              >
                + Add Tags
              </CButton>
            </>
          )}

          {/* Add Category Button (Always visible) */}
        </div>
      </CCol>

      {/* Add Form */}
      {showAddForm && (
        <CCol xs={12}>
          <CCard>
            <CCardBody>
              <CRow>
                <CCol md={6} className="mb-3">
                  <label className="form-label fw-semibold">Tag Name</label>
                  <CInputGroup>
                    <CInputGroupText>
                      <FaList />
                    </CInputGroupText>
                    <CFormInput
                      name="name"
                      value={addForm.name}
                      onChange={handleAddChange}
                      placeholder="Enter tag name"
                    />
                  </CInputGroup>
                </CCol>
                <CCol md={6} className="mb-3">
                  <label className="form-label fw-semibold">Tag Slug</label>
                  <CInputGroup>
                    <CInputGroupText>
                      <FaTag />
                    </CInputGroupText>
                    <CFormInput
                      name="slug"
                      placeholder="Slug auto-generated"
                      value={addForm.slug}
                      disabled
                    />
                  </CInputGroup>
                </CCol>
                <CCol md={12} className="mb-3">
                  <label className="form-label fw-semibold">Description</label>
                  <CInputGroup>
                    <CInputGroupText>
                      <FaInfoCircle />
                    </CInputGroupText>
                    <textarea
                      className="form-control"
                      name="description"
                      value={addForm.description}
                      onChange={handleAddChange}
                      rows={3}
                      placeholder="Enter description"
                    ></textarea>
                  </CInputGroup>
                </CCol>
                <CCol xs={12}>
                  <CButton color="primary" onClick={handleAddSubmit}>
                    Submit
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
                  <label className="form-label fw-semibold">Tag Name</label>
                  <CInputGroup>
                    <CInputGroupText>
                      <FaList />
                    </CInputGroupText>
                    <CFormInput name="name" value={editForm.name} onChange={handleEditChange} />
                  </CInputGroup>
                </CCol>
                <CCol md={6} className="mb-3">
                  <label className="form-label fw-semibold">Tag Slug</label>
                  <CInputGroup>
                    <CInputGroupText>
                      <FaTag />
                    </CInputGroupText>
                    <CFormInput
                      name="slug"
                      placeholder="Slug auto-generated"
                      value={editForm.slug}
                      disabled
                    />
                  </CInputGroup>
                </CCol>
                <CCol md={12} className="mb-3">
                  <label className="form-label fw-semibold">Description</label>
                  <CInputGroup>
                    <CInputGroupText>
                      <FaInfoCircle />
                    </CInputGroupText>
                    <textarea
                      className="form-control"
                      name="description"
                      value={editForm.description}
                      onChange={handleEditChange}
                      rows={3}
                    ></textarea>
                  </CInputGroup>
                </CCol>
                <CCol xs={12}>
                  <CButton color="primary" onClick={handleEditSubmit}>
                    Update
                  </CButton>
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        </CCol>
      )}

      {/* Brand List */}
      {!showAddForm && !showEditForm && (
        <CCol xs={12}>
          <CCard>
            <CCardBody>
              <CTable striped hover>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>
                      <input
                        type="checkbox"
                        checked={selectedRows.length === categories.length && categories.length > 0}
                        onChange={handleSelectAll}
                      />
                    </CTableHeaderCell>
                    <CTableHeaderCell>Name</CTableHeaderCell>
                    <CTableHeaderCell>Slug</CTableHeaderCell>
                    <CTableHeaderCell>Description</CTableHeaderCell>
                    <CTableHeaderCell className="text-end">Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {categories.map((cat, _id) => (
                    <CTableRow key={cat._id}>
                      <CTableDataCell>
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(cat._id)}
                          onChange={() => handleCheckboxChange(cat._id)}
                        />
                      </CTableDataCell>

                      <CTableDataCell>{cat.name}</CTableDataCell>
                      <CTableDataCell>{cat.slug}</CTableDataCell>
                      <CTableDataCell>{cat.description}</CTableDataCell>
                      <CTableDataCell className="text-end d-flex gap-2 justify-content-end">
                        <CButton
                          size="sm"
                          color="success"
                          variant="outline"
                          className="d-flex align-items-center gap-1 rounded-sm custom-hover-success"
                          onClick={() => handleEditClick(cat)}
                        >
                          <FaEdit />
                          <span>Edit</span>
                        </CButton>

                        <CButton
                          size="sm"
                          color="danger"
                          variant="outline"
                          onClick={() => handleDelete(cat._id)}
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
            </CCardBody>
          </CCard>

          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              Showing {categories.length} of {pagination?.total || 0} Tags
            </div>

            <div className="d-flex gap-1 mt-2">
              {/* Previous Button */}
              <CButton
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => fetchTags(pagination.page - 1, pagination.limit, searchTerm)}
              >
                Previous
              </CButton>

              {/* Smart Pagination Window */}
              {(() => {
                const pages = []
                const totalPages = pagination.pages
                const currentPage = pagination.page
                const windowSize = 2 // how many pages to show left/right of current

                let startPage = Math.max(1, currentPage - windowSize)
                let endPage = Math.min(totalPages, currentPage + windowSize)

                // Always show first page
                if (startPage > 1) {
                  pages.push(
                    <CButton
                      key={1}
                      size="sm"
                      color={currentPage === 1 ? 'primary' : 'light'}
                      onClick={() => fetchTags(1, pagination.limit, searchTerm)}
                    >
                      1
                    </CButton>,
                  )
                  if (startPage > 2) {
                    pages.push(<span key="start-ellipsis">...</span>)
                  }
                }

                // Middle pages
                for (let i = startPage; i <= endPage; i++) {
                  pages.push(
                    <CButton
                      key={i}
                      size="sm"
                      color={currentPage === i ? 'primary' : 'light'}
                      onClick={() => fetchTags(i, pagination.limit, searchTerm)}
                    >
                      {i}
                    </CButton>,
                  )
                }

                // Always show last page
                if (endPage < totalPages) {
                  if (endPage < totalPages - 1) {
                    pages.push(<span key="end-ellipsis">...</span>)
                  }
                  pages.push(
                    <CButton
                      key={totalPages}
                      size="sm"
                      color={currentPage === totalPages ? 'primary' : 'light'}
                      onClick={() => fetchTags(totalPages, pagination.limit, searchTerm)}
                    >
                      {totalPages}
                    </CButton>,
                  )
                }

                return pages
              })()}

              {/* Next Button */}
              <CButton
                size="sm"
                disabled={pagination.page >= pagination.pages}
                onClick={() => fetchTags(pagination.page + 1, pagination.limit, searchTerm)}
              >
                Next
              </CButton>
            </div>
          </div>
        </CCol>
      )}
    </CRow>
  )
}

export default Tags
