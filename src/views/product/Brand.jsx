import React, { useState } from 'react'
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
import { FaList, FaTag, FaEdit, FaTrash, FaImage, FaInfoCircle } from 'react-icons/fa'
import { ToastContainer, toast } from 'react-toastify'
import Swal from 'sweetalert2'
import 'react-toastify/dist/ReactToastify.css'

const generateSlug = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')

const Brand = () => {
  const [categories, setCategories] = useState([
    {
      id: 1,
      name: 'Demo Category',
      slug: 'demo-category',
      description: 'Sample description',
      count: '3',
      image: null,
      status: 'Active',
    },
    {
      id: 2,
      name: 'Another Category',
      slug: 'another-category',
      description: 'Another description',
      count: '5',
      image: null,
      status: 'Inactive',
    },
  ])
  const [statusFilter, setStatusFilter] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [selectedRows, setSelectedRows] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1,
    limit: 20,
  })

  const [addForm, setAddForm] = useState({
    name: '',
    slug: '',
    description: '',
    parentBrand: '', // ✅ use parentBrand only
    image: null,
    imageFile: null,
    status: 1,
  })

  const [editForm, setEditForm] = useState({
    _id: '',
    name: '',
    slug: '',
    description: '',
    parentBrand: '', // ✅ use parentBrand only
    image: null,
    imageFile: null,
    status: 1,
  })

  const handleImageUpload = (e, isEdit = false) => {
    const file = e.target.files[0]
    if (file) {
      const imageUrl = URL.createObjectURL(file)
      if (isEdit) {
        setEditForm((prev) => ({ ...prev, image: imageUrl, imageFile: file }))
      } else {
        setAddForm((prev) => ({ ...prev, image: imageUrl, imageFile: file }))
      }
    }
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
      toast.error('Please fill all fields!')
      return
    }

    try {
      const formData = new FormData()
      formData.append('name', addForm.name)
      formData.append('slug', addForm.slug)
      formData.append('description', addForm.description)
      formData.append('status', addForm.status) // 0 or 1

      if (addForm.parentBrand) {
        formData.append('parentBrand', addForm.parentBrand)
      }

      if (addForm.imageFile) {
        formData.append('brand_img', addForm.imageFile)
      }

      // POST request using axios
      await axios.post('http://udemandme.cloud/api/brands', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      toast.success('Brand Added!')

      // Refresh brand list after adding
      fetchBrands()

      // Reset form + close add form
      setAddForm({
        name: '',
        slug: '',
        description: '',
        image: null,
        imageFile: null,
        parentBrand: '',
        status: 1,
      })
      setShowAddForm(false)
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Failed to add brand')
    }
  }

  const fetchBrands = async (params = {}) => {
    try {
      const query = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || pagination.limit,
        search: params.search || searchTerm,
        status: params.status ?? '',
      }).toString()

      const res = await axios.get(`http://udemandme.cloud/api/brands?${query}`)
      setCategories(res.data.data)
      setPagination(res.data.pagination)
    } catch (err) {
      console.error(err)
      toast.error('Failed to fetch brands')
    }
  }

  React.useEffect(() => {
    fetchBrands()
  }, [])

  const handleEditClick = (brand) => {
    setEditId(brand._id)
    setEditForm({
      name: brand.name,
      slug: brand.slug,
      description: brand.description,
      brand_img: brand.brand_img,
      parentBrand: brand.parentBrand || '',
      status: brand.status,
      imagePreview: null,
      imageFile: null,
    })
    setShowEditForm(true)
    setShowAddForm(false)
  }

  const handleEditSubmit = async () => {
    const { name, slug } = editForm
    if (!name || !slug) {
      toast.error('Please fill all required fields!')
      return
    }

    try {
      const formData = new FormData()
      formData.append('name', editForm.name)
      formData.append('slug', editForm.slug)
      formData.append('description', editForm.description)
      formData.append('status', editForm.status)

      if (editForm.parentBrand) {
        formData.append('parentBrand', editForm.parentBrand)
      }

      // Only send if user picked a new file
      if (editForm.imageFile) {
        formData.append('brand_img', editForm.imageFile) // backend expects brand_img
      }

      await axios.put(`http://udemandme.cloud/api/brands/edit/${editId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      toast.success('Brand updated successfully!')

      // Refresh list
      fetchBrands()

      // Reset state properly
      setEditForm({
        name: '',
        slug: '',
        description: '',
        parentBrand: '',
        status: 1,
        image: null,
        imageFile: null,
        imagePreview: null,
      })

      setShowEditForm(false)
    } catch (err) {
      console.error('Update error:', err)
      toast.error(err.response?.data?.message || 'Failed to update brand')
    }
  }

  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'This will permanently delete the Brand!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
      })

      if (result.isConfirmed) {
        // Send DELETE request to backend
        await axios.delete(`http://udemandme.cloud/api/brands/${id}`)

        // Update UI locally
        setCategories((prev) => prev.filter((cat) => cat._id !== id))

        toast.success('Brand successfully deleted!')
      }
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Failed to delete brand')
    }
  }

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(categories) // select all
    } else {
      setSelectedRows([]) // deselect all
    }
  }

  const handleCheckboxChange = (row) => {
    const exists = selectedRows.some((r) => r._id === row._id)
    setSelectedRows(exists ? selectedRows.filter((r) => r._id !== row._id) : [...selectedRows, row])
  }

  const handleDeleteSelected = async () => {
    if (selectedRows.length === 0) {
      toast.warning('Please select at least one brand to delete!')
      return
    }

    Swal.fire({
      title: 'Are you sure?',
      text: `This will delete ${selectedRows.length} brand(s) permanently!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete all!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Loop over selected rows and delete each one
          for (const brand of selectedRows) {
            await axios.delete(`http://udemandme.cloud/api/brands/${brand._id}`)
          }

          toast.success(`${selectedRows.length} brand(s) deleted successfully!`)

          // Refresh brand list
          fetchBrands()

          // Clear selection
          setSelectedRows([])
        } catch (err) {
          console.error(err)
          toast.error(err.response?.data?.message || 'Failed to delete selected brands')
        }
      }
    })
  }

  const handleStatusFilterChange = async (value) => {
    if (selectedRows.length === 0) return

    const newStatus = Number(value)

    try {
      // Update each selected brand
      await Promise.all(
        selectedRows.map((brand) =>
          axios.put(`http://udemandme.cloud/api/brands/edit/${brand._id}`, {
            status: newStatus,
          }),
        ),
      )

      // Update local state
      setCategories(
        categories.map((cat) =>
          selectedRows.some((s) => s._id === cat._id) ? { ...cat, status: newStatus } : cat,
        ),
      )

      // Show toaster with number of updated brands
      toast.success(`Status updated for ${selectedRows.length} brand(s)`)

      // Clear selection and reset dropdown
      setSelectedRows([])
      setStatusFilter('') // reset dropdown to default
    } catch (err) {
      console.error(err)
      toast.error('Failed to update some brands')
    }
  }

  const handleStatusChange = async (id, newStatus) => {
    try {
      const statusNumber = Number(newStatus)

      // Send PUT request to update status
      await axios.put(`http://udemandme.cloud/api/brands/edit/${id}`, {
        status: statusNumber,
      })

      // Update UI locally
      setCategories((prev) =>
        prev.map((cat) => (cat._id === id ? { ...cat, status: statusNumber } : cat)),
      )

      toast.success('Status updated successfully!')
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Failed to update status')
    }
  }

  return (
    <CRow className="g-4">
      <ToastContainer position="top-right" autoClose={3000} />
      <CCol xs={12} className="d-flex justify-content-between align-items-center">
        <h4 className="fw-bold mb-0">
          {showAddForm ? 'Add Brand' : showEditForm ? 'Edit Brand' : 'Brand List'}

          <small style={{ fontSize: '12px' }}>&nbsp;&nbsp;({pagination.total} Brands)</small>
        </h4>
        <div className="d-flex gap-2">
          {!showAddForm && !showEditForm && (
            <>
              <CFormInput
                size="sm"
                placeholder="Search brands..."
                value={searchTerm}
                onChange={(e) => {
                  const value = e.target.value
                  setSearchTerm(value)

                  clearTimeout(window.searchTimeout)
                  window.searchTimeout = setTimeout(() => {
                    if (value.trim() === '') {
                      // If input is empty, fetch all brands
                      fetchBrands({ search: '' })
                    } else {
                      fetchBrands({ search: value })
                    }
                  }, 300)
                }}
              />

              {/* Dropdown for Status */}
              <div className="CTableDataCell">
                <select
                  className="form-select form-select-sm"
                  value={statusFilter}
                  onChange={(e) => handleStatusFilterChange(e.target.value)}
                >
                  <option value="">Select Status</option>
                  <option value="1">Active</option>
                  <option value="0">Inactive</option>
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
                + Add Brand
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
                <CCol className="mb-3" md={6}>
                  <label className="form-label fw-semibold">Brand Name</label>
                  <CInputGroup>
                    <CInputGroupText>
                      <FaList />
                    </CInputGroupText>
                    <CFormInput
                      name="name"
                      placeholder="Enter Brand Name"
                      value={addForm.name}
                      onChange={handleAddChange}
                    />
                  </CInputGroup>
                </CCol>

                <CCol className="mb-3" md={6}>
                  <label className="form-label fw-semibold">Brand Slug</label>
                  <CInputGroup>
                    <CInputGroupText>
                      <FaTag />
                    </CInputGroupText>
                    <CFormInput
                      name="slug"
                      placeholder="Auto-generated slug"
                      value={addForm.slug}
                      disabled
                    />
                  </CInputGroup>
                </CCol>

                <CCol className="mb-3" md={6}>
                  <label className="form-label fw-semibold">Brand Image</label>
                  <CFormInput type="file" accept="image/*" onChange={(e) => handleImageUpload(e)} />
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
                <CCol className="mb-3" md={6}>
                  <label className="form-label fw-semibold">Parent Brand</label>
                  <select
                    className="form-select"
                    value={addForm.parentBrand || ''}
                    onChange={(e) =>
                      setAddForm((prev) => ({
                        ...prev,
                        parentBrand: e.target.value,
                      }))
                    }
                  >
                    <option value="">Select Parent Brand</option>
                    {categories.map((cat) => (
                      <option key={cat._id || cat._id} value={cat._id || cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </CCol>

                <CCol md={12}>
                  <label className="form-label fw-semibold">Brand Description</label>
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
                    ></textarea>
                  </CInputGroup>
                </CCol>

                <CCol className="mb-3" md={12}>
                  <label className="form-label fw-semibold">Status</label>
                  <select
                    className="form-select"
                    name="status"
                    value={addForm.status}
                    onChange={(e) =>
                      setAddForm((prev) => ({
                        ...prev,
                        status: Number(e.target.value),
                      }))
                    }
                  >
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                  </select>
                </CCol>

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
                {/* Brand Name */}
                <CCol className="mb-3" md={6}>
                  <label className="form-label fw-semibold">Brand Name</label>
                  <CInputGroup>
                    <CInputGroupText>
                      <FaList />
                    </CInputGroupText>
                    <CFormInput
                      name="name"
                      placeholder="Brand Name"
                      value={editForm.name}
                      onChange={handleEditChange}
                    />
                  </CInputGroup>
                </CCol>

                {/* Slug */}
                <CCol className="mb-3" md={6}>
                  <label className="form-label fw-semibold">Brand Slug</label>
                  <CInputGroup>
                    <CInputGroupText>
                      <FaTag />
                    </CInputGroupText>
                    <CFormInput name="slug" value={editForm.slug} disabled />
                  </CInputGroup>
                </CCol>

                {/* Image Upload + Preview */}
                <CCol className="mb-3" md={6}>
                  <label className="form-label fw-semibold">Brand Image</label>
                  <CFormInput
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0]
                      if (file) {
                        setEditForm((prev) => ({
                          ...prev,
                          imageFile: file,
                          imagePreview: URL.createObjectURL(file),
                        }))
                      }
                    }}
                  />
                  {(editForm.imagePreview || editForm.brand_img) && (
                    <img
                      src={
                        editForm.imagePreview
                          ? editForm.imagePreview
                          : `http://udemandme.cloud/uploads/brand/${editForm.brand_img}`
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

                {/* Parent Brand Dropdown */}
                <CCol className="mb-3" md={6}>
                  <label className="form-label fw-semibold">Parent Brand</label>
                  <select
                    className="form-select"
                    value={editForm.parentBrand || ''}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        parentBrand: e.target.value,
                      }))
                    }
                  >
                    <option value="">Select Parent Brand</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </CCol>

                {/* Description */}
                <CCol md={12}>
                  <label className="form-label fw-semibold">Brand Description</label>
                  <CInputGroup>
                    <CInputGroupText>
                      <FaInfoCircle />
                    </CInputGroupText>
                    <textarea
                      className="form-control"
                      rows="3"
                      name="description"
                      placeholder="Brand Description"
                      value={editForm.description}
                      onChange={handleEditChange}
                    ></textarea>
                  </CInputGroup>
                </CCol>

                {/* Status Dropdown */}
                <CCol className="mb-3" md={12}>
                  <label className="form-label fw-semibold">Status</label>
                  <select
                    className="form-select"
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        status: Number(e.target.value),
                      }))
                    }
                  >
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                  </select>
                </CCol>

                <CCol xs={12} className="mt-3">
                  <CButton color="primary" onClick={handleEditSubmit}>
                    Update Brand
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
                        checked={selectedRows.length === categories.length}
                        onChange={handleSelectAll}
                      />
                    </CTableHeaderCell>
                    <CTableHeaderCell>Name</CTableHeaderCell>
                    <CTableHeaderCell>Slug</CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                    <CTableHeaderCell className="text-end">Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {categories.map((cat, _id) => (
                    <CTableRow key={_id}>
                      <CTableDataCell>
                        <input
                          type="checkbox"
                          checked={selectedRows.some((r) => r._id === cat._id)}
                          onChange={() => handleCheckboxChange(cat)}
                        />
                      </CTableDataCell>
                      <CTableDataCell>{cat.name}</CTableDataCell>
                      <CTableDataCell>{cat.slug}</CTableDataCell>
                      <CTableDataCell>
                        <select
                          className="form-select form-select-sm"
                          value={cat.status}
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
              <div className="d-flex justify-content-end align-items-center mt-3 gap-2">
                <div>
                  <span className="text-muted" style={{ fontSize: '12px' }}>
                    Showing {categories.length} of {pagination.total} Categories
                  </span>
                </div>
                <div>
                  <CButton
                    size="sm"
                    disabled={pagination.page <= 1}
                    onClick={() => fetchBrands({ page: pagination.page - 1 })}
                  >
                    Previous
                  </CButton>

                  {[...Array(pagination.pages)].map((_, idx) => (
                    <CButton
                      key={idx + 1}
                      size="sm"
                      color={pagination.page === idx + 1 ? 'primary' : 'light'}
                      onClick={() => fetchBrands({ page: idx + 1 })}
                    >
                      {idx + 1}
                    </CButton>
                  ))}

                  <CButton
                    size="sm"
                    disabled={pagination.page >= pagination.pages}
                    onClick={() => fetchBrands({ page: pagination.page + 1 })}
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

export default Brand
