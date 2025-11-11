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
} from '@coreui/react'
import { FaList, FaTag, FaImage, FaTrash, FaEdit, FaToggleOn } from 'react-icons/fa'
import { ToastContainer, toast } from 'react-toastify'
import Swal from 'sweetalert2'
import 'react-toastify/dist/ReactToastify.css'
import ReactQuill from 'react-quill'
const Categoryblog = () => {
  const [addForm, setAddForm] = useState({
    categoryname: '',
    categoryslug: '',
    image: '',
    imageFile: null,
    statusactiveinactive: 1,
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [allcategory, setAllcategory] = useState([])
  const [editForm, setEditForm] = useState({})
  const [selectedRows, setSelectedRows] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [shortDescription, setShortDescription] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const blogsPerPage = 10

  // 1️⃣ Filter first
  const filteredTags = allcategory.filter((tag) =>
    tag.categoryname.toLowerCase().includes(searchTerm.toLowerCase()),
  )
  // Index calculate
  const indexOfLastBlog = currentPage * blogsPerPage
  const indexOfFirstBlog = indexOfLastBlog - blogsPerPage
  const currentBlogs = filteredTags.slice(indexOfFirstBlog, indexOfLastBlog)

  // Total pages
  const totalPages = Math.ceil(allcategory.length / blogsPerPage)
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const handleAddChange = (e) => {
    const { name, value } = e.target

    if (name === 'categoryname') {
      const str = String(value)
      const generatedSlug = str
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // remove special chars
        .replace(/\s+/g, '-') // replace spaces with dash

      setAddForm((prev) => ({
        ...prev,
        categoryname: str,
        categoryslug: generatedSlug,
      }))
    } else if (name === 'statusactiveinactive') {
      // Convert string "0"/"1" from select to number
      setAddForm((prev) => ({ ...prev, [name]: Number(value) }))
    } else {
      setAddForm((prev) => ({ ...prev, [name]: value }))
    }
  }

  // Component top level pe define karo
  const fetchAllCategory = async () => {
    try {
      const response = await axios.get('https://udemandme.cloud/api/allcategory')
      setAllcategory(response.data.data)
    } catch (err) {
      console.error('Error fetching categories:', err)
      toast.error(err.response?.data?.message || 'Something went wrong')
    }
  }

  // useEffect me call karo
  useEffect(() => {
    fetchAllCategory()
  }, [])
  const handleCancel = () => {
    // Hide forms
    setShowAddForm(false)
    setShowEditForm(false)

    // Reset Add Form
    setAddForm({
      categoryname: '',
      categoryslug: '',
      image: '',
      imageFile: null,
      statusactiveinactive: 1,
    })
    setShortDescription('')
    setShowAddForm(false)
    fetchAllCategory() // 🔹 call here
  }

  // handleAddSubmit me bhi call kar sakte ho
  const handleAddSubmit = async () => {
    try {
      const formData = new FormData()
      formData.append('categoryname', addForm.categoryname)
      formData.append('categoryslug', addForm.categoryslug)
      formData.append('categoryparagraph', shortDescription)
      formData.append('statusactiveinactive', addForm.statusactiveinactive ?? 1)
      if (addForm.imageFile) {
        formData.append('categoryImage', addForm.imageFile)
      }

      // const obj = Object.fromEntries(formData.entries())
      // console.log('FormData as JSON:', obj)

      const res = await axios.post('https://udemandme.cloud/api/postblogcategory', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      if (res.data.success) {
        toast.success('Blog Category added successfully!')
        setAddForm({
          categoryname: '',
          categoryslug: '',
          image: '',
          imageFile: null,
          statusactiveinactive: 1,
        })
        setShortDescription('')
        setShowAddForm(false)
        fetchAllCategory() // 🔹 call here
      }
    } catch (err) {
      console.error('--- API Error ---', err.response?.data || err)
      toast.error(err.response?.data?.message || 'Failed to add blog Category ❌')
    }
  }
  // delete function
  const handleDelete = async (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This will delete the Blog Category!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await axios.delete(`https://udemandme.cloud/api/deletecategory/${id}`)

          if (res.data.success) {
            // frontend state se remove karna
            setAllcategory((prev) => prev.filter((allcategory) => allcategory._id !== id))

            toast.success('Category deleted successfully!')
          } else {
            toast.error(res.data.message || 'Failed to delete Category Blog')
          }
        } catch (error) {
          console.error(error)
          toast.error('Error deleting Category Blog')
        }
      }
    })
  }

  // Submit function
  const handleEditSubmit = async () => {
    try {
      const formData = new FormData()
      formData.append('categoryname', editForm.categoryname)
      formData.append('categoryslug', editForm.categoryslug)
      formData.append('categoryparagraph', editForm.shortDescription)
      formData.append('statusactiveinactive', editForm.statusactiveinactive === 'Active' ? 1 : 0)

      if (editForm.imageFile) {
        formData.append('categoryImage', editForm.imageFile) // ✅ key must match multer
      }

      const res = await axios.put(
        `https://udemandme.cloud/api/updatecategory/${editForm.id}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      )

      if (res.data.success) {
        toast.success('Blog Category updated successfully!')
        setShowEditForm(false)
        fetchAllCategory() // refresh list
      }
    } catch (err) {
      console.error('--- API Error ---', err.response?.data || err)
      toast.error(err.response?.data?.message || 'Failed to update category ❌')
    }
  }

  const handleEditClick = (category) => {
    setEditForm({
      id: category._id, // update ke liye unique ID
      categoryname: category.categoryname || '', // Category name
      categoryslug: category.categoryslug || '', // Slug
      shortDescription: category.categoryparagraph || '', // Description
      imageFile: null, // Naya image upload ke liye
      categoryImage: category.categoryImage || '', // Existing image URL
      statusactiveinactive: category.statusactiveinactive === 1 ? 'Active' : 'Inactive',
    })

    setShowEditForm(true) // Edit form open
    setShowAddForm(false) // Add form close
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target
    if (name === 'categoryname') {
      const slug = value
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
      setEditForm((prev) => ({
        ...prev,
        [name]: value,
        categoryslug: slug, // automatically update slug
      }))
    } else {
      setEditForm((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await axios.patch(
        `https://udemandme.cloud/api/updatecategorystatus/${id}`,
        { statusactiveinactive: newStatus }, // 👈 backend ke saath match
      )

      if (res.data.success) {
        toast.success(res.data.message)
        setAllcategory((prev) =>
          prev.map((b) => (b._id === id ? { ...b, statusactiveinactive: newStatus } : b)),
        )
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status ❌')
    }
  }
  const handleDeleteSelected = async () => {
    if (selectedRows.length === 0) return toast.warning('Select Blogs Category to delete')

    const confirmed = await Swal.fire({
      title: 'Are you sure?',
      text: `This will delete ${selectedRows.length} selected Blog Category!`,
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
        selectedRows.map((blog) =>
          axios.delete(`https://udemandme.cloud/api/deletecategory/${blog._id}`),
        ),
      )

      // 2️⃣ Frontend update
      const updated = allcategory.filter((b) => !selectedRows.some((sel) => sel._id === b._id))
      setAllcategory(updated)

      // 3️⃣ Pagination fix
      const newTotalPages = Math.ceil(updated.length / blogsPerPage)
      if (currentPage > newTotalPages) {
        setCurrentPage(newTotalPages > 0 ? newTotalPages : 1)
      }

      setSelectedRows([])
      toast.success('Selected Blog category deleted successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete selected Blog Category ❌')
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
  const handleCheckboxChange = (setAllcategory) => {
    if (selectedRows.some((r) => r._id === setAllcategory._id)) {
      setSelectedRows(selectedRows.filter((r) => r._id !== setAllcategory._id))
    } else {
      setSelectedRows([...selectedRows, setAllcategory])
    }
  }
  // ✅ Bulk status change for selected blogs
  const handleBulkStatusChange = async (status) => {
    if (selectedRows.length === 0) return toast.warning('Select blogs first!')

    try {
      await Promise.all(
        selectedRows.map((category) =>
          axios.patch(`https://udemandme.cloud/api/updatecategorystatus/${category._id}`, {
            statusactiveinactive: status,
          }),
        ),
      )

      // Update frontend state
      setAllcategory((prev) =>
        prev.map((b) =>
          selectedRows.some((sel) => sel._id === b._id)
            ? { ...b, statusactiveinactive: status }
            : b,
        ),
      )

      toast.success('Selected Blog Category updated successfully!')
      setSelectedRows([])
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
            ? 'Add Blog Category'
            : showEditForm
              ? 'Edit Blog Category'
              : 'Blog Category List'}
          {!showAddForm && !showEditForm && (
            <span
              className="badge"
              style={{ background: '#5856d6', fontSize: '0.9rem', padding: '8px 12px' }}
            >
              {allcategory.length === 1
                ? `Blog (${allcategory.length})`
                : `Total Category ${allcategory.length}`}
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
              <div className="CTableDataCell">
                <select
                  className="form-select form-select-sm"
                  onChange={(e) => handleBulkStatusChange(parseInt(e.target.value))}
                >
                  <option value="">Change Status</option>
                  <option value="1">Active</option>
                  <option value="0">Inactive</option>
                </select>
              </div>
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
                + Add Blog Category
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
                  <label className="form-label">Category Name</label>
                  <CInputGroup>
                    <CInputGroupText>
                      <FaList />
                    </CInputGroupText>
                    <CFormInput
                      name="categoryname"
                      placeholder="Enter Category Name"
                      value={addForm.categoryname}
                      onChange={handleAddChange}
                    />
                  </CInputGroup>
                </CCol>

                <CCol className="mb-3" md={6}>
                  <label className="form-label ">Category Slug</label>
                  <CInputGroup>
                    <CInputGroupText>
                      <FaTag />
                    </CInputGroupText>
                    <CFormInput
                      name="categoryslug"
                      placeholder="Category slug"
                      value={addForm.categoryslug}
                      onChange={handleAddChange}
                      readOnly
                    />
                  </CInputGroup>
                </CCol>
                <CCol md={6} className="mb-3">
                  <label className="form-label">Blog Image</label>
                  <CInputGroup>
                    <CInputGroupText>
                      <FaImage />
                    </CInputGroupText>
                    <CFormInput
                      type="file"
                      name="categoryImage"
                      onChange={(e) => {
                        const file = e.target.files[0]
                        setAddForm((prev) => ({
                          ...prev,
                          image: URL.createObjectURL(file), // ✅ for preview
                          imageFile: file, // ✅ actual file to send to backend
                        }))
                      }}
                    />
                  </CInputGroup>

                  {addForm.image && (
                    <img src={addForm.image} alt="preview" width="60" className="mt-2" />
                  )}
                </CCol>
                <CCol md={12} className="mb-3">
                  <label className="form-label">Category Description</label>
                  <ReactQuill
                    theme="snow"
                    value={shortDescription}
                    onChange={setShortDescription}
                    placeholder="Write a Category description..."
                    style={{ height: '150px', marginBottom: '50px' }}
                  />
                </CCol>
                <CCol md={12} className="mb-3">
                  <label className="form-label">Blog Status</label>
                  <CInputGroup>
                    <CInputGroupText>
                      <FaToggleOn />
                    </CInputGroupText>
                    <select
                      name="statusactiveinactive"
                      className="form-select"
                      value={addForm.statusactiveinactive ?? 1}
                      onChange={handleAddChange}
                    >
                      <option value={1}>Active</option>
                      <option value={0}>Inactive</option>
                    </select>
                  </CInputGroup>
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
                {/* Blog Title */}
                <CCol md={6} className="mb-3">
                  <label className="form-label">Category Name</label>
                  <CInputGroup>
                    <CInputGroupText>
                      <FaList />
                    </CInputGroupText>
                    <CFormInput
                      name="categoryname"
                      placeholder="Enter Category Name Name"
                      value={editForm.categoryname}
                      onChange={handleEditChange}
                    />
                  </CInputGroup>
                </CCol>
                {/* Slug */}
                <CCol md={6} className="mb-3">
                  <label className="form-label">Category Slug</label>
                  <CInputGroup>
                    <CInputGroupText>
                      <FaTag />
                    </CInputGroupText>
                    <CFormInput
                      name="categoryslug"
                      placeholder="Enter Blog Slug"
                      value={editForm.categoryslug}
                      onChange={handleEditChange}
                    />
                  </CInputGroup>
                </CCol>
                {/* Image */}
                <CCol md={6} className="mb-3">
                  <label className="form-label">category Image</label>
                  <CInputGroup className="align-items-center">
                    <CFormInput
                      type="file"
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          imageFile: e.target.files[0], // file to upload
                          image: URL.createObjectURL(e.target.files[0]), // preview for new file
                          imagePath: `/uploads/categoryblogs/${e.target.files[0]?.name}`, // show path
                        })
                      }
                    />

                    {/* Image + Path inside the input group */}
                    {(editForm.imageFile || editForm.categoryImage) && (
                      <div
                        className="d-flex align-items-center gap-2"
                        style={{ marginLeft: '10px' }}
                      >
                        <img
                          src={
                            editForm.imageFile
                              ? editForm.image
                              : `/backend${editForm.categoryImage}`
                          }
                          alt="preview"
                          width="60"
                          height="60"
                          style={{ objectFit: 'cover', borderRadius: '4px' }}
                        />
                      </div>
                    )}
                  </CInputGroup>
                </CCol>

                {/* Description */}
                <CCol md={12} className="mb-3">
                  <label className="form-label">Category Description</label>
                  <ReactQuill
                    theme="snow"
                    value={editForm.shortDescription}
                    onChange={(value) =>
                      setEditForm((prev) => ({ ...prev, shortDescription: value }))
                    }
                    placeholder="Write a Category description..."
                    style={{ height: '150px', marginBottom: '50px' }}
                  />
                </CCol>
                {/* Status */}
                <CCol md={12} className="mb-3">
                  <label className="form-label">Blog Status</label>
                  <CInputGroup>
                    <CInputGroupText>
                      <FaToggleOn />
                    </CInputGroupText>
                    <select
                      name="statusactiveinactive"
                      className="form-select"
                      value={editForm.statusactiveinactive}
                      onChange={handleEditChange}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </CInputGroup>
                </CCol>
                <CCol xs={12} className="d-flex gap-2">
                  <CButton color="primary" onClick={handleEditSubmit}>
                    Update Category
                  </CButton>
                  <CButton
                    className="text-white"
                    color="danger"
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
                        checked={
                          currentBlogs.length > 0 && selectedRows.length === currentBlogs.length
                        }
                        onChange={handleSelectAll}
                      />
                    </CTableHeaderCell>
                    <CTableHeaderCell>ID</CTableHeaderCell>
                    <CTableHeaderCell>Category Image</CTableHeaderCell>
                    <CTableHeaderCell>Category Name</CTableHeaderCell>
                    <CTableHeaderCell>Category Date</CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>
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

                      <CTableDataCell>
                        {p.categoryImage && (
                          <img
                            src={`/backend${p.categoryImage}`} // full URL
                            width="30"
                            height="30"
                            alt={p.categoryname}
                          />
                        )}
                      </CTableDataCell>

                      <CTableDataCell>{p.categoryname}</CTableDataCell>

                      <CTableDataCell>{new Date(p.createdAt).toLocaleDateString()}</CTableDataCell>
                      <CTableDataCell>
                        <select
                          className="form-select form-select-sm"
                          value={p.statusactiveinactive}
                          onChange={(e) => handleStatusChange(p._id, parseInt(e.target.value))}
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
                          onClick={() => handleEditClick(p)}
                        >
                          <FaEdit />
                          Edit
                        </CButton>

                        <CButton
                          size="sm"
                          color="danger"
                          variant="outline"
                          className="d-flex align-items-center gap-1 rounded-sm custom-hover-danger"
                          onClick={() => handleDelete(p._id)}
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

            {/* Page Numbers with compact logic */}
            {(() => {
              const total = totalPages
              const current = currentPage
              const pageNumbers = []

              // First page
              pageNumbers.push(1)

              // Left ellipsis
              if (current > 3) {
                pageNumbers.push('...')
              }

              // Pages around current (current-1, current, current+1)
              const start = Math.max(2, current - 1)
              const end = Math.min(total - 1, current + 1)

              for (let i = start; i <= end; i++) {
                pageNumbers.push(i)
              }

              // Right ellipsis
              if (current < total - 2) {
                pageNumbers.push('...')
              }

              // Last page
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
              style={{ fontSize: '14px', minWidth: '40px' }}
            >
              ›
            </button>
          </div>
        </div>
      )}
    </CRow>
  )
}
export default Categoryblog
