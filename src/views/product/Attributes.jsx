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

const Attributes = () => {
  const [categories, setCategories] = useState([
    {
      id: 1,
      name: 'Demo Tags',
      slug: 'demo-tags',
      status: 'Active',
    },
    {
      id: 2,
      name: 'Demo Tags',
      slug: 'demo-tags',
      status: 'Inactive',
    },
  ])
  const [items, setItems] = useState([])
  const [selectedRows, setSelectedRows] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showConfigureForm, setShowConfigureForm] = useState(false)
  const [showEditConfigureForm, setShowEditConfigureForm] = useState(false)
  const [selectedBrand, setSelectedBrand] = useState(null)
  const [attributes, setAttributes] = useState([])
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
  })

  const [editForm, setEditForm] = useState({
    name: '',
    slug: '',
  })

  const [itemForm, setItemForm] = useState({
    name: '',
    slug: '',
    description: '',
  })

  const [editItemForm, setEditItemForm] = useState({
    _id: '',
    name: '',
    slug: '',
    description: '',
  })

  const generateSlug = (value) => {
    return value
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
  }

  const handleAddChange = (e) => {
    const { name, value } = e.target

    if (name === 'name') {
      const generatedSlug = value
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')

      setAddForm({ name: value, slug: generatedSlug })
    } else {
      setAddForm((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleEditItemChange = (e) => {
    const { name, value } = e.target

    if (name === 'name') {
      const generatedSlug = value
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')

      setEditItemForm({ ...editItemForm, name: value, slug: generatedSlug })
    } else {
      setEditItemForm((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleItemChange = (e) => {
    const { name, value } = e.target

    if (name === 'name') {
      const generatedSlug = value
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')

      setItemForm({ ...itemForm, name: value, slug: generatedSlug })
    } else {
      setItemForm((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target

    if (name === 'name') {
      const generatedSlug = value
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')

      setEditForm({ name: value, slug: generatedSlug })
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
      // Post new attribute to backend
      await axios.post('https://udemandme.cloud/api/attributes', {
        name,
        slug,
        status: 1, // default active
      })

      toast.success('Attribute added successfully!')

      // Reload attributes from backend
      const { data } = await axios.get('https://udemandme.cloud/api/attributes')
      setCategories(data)

      // Reset form
      setAddForm({ name: '', slug: '' })
      setShowAddForm(false)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error adding attribute')
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get('https://udemandme.cloud/api/attributes')
        setCategories(data) // keep your existing one
        setAttributes(data) // add this line
      } catch (error) {
        toast.error('Failed to load attributes')
      }
    }

    fetchData()
  }, [])

  const handleEditSubmit = async () => {
    const { name, slug } = editForm

    if (!name || !slug) {
      toast.error('Please fill all fields!')
      return
    }

    try {
      // Call backend update API
      await axios.put(`https://udemandme.cloud/api/attributes/${selectedBrand._id}`, {
        name,
        slug,
        status: 1, // keep as is or manage dropdown later
      })

      toast.success('Attribute updated successfully!')

      // reload list
      const { data } = await axios.get('https://udemandme.cloud/api/attributes')
      setCategories(data)

      // reset
      setShowEditForm(false)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating attribute')
    }
  }

  const handleEditClick = (cat) => {
    setEditForm({
      name: cat.name,
      slug: cat.slug,
    })
    setSelectedBrand(cat) // store full object including _id
    setShowEditForm(true)
    setShowAddForm(false)
    setShowConfigureForm(false)
  }

  const handleDelete = async (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This will permanently Delete the Attribute!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`https://udemandme.cloud/api/attributes/${id}`)
          toast.success('Attribute successfully deleted!')

          // Refresh the list
          const { data } = await axios.get('https://udemandme.cloud/api/attributes')
          setCategories(data)
        } catch (error) {
          toast.error(error.response?.data?.message || 'Error deleting attribute')
        }
      }
    })
  }

  // Select All
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(categories) // select all rows
    } else {
      setSelectedRows([]) // unselect all
    }
  }

  // Select Individual Row
  const handleCheckboxChange = (row) => {
    const exists = selectedRows.some((r) => r._id === row._id)

    if (exists) {
      setSelectedRows(selectedRows.filter((r) => r._id !== row._id)) // remove
    } else {
      setSelectedRows([...selectedRows, row]) // add
    }
  }

  const handleDeleteSelected = () => {
    if (selectedRows.length === 0) {
      toast.warning('Please select at least one item to delete!')
      return
    }

    Swal.fire({
      title: 'Are you sure?',
      text: `This will delete ${selectedRows.length} selected attribute(s)!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete all!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Loop through selected rows and delete one by one
          for (const row of selectedRows) {
            await axios.delete(`https://udemandme.cloud/api/attributes/${row._id}`)
          }

          toast.success(`${selectedRows.length} attribute(s) deleted!`)

          // Refresh list
          const { data } = await axios.get('https://udemandme.cloud/api/attributes')
          setCategories(data)
          setSelectedRows([])
        } catch (error) {
          toast.error(error.response?.data?.message || 'Error deleting selected attributes')
        }
      }
    })
  }

  const handleAddItemSubmit = async () => {
    const { name, slug, description } = itemForm

    if (!name || !slug) {
      toast.error('Please fill all required fields!')
      return
    }

    try {
      await axios.post(`https://udemandme.cloud/api/attributes/${selectedBrand._id}/items`, {
        name,
        slug,
        description,
        status: 1, // default active
      })

      toast.success('Item added successfully!')

      // Refresh items list
      fetchItems(selectedBrand._id)

      // Reset form
      setItemForm({ name: '', slug: '', description: '' })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error adding item')
    }
  }

  // Fetch items for selected attribute
  const fetchItems = async (attributeId) => {
    try {
      const { data } = await axios.get(
        `https://udemandme.cloud/api/attributes/${attributeId}/items`,
      )
      setItems(data)
    } catch (error) {
      toast.error('Failed to load items')
    }
  }

  const handleConfigureClick = (brand) => {
    setSelectedBrand(brand)
    setShowConfigureForm(true)
    setShowAddForm(false)
    setShowEditForm(false)

    // Fetch items for this attribute
    fetchItems(brand._id)
  }

  const handleEditItemSubmit = async () => {
    const { _id, name, slug, description } = editItemForm

    if (!name || !slug) {
      toast.error('Please fill all required fields!')
      return
    }

    try {
      await axios.put(`https://udemandme.cloud/api/attributes/${selectedBrand._id}/items/${_id}`, {
        name,
        slug,
        description,
        status: 1,
      })

      toast.success('Item updated successfully!')

      // Refresh items list
      fetchItems(selectedBrand._id)

      // Reset form
      setEditItemForm({ _id: '', name: '', slug: '', description: '' })
      setShowEditConfigureForm(false)
      setShowConfigureForm(true)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating item')
    }
  }

  const handleEditItemClick = (item) => {
    setEditItemForm({
      _id: item._id,
      name: item.name,
      slug: item.slug,
      description: item.description,
    })
    setShowEditConfigureForm(true)
    setShowConfigureForm(false)
  }

  const handleDeleteItem = (itemId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This will permanently delete the item!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(
            `https://udemandme.cloud/api/attributes/${selectedBrand._id}/items/${itemId}`,
          )

          toast.success('Item deleted successfully!')

          // Refresh items list
          const { data } = await axios.get(
            `https://udemandme.cloud/api/attributes/${selectedBrand._id}/items`,
          )
          setItems(data)
        } catch (error) {
          toast.error(error.response?.data?.message || 'Error deleting item')
        }
      }
    })
  }
  return (
    <CRow className="g-4">
      <ToastContainer position="top-right" autoClose={3000} />
      <CCol xs={12} className="d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h4 className="fw-bold mb-0">
          {showAddForm
            ? 'Add Attributes'
            : showEditForm
              ? 'Edit Attributes'
              : showConfigureForm
                ? `Configure Items`
                : 'List Attributes'}
        </h4>

        <div className="d-flex gap-2">
          {!showAddForm && !showEditForm && !showConfigureForm && !showEditConfigureForm && (
            <>
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
                + Add Attributes
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
                <CCol className="mb-3" xs={12} md={6}>
                  <label className="form-label fw-semibold">Attributes Name</label>
                  <CInputGroup>
                    <CInputGroupText>
                      <FaList />
                    </CInputGroupText>
                    <CFormInput
                      name="name"
                      placeholder="Enter Attributes Name"
                      value={addForm.name}
                      onChange={handleAddChange}
                    />
                  </CInputGroup>
                </CCol>

                <CCol className="mb-3" xs={12} md={6}>
                  <label className="form-label fw-semibold">Attributes Slug</label>
                  <CInputGroup>
                    <CInputGroupText>
                      <FaTag />
                    </CInputGroupText>
                    <CFormInput
                      name="slug"
                      placeholder="Attributes Slug"
                      value={addForm.slug}
                      disabled
                    />
                  </CInputGroup>
                </CCol>

                <CCol xs={12} className="mt-3">
                  <CButton color="primary" onClick={handleAddSubmit}>
                    Add Attributes
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
                <CCol className="mb-3" xs={12} md={6}>
                  <label className="form-label fw-semibold">Attributes Name</label>
                  <CInputGroup>
                    <CInputGroupText>
                      <FaList />
                    </CInputGroupText>
                    <CFormInput
                      name="name"
                      placeholder="Attributes Name"
                      value={editForm.name}
                      onChange={handleEditChange}
                    />
                  </CInputGroup>
                </CCol>

                <CCol className="mb-3" xs={12} md={6}>
                  <label className="form-label fw-semibold">Attributes Slug</label>
                  <CInputGroup>
                    <CInputGroupText>
                      <FaTag />
                    </CInputGroupText>
                    <CFormInput
                      name="slug"
                      placeholder="Attributes Slug"
                      value={editForm.slug}
                      disabled
                    />
                  </CInputGroup>
                </CCol>

                <CCol xs={12} className="mt-3">
                  <CButton color="primary" onClick={handleEditSubmit}>
                    Update Attributes
                  </CButton>
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        </CCol>
      )}

      {/* Configure / Edit Configure Form */}
      {(showConfigureForm || showEditConfigureForm) && (
        <>
          <CCol xs={4}>
            <CCard>
              <CCardBody>
                <CRow>
                  {showConfigureForm && (
                    <>
                      <CCol className="mb-3" md={12}>
                        <label className="form-label fw-semibold">Item Name</label>
                        <CInputGroup>
                          <CInputGroupText>
                            <FaList />
                          </CInputGroupText>
                          <CFormInput
                            name="name"
                            placeholder="Enter Item Name"
                            value={itemForm.name}
                            onChange={handleItemChange}
                          />
                        </CInputGroup>
                      </CCol>

                      <CCol className="mb-3" md={12}>
                        <label className="form-label fw-semibold">Item Slug</label>
                        <CInputGroup>
                          <CInputGroupText>
                            <FaTag />
                          </CInputGroupText>
                          <CFormInput
                            name="slug"
                            placeholder="Item Slug"
                            value={itemForm.slug}
                            disabled
                          />
                        </CInputGroup>
                      </CCol>

                      <CCol md={12}>
                        <label className="form-label fw-semibold">Item Description</label>
                        <CInputGroup>
                          <CInputGroupText>
                            <FaInfoCircle />
                          </CInputGroupText>
                          <textarea
                            className="form-control"
                            rows="3"
                            name="description"
                            placeholder="Enter Item Description"
                            value={itemForm.description}
                            onChange={handleItemChange}
                          ></textarea>
                        </CInputGroup>
                      </CCol>

                      <CCol xs={12} className="mt-3">
                        <CButton color="primary" onClick={handleAddItemSubmit}>
                          Add Item
                        </CButton>
                      </CCol>
                    </>
                  )}

                  {showEditConfigureForm && (
                    <>
                      <CCol className="mb-3" md={12}>
                        <label className="form-label fw-semibold">Edit Item Name</label>
                        <CInputGroup>
                          <CInputGroupText>
                            <FaList />
                          </CInputGroupText>
                          <CFormInput
                            name="name"
                            placeholder="Edit Item Name"
                            value={editItemForm.name}
                            onChange={handleEditItemChange}
                          />
                        </CInputGroup>
                      </CCol>

                      <CCol className="mb-3" md={12}>
                        <label className="form-label fw-semibold">Edit Item Slug</label>
                        <CInputGroup>
                          <CInputGroupText>
                            <FaTag />
                          </CInputGroupText>
                          <CFormInput
                            name="slug"
                            placeholder="Edit Item Slug"
                            value={editItemForm.slug}
                            disabled
                          />
                        </CInputGroup>
                      </CCol>

                      <CCol md={12}>
                        <label className="form-label fw-semibold">Edit Item Description</label>
                        <CInputGroup>
                          <CInputGroupText>
                            <FaInfoCircle />
                          </CInputGroupText>
                          <textarea
                            className="form-control"
                            rows="3"
                            name="description"
                            placeholder="Edit description"
                            value={editItemForm.description}
                            onChange={handleEditItemChange}
                          ></textarea>
                        </CInputGroup>
                      </CCol>

                      <CCol xs={12} className="mt-3">
                        <CButton color="primary" onClick={handleEditItemSubmit}>
                          Update Item
                        </CButton>
                      </CCol>
                    </>
                  )}
                </CRow>
              </CCardBody>
            </CCard>
          </CCol>

          {/* COnfigure Items Table Start */}

          <CCol xs={8}>
            <CCard>
              <CCardBody>
                <CTable striped hover>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>No</CTableHeaderCell>
                      <CTableHeaderCell>Name</CTableHeaderCell>
                      <CTableHeaderCell>Slug</CTableHeaderCell>
                      <CTableHeaderCell>Description</CTableHeaderCell>
                      <CTableHeaderCell className="text-end">Actions</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {items.map((item, index) => (
                      <CTableRow key={item._id}>
                        <CTableDataCell>{index + 1}</CTableDataCell>
                        <CTableDataCell>{item.name}</CTableDataCell>
                        <CTableDataCell>{item.slug}</CTableDataCell>
                        <CTableDataCell>{item.description || '-'}</CTableDataCell>
                        <CTableDataCell className="text-end d-flex gap-2 justify-content-end">
                          <CButton
                            size="sm"
                            color="success"
                            variant="outline"
                            onClick={() => handleEditItemClick(item)}
                            className="d-flex align-items-center gap-1 rounded-sm custom-hover-success"
                          >
                            <FaEdit />
                            <span>Edit</span>
                          </CButton>
                          <CButton
                            size="sm"
                            color="danger"
                            variant="outline"
                            onClick={() => handleDeleteItem(item._id)}
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
          </CCol>
        </>
      )}

      {/* Attributes Table */}
      {!showAddForm && !showEditForm && !showConfigureForm && !showEditConfigureForm && (
        <CCol xs={12}>
          <CCard>
            <CCardBody>
              <div className="table-responsive">
                <CTable striped hover>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>
                        <input
                          type="checkbox"
                          checked={
                            selectedRows.length === categories.length && categories.length > 0
                          }
                          onChange={handleSelectAll}
                        />
                      </CTableHeaderCell>
                      <CTableHeaderCell>Name</CTableHeaderCell>
                      <CTableHeaderCell>Slug</CTableHeaderCell>
                      <CTableHeaderCell>Terms</CTableHeaderCell>
                      <CTableHeaderCell className="text-end">Actions</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {categories.map((cat, _id) => (
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
                        <CTableDataCell>
                          <CButton
                            size="sm"
                            color="info"
                            variant="outline"
                            onClick={() => handleConfigureClick(cat)}
                            className="d-flex align-items-center gap-1 rounded-sm"
                          >
                            <FaTag />
                            <span>Configure Items</span>
                          </CButton>
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
              </div>
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

export default Attributes
