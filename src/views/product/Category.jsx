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
  CForm,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormCheck,
} from '@coreui/react'
import { FaList, FaTag, FaEdit, FaTrash, FaInfoCircle, FaFileExport } from 'react-icons/fa'
import { ToastContainer, toast } from 'react-toastify'
import Swal from 'sweetalert2'
import 'react-toastify/dist/ReactToastify.css'
const Category = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [selectedRows, setSelectedRows] = useState([])
  const [visible, setVisible] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [totalCategories, setTotalCategories] = useState(0)
  const limit = 20
  const [searchTerm, setSearchTerm] = useState('')
  const [isSuperParent, setIsSuperParent] = useState(false) // Checkbox state

  // Parent categories lazy-load state (place near other useState)
  const [parentCategories, setParentCategories] = useState([])
  const [parentPage, setParentPage] = useState(1)
  const [parentTotalPages, setParentTotalPages] = useState(1)
  const [parentLoading, setParentLoading] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const [addForm, setAddForm] = useState({
    name: '',
    slug: '',
    description: '',
    parentCategory: '',
    image: null,
    imageFile: null,
    isSuperParent: false,
  })
  const [editForm, setEditForm] = useState({
    name: '',
    slug: '',
    description: '',
    image: null,
    count: '',
    isSuperParent: false,
  })
  const slugify = (text) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[\s\W-]+/g, '-')
  }
  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const imageUrl = URL.createObjectURL(file)
      setAddForm((prev) => ({
        ...prev,
        image: imageUrl, // for preview
        imageFile: file, // for upload
      }))
    }
  }
  const handleEditImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const imageUrl = URL.createObjectURL(file)
      setEditForm((prev) => ({
        ...prev,
        image: imageUrl, // preview in UI
        imageFile: file, // to send to backend
      }))
    }
  }
  const fetchCategories = async (pageNumber = 1) => {
    try {
      setLoading(true)
      const res = await axios.get('http://udemandme.cloud/api/categories', {
        params: {
          page: pageNumber,
          limit,
          search: searchTerm.trim() || undefined,
        },
      })
      setCategories(res.data.data || [])
      setTotalCategories(res.data.pagination.total || 0)
      setPages(res.data.pagination.pages || 1)
      setPage(res.data.pagination.page || 1)
    } catch (err) {
      console.error('Error fetching categories:', err)
      toast.error('Failed to load categories!')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    fetchCategories()
  }, [])
  const handleAddChange = (e) => {
    const { name, value } = e.target
    setAddForm((prev) => {
      let updated = { ...prev, [name]: value }
      if (name === 'name') {
        updated.slug = slugify(value)
      }
      return updated
    })
  }
  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditForm((prev) => {
      let updated = { ...prev, [name]: value }
      if (name === 'name') {
        updated.slug = slugify(value)
      }
      return updated
    })
  }
  const handleAddSubmit = async () => {
    const { name, slug, description, parentCategory, cat_status, isSuperParent } = addForm
    if (!name || !slug) {
      toast.error('Please fill all required fields!')
      return
    }
    try {
      const formData = new FormData()
      formData.append('name', name)
      formData.append('slug', slug)
      formData.append('description', description || '')
      formData.append('cat_parent', parentCategory || '')
      formData.append('cat_status', cat_status !== undefined ? cat_status : 1)
      formData.append('cat_superparent', isSuperParent ? 1 : 0)
      // If image is selected, append it
      if (addForm.imageFile) {
        formData.append('cat_img', addForm.imageFile)
      }
      const res = await axios.post('http://udemandme.cloud/api/categories', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      // Update UI
      setCategories([res.data.data, ...categories])
      toast.success('Category added successfully!')
      setAddForm({
        name: '',
        slug: '',
        description: '',
        parentCategory: '',
        image: null,
        imageFile: null,
        cat_status: 1,
        isSuperParent: false,
      })
      setShowAddForm(false)
    } catch (err) {
      console.error('Add category error:', err)
      toast.error(err.response?.data?.message || 'Failed to add category')
    }
  }
  const handleEditClick = (category) => {
    setEditForm({
      _id: category._id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      cat_parent: category.cat_parent,
      cat_status: category.cat_status,
      image: category.cat_img
        ? `http://udemandme.cloud/uploads/category/${category.cat_img}`
        : null,
      imageFile: null,
      isSuperParent: category.cat_superparent || false,
    })
    setShowEditForm(true)
  }
  const handleEditSubmit = async () => {
    if (!editForm._id) {
      toast.error('Category ID is missing')
      return
    }
    const formData = new FormData()
    formData.append('name', editForm.name)
    formData.append('slug', editForm.slug)
    formData.append('description', editForm.description || '')
    formData.append('cat_parent', editForm.cat_parent || '')
    formData.append('cat_status', editForm.cat_status ?? 1)

    // Convert checkbox to 1/0 and log it
    const superParentValue = editForm.isSuperParent ? 1 : 0
    console.log('Super Parent value to send:', superParentValue)
    formData.append('cat_superparent', superParentValue)

    if (editForm.imageFile) {
      formData.append('cat_img', editForm.imageFile)
    }
    try {
      const res = await fetch(`http://udemandme.cloud/api/categories/edit/${editForm._id}`, {
        method: 'PUT',
        body: formData,
      })
      let data = {}
      try {
        data = await res.json()
      } catch {
        // ignore parse errors (server may not return JSON on 500)
      }
      if (res.ok) {
        toast.success(data.message || 'Category updated successfully!')
        // TODO: trigger refresh of categories list if needed
      } else if (res.status === 400 && data.message?.toLowerCase().includes('slug')) {
        toast.error(data.message || 'Duplicate slug, please try a different name')
      } else {
        toast.error(data.message || 'Failed to update category')
      }
    } catch (err) {
      console.error('Edit category error:', err)
      toast.error('Server error during update')
    }
  }
  const handleDelete = async (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This will permanently delete the category!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`http://udemandme.cloud/api/categories/${id}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
          })
          if (!res.ok) {
            const errorData = await res.json()
            throw new Error(errorData.message || 'Failed to delete')
          }
          toast.success('Category successfully deleted!')
          // refresh page from backend
          fetchCategories(page)
        } catch (error) {
          console.error('Error deleting category:', error)
          toast.error(error.message || 'Error deleting category')
        }
      }
    })
  }
  const handleStatusChange = async (id, newStatus) => {
    newStatus = Number(newStatus)
    const res = await fetch(`http://udemandme.cloud/api/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cat_status: newStatus }),
    })
    if (!res.ok) throw new Error('Failed to update status')
    setCategories(categories.map((c) => (c._id === id ? { ...c, cat_status: newStatus } : c)))
    toast.success('Category status updated!')
  }
  const handleBulkStatusChange = async (value) => {
    const newStatus = Number(value)
    if (selectedRows.length === 0) {
      toast.warning('No categories selected')
      return
    }
    try {
      await Promise.all(
        selectedRows.map((cat) =>
          fetch(`http://udemandme.cloud/api/categories/${cat._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cat_status: newStatus }),
          }),
        ),
      )
      setCategories(
        categories.map((c) =>
          selectedRows.some((s) => s._id === c._id) ? { ...c, cat_status: newStatus } : c,
        ),
      )
      setSelectedRows([])
      toast.success(`Status updated for ${selectedRows.length} categories`)
    } catch (e) {
      console.error(e)
      toast.error('Failed to update some categories')
    }
  }
  const handleSelectAll = () => {
    if (selectedRows.length === categories.length) {
      setSelectedRows([])
    } else {
      setSelectedRows(categories)
    }
  }
  const handleCheckboxChange = (cat) => {
    if (selectedRows.some((r) => r._id === cat._id)) {
      setSelectedRows(selectedRows.filter((r) => r._id !== cat._id))
    } else {
      setSelectedRows([...selectedRows, cat])
    }
  }
  const handleDeleteSelected = async () => {
    if (selectedRows.length === 0) {
      toast.warning('No categories selected')
      return
    }
    Swal.fire({
      title: 'Are you sure?',
      text: `This will delete ${selectedRows.length} categories!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete them!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Delete one by one (can optimize later with bulk API)
          await Promise.all(
            selectedRows.map((cat) =>
              fetch(`http://udemandme.cloud/api/categories/${cat._id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
              }),
            ),
          )
          toast.success(`${selectedRows.length} categories deleted!`)
          setCategories(categories.filter((c) => !selectedRows.some((s) => s._id === c._id)))
          setSelectedRows([])
        } catch (error) {
          console.error('Bulk delete error:', error)
          toast.error('Failed to delete some categories')
        }
      }
    })
  }
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    setSelectedFile(file)
  }
  const API_BASE =
    (import.meta?.env?.VITE_API_URL && import.meta.env.VITE_API_URL.trim()) ||
    'http://udemandme.cloud'
  const API_BASE_CLEAN = API_BASE.replace(/\/$/, '')
  // replace your handleSubmit with this
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedFile) {
      toast.error('Please choose a file!')
      return
    }
    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      toast.error('Only CSV files are allowed!')
      return
    }
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      const res = await fetch(`${API_BASE_CLEAN}/api/categories/import`, {
        method: 'POST',
        body: formData,
      })
      let data = {}
      try {
        data = await res.json()
      } catch {
        // no JSON body (e.g., 404/500)
      }
      if (res.ok) {
        toast.success(`Imported: ${data.inserted ?? 0} new, ${data.updated ?? 0} updated`)
        // optionally refresh categories list here
      } else {
        toast.error(data.message || 'Import failed')
      }
    } catch (err) {
      console.error(err)
      toast.error('Server error during import')
    } finally {
      setSelectedFile(null)
      setVisible(false)
    }
  }

  //Check
  const fetchParentCategories = async (page = 1) => {
    try {
      setParentLoading(true)
      const res = await axios.get('http://udemandme.cloud/api/categories', {
        params: { page, limit: 20 },
      })
      const data = res.data?.data || []
      if (page === 1) setParentCategories(data)
      else setParentCategories((prev) => [...prev, ...data])

      setParentPage(res.data?.pagination?.page || page)
      setParentTotalPages(res.data?.pagination?.pages || 1)
    } catch (err) {
      console.error('fetchParentCategories error:', err)
    } finally {
      setParentLoading(false)
    }
  }

  const handleParentScroll = (e) => {
    const target = e.target
    if (target.scrollHeight - target.scrollTop <= target.clientHeight + 5) {
      if (!parentLoading && parentPage < parentTotalPages) {
        fetchParentCategories(parentPage + 1)
      }
    }
  }

  // Load first page on mount
  useEffect(() => {
    fetchParentCategories(1)
  }, [])

  return (
    <CRow className="g-4">
      <ToastContainer position="top-right" autoClose={3000} />
      <CCol xs={12} className="d-flex justify-content-between align-items-center">
        <h4 className="fw-bold mb-0">
          {showAddForm ? 'Add Category' : showEditForm ? 'Edit Category' : 'Category List'}
          <small style={{ fontSize: '12px' }}>&nbsp;&nbsp;({totalCategories} Categories)</small>
        </h4>
        <div className="d-flex gap-2">
          {!showAddForm && !showEditForm && (
            <>
              <input
                type="text"
                className="form-control"
                placeholder="Search categories..."
                style={{ width: '20%' }}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  fetchCategories(1)
                }}
              />
              {/* Export Button */}
              <CButton
                color="info"
                variant="outline"
                size="sm"
                onClick={() => setVisible(true)}
                className="d-flex align-items-center gap-1 rounded-sm"
              >
                <FaFileExport />
                Import
              </CButton>
              {/* Existing Modal Code */}
              <CModal visible={visible} onClose={() => setVisible(false)}>
                <CForm onSubmit={handleSubmit}>
                  <CModalHeader>
                    <CModalTitle>Import File</CModalTitle>
                  </CModalHeader>
                  <CModalBody>
                    <label className="form-label fw-semibold">Choose File</label>
                    <CFormInput type="file" onChange={handleFileChange} accept=".csv" />
                    {selectedFile && (
                      <div className="mt-2 text-success">Selected: {selectedFile.name}</div>
                    )}
                  </CModalBody>
                  <CModalFooter>
                    <CButton color="secondary" onClick={() => setVisible(false)}>
                      Cancel
                    </CButton>
                    <CButton color="success" type="submit">
                      Submit
                    </CButton>
                  </CModalFooter>
                </CForm>
              </CModal>
              {/* Dropdown for Status */}
              <div className="CTableDataCell">
                <select
                  className="form-select form-select-sm"
                  onChange={(e) => {
                    handleBulkStatusChange(e.target.value)
                    e.target.value = ''
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>
                    Change Status
                  </option>
                  <option value="1">Activate</option>
                  <option value="0">Deactivate</option>
                </select>
              </div>
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
                + Add Category
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
                {/* Category Name */}
                <CCol className="mb-3" md={6}>
                  <label className="form-label fw-semibold">Category Name</label>
                  <CInputGroup>
                    <CInputGroupText>
                      <FaList />
                    </CInputGroupText>
                    <CFormInput
                      name="name"
                      placeholder="Enter category name"
                      value={addForm.name}
                      onChange={handleAddChange}
                      required
                    />
                  </CInputGroup>
                </CCol>
                {/* Category Slug */}
                <CCol className="mb-3" md={6}>
                  <label className="form-label fw-semibold">Category Slug</label>
                  <CInputGroup>
                    <CInputGroupText>
                      <FaTag />
                    </CInputGroupText>
                    <CFormInput
                      name="slug"
                      placeholder="Category slug"
                      value={addForm.slug}
                      disabled
                    />
                  </CInputGroup>
                </CCol>
                {/* Category Image */}
                <CCol className="mb-3" md={6}>
                  <label className="form-label fw-semibold">Category Image</label>
                  <CFormInput
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload} // updated to store imageFile
                  />
                  {addForm.image && (
                    <img
                      src={addForm.image}
                      alt="preview"
                      className="mt-2"
                      style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '6px',
                      }}
                    />
                  )}
                </CCol>
                {/* Parent Category */}

                {/* Parent Category */}

                <CCol xs={12} md={6} className="mb-3" style={{ position: 'relative' }}>
                  <label className="form-label fw-semibold">Parent Category</label>

                  <div
                    style={{
                      border: '1px solid #ced4da',
                      borderRadius: '0.375rem',
                      cursor: 'pointer',
                      background: '#fff',
                    }}
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    <div style={{ padding: '8px' }}>
                      {addForm.parentCategory
                        ? parentCategories.find((c) => c.cat_id === addForm.parentCategory)?.name
                        : 'Select Parent Category'}
                    </div>
                  </div>

                  {dropdownOpen && (
                    <div
                      style={{
                        position: 'absolute',
                        width: '100%',
                        maxHeight: '200px',
                        overflowY: 'auto',
                        border: '1px solid #ced4da',
                        borderRadius: '0.375rem',
                        background: '#fff',
                        zIndex: 1000,
                      }}
                      onScroll={(e) => {
                        const target = e.target
                        if (
                          target.scrollHeight - target.scrollTop <= target.clientHeight + 5 &&
                          !parentLoading &&
                          parentPage < parentTotalPages
                        ) {
                          fetchParentCategories(parentPage + 1)
                        }
                      }}
                    >
                      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                        {parentCategories.map((cat) => (
                          <li
                            key={cat._id}
                            style={{
                              padding: '8px',
                              background:
                                addForm.parentCategory === cat.cat_id ? '#e9ecef' : '#fff',
                              cursor: 'pointer',
                            }}
                            onClick={() => {
                              setAddForm((prev) => ({ ...prev, parentCategory: cat.cat_id }))
                              setDropdownOpen(false)
                            }}
                          >
                            {cat.name}
                          </li>
                        ))}
                        {parentLoading && (
                          <li style={{ padding: '8px', textAlign: 'center' }}>Loading...</li>
                        )}
                      </ul>
                    </div>
                  )}
                </CCol>

                {/* Category Description */}
                <CCol md={12}>
                  <label className="form-label fw-semibold">Category Description</label>
                  <CInputGroup>
                    <CInputGroupText>
                      <FaInfoCircle />
                    </CInputGroupText>
                    <textarea
                      className="form-control"
                      rows="3"
                      name="description"
                      placeholder="Enter description"
                      value={addForm.description}
                      onChange={handleAddChange}
                    />
                  </CInputGroup>
                </CCol>
                {/* Status */}
                <CCol md={12} className="mb-3">
                  <label className="form-label fw-semibold">Status</label>
                  <select
                    className="form-select"
                    value={addForm.cat_status || 1}
                    onChange={(e) =>
                      setAddForm((prev) => ({
                        ...prev,
                        cat_status: Number(e.target.value),
                      }))
                    }
                  >
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                  </select>
                </CCol>

                {/* Is Super Parent Checkbox */}
                <CCol xs={12} className="mb-3">
                  <CFormCheck
                    type="checkbox"
                    id="isSuperParent"
                    label="Is Super Parent?"
                    checked={addForm.isSuperParent}
                    onChange={(e) => setAddForm({ ...addForm, isSuperParent: e.target.checked })}
                  />
                </CCol>

                {/* Submit Button */}
                <CCol xs={12} className="mt-3">
                  <CButton color="primary" onClick={handleAddSubmit}>
                    Submit Form
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
                {/* Name */}
                <CCol md={6} className="mb-3">
                  <label className="form-label fw-semibold">Category Name</label>
                  <CInputGroup>
                    <CInputGroupText>
                      <FaList />
                    </CInputGroupText>
                    <CFormInput name="name" value={editForm.name} onChange={handleEditChange} />
                  </CInputGroup>
                </CCol>
                {/* Slug */}
                <CCol md={6} className="mb-3">
                  <label className="form-label fw-semibold">Category Slug</label>
                  <CInputGroup>
                    <CInputGroupText>
                      <FaTag />
                    </CInputGroupText>
                    <CFormInput name="slug" value={editForm.slug} disabled />
                  </CInputGroup>
                </CCol>
                {/* Image */}
                <CCol md={6} className="mb-3">
                  <label className="form-label fw-semibold">Category Image</label>
                  <CFormInput type="file" accept="image/*" onChange={handleEditImageUpload} />
                  {editForm.image && (
                    <img
                      src={
                        editForm.imageFile
                          ? URL.createObjectURL(editForm.imageFile)
                          : `${editForm.image}`
                      }
                      alt="preview"
                      className="mt-2"
                      style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '6px',
                      }}
                    />
                  )}
                </CCol>
                {/* Parent Category */}
                <CCol xs={12} md={6} className="mb-3" style={{ position: 'relative' }}>
                  <label className="form-label fw-semibold">Parent Category</label>

                  <div
                    style={{
                      border: '1px solid #ced4da',
                      borderRadius: '0.375rem',
                      cursor: 'pointer',
                      background: '#fff',
                    }}
                    onClick={() => setDropdownOpen((prev) => !prev)}
                  >
                    <div style={{ padding: '8px' }}>
                      {editForm.cat_parent
                        ? parentCategories.find((c) => c.cat_id === editForm.cat_parent)?.name
                        : 'Select Parent Category'}
                    </div>
                  </div>

                  {dropdownOpen && (
                    <div
                      style={{
                        position: 'absolute',
                        width: '100%',
                        maxHeight: '200px',
                        overflowY: 'auto',
                        border: '1px solid #ced4da',
                        borderRadius: '0.375rem',
                        background: '#fff',
                        zIndex: 1000,
                      }}
                      onScroll={(e) => {
                        const target = e.target
                        if (
                          target.scrollHeight - target.scrollTop <= target.clientHeight + 5 &&
                          !parentLoading &&
                          parentPage < parentTotalPages
                        ) {
                          fetchParentCategories(parentPage + 1)
                        }
                      }}
                    >
                      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                        <li
                          style={{ padding: '8px', cursor: 'pointer' }}
                          onClick={() => {
                            setEditForm((prev) => ({ ...prev, cat_parent: '' }))
                            setDropdownOpen(false)
                          }}
                        >
                          Select Parent Category
                        </li>
                        {parentCategories.map((cat) => (
                          <li
                            key={cat._id}
                            style={{
                              padding: '8px',
                              cursor: 'pointer',
                              background: editForm.cat_parent === cat.cat_id ? '#e9ecef' : '#fff',
                            }}
                            onClick={() => {
                              setEditForm((prev) => ({ ...prev, cat_parent: cat.cat_id }))
                              setDropdownOpen(false)
                            }}
                          >
                            {cat.name}
                          </li>
                        ))}
                        {parentLoading && (
                          <li style={{ padding: '8px', textAlign: 'center' }}>Loading...</li>
                        )}
                      </ul>
                    </div>
                  )}
                </CCol>

                {/* Description */}
                <CCol md={12} className="mb-3">
                  <label className="form-label fw-semibold">Description</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  ></textarea>
                </CCol>
                {/* Status */}
                <CCol md={12} className="mb-3">
                  <label className="form-label fw-semibold">Status</label>
                  <select
                    className="form-select"
                    value={editForm.cat_status ?? 1}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        cat_status: Number(e.target.value),
                      }))
                    }
                  >
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                  </select>
                </CCol>

                <CRow className="mb-3">
                  <CCol md={12}>
                    <CFormCheck
                      type="checkbox"
                      id="isSuperParent"
                      label="Set as Super Parent"
                      checked={editForm.isSuperParent || false}
                      onChange={(e) =>
                        setEditForm({ ...editForm, isSuperParent: e.target.checked })
                      }
                    />
                  </CCol>
                </CRow>

                {/* Submit */}
                <CCol xs={12} className="mt-3">
                  <CButton color="primary" onClick={handleEditSubmit}>
                    Update Category
                  </CButton>
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        </CCol>
      )}
      {/* Category List */}
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
                    <CTableHeaderCell>Industry</CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                    <CTableHeaderCell className="text-end">Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {categories.map((cat) => (
                    <CTableRow key={cat._id}>
                      <CTableDataCell>
                        <input
                          type="checkbox"
                          checked={selectedRows.some((r) => r._id === cat._id)}
                          onChange={() => handleCheckboxChange(cat)}
                        />
                      </CTableDataCell>
                      <CTableDataCell>{cat.name}</CTableDataCell>
                      <CTableDataCell>{cat.slug}</CTableDataCell>
                      <CTableDataCell>{cat.cat_superparent_name || 'None'}</CTableDataCell>
                      <CTableDataCell>
                        <select
                          className="form-select form-select-sm"
                          value={cat.cat_status}
                          onChange={(e) => handleStatusChange(cat._id, e.target.value)}
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
              <div className="d-flex justify-content-between align-items-center mt-2">
                <span style={{ fontSize: '12px' }}>
                  Showing {categories.length} of {totalCategories} Categories
                </span>
                <div className="btn-group">
                  <CButton
                    color="secondary"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => fetchCategories(page - 1)}
                  >
                    Previous
                  </CButton>
                  <CButton color="secondary" size="sm" disabled>
                    Page {page} of {pages}
                  </CButton>
                  <CButton
                    color="secondary"
                    size="sm"
                    disabled={page === pages}
                    onClick={() => fetchCategories(page + 1)}
                  >
                    Next
                  </CButton>
                </div>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      )}
    </CRow>
  )
}
export default Category
