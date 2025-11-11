import React, { useState, useEffect } from 'react'
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
import {
  FaList,
  FaTag,
  FaImage,
  FaTrash,
  FaEdit,
  FaTimes,
  FaUser,
  FaCalendarAlt,
  FaToggleOn,
} from 'react-icons/fa'
import { ToastContainer, toast } from 'react-toastify'
import Swal from 'sweetalert2'
import 'react-toastify/dist/ReactToastify.css'

import ReactQuill from 'react-quill'
import axios from 'axios'

const Allblogs = () => {
  const [allTags, setAllTags] = useState([]) // API se tags
  const [filteredTagsdata, setFilteredTagsdata] = useState([])
  const [categories, setCategories] = useState([]) // ✅ DB se categories
  const [searchTerm, setSearchTerm] = useState('')
  const [addForm, setAddForm] = useState({})
  const [editForm, setEditForm] = useState({})
  const [blogs, setBlogs] = useState([]) // backend se aayega
  const [selectedRows, setSelectedRows] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [shortDescription, setShortDescription] = useState('')
  const [productTags, setProductTags] = useState([])
  const [tagInput, setTagInput] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const blogsPerPage = 1

  // 1️⃣ Filter first
  const filteredTags = blogs.filter((tag) =>
    tag.blogtitle.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // 2️⃣ Then paginate
  const indexOfLastBlog = currentPage * blogsPerPage
  const indexOfFirstBlog = indexOfLastBlog - blogsPerPage
  const currentBlogs = filteredTags.slice(indexOfFirstBlog, indexOfLastBlog)

  // 3️⃣ Total pages
  const totalPages = Math.ceil(filteredTags.length / blogsPerPage)

  // ✅ API se tags lana
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await axios.get('http://udemandme.cloud/api/getalltag')
        setAllTags(res.data.data || [])
      } catch (error) {
        console.error('Error fetching Blog:', error)
      }
    }
    fetchTags()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])
  // ✅ API call for all blogs
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('http://udemandme.cloud/api/allcategory')
        console.log('API Response:', res.data)

        // ✅ res.data ke andar hi data array hai
        setCategories(Array.isArray(res.data.data) ? res.data.data : [])
      } catch (error) {
        console.error('Error fetching BLog:', error)
        setCategories([]) // fallback
      }
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await axios.get('http://udemandme.cloud/api/allblog')
        setBlogs(res.data.data)
      } catch (err) {
        console.error('Error fetching Blogs:', err)
      }
    }
    fetchBlogs()
  }, [])
  const handleAddSubmit = async () => {
    try {
      const formData = new FormData()
      formData.append('blogtitle', addForm.name)
      formData.append('slugurl', addForm.slug)
      formData.append('blogtags', productTags.join(','))
      formData.append('blogcategory', addForm.blogcategory)
      formData.append('authorname', addForm.author)
      formData.append('blogdate', addForm.date)
      formData.append('blogparagraph', shortDescription)
      formData.append('statusactiveinactive', addForm.statusactiveinactive ?? 1) // ✅ correct
      if (addForm.imageFile) {
        formData.append('blogImage', addForm.imageFile)
      }

      // const obj = Object.fromEntries(formData.entries())
      // console.log('FormData as JSON:', obj)
      const res = await axios.post('http://udemandme.cloud/api/blog', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (res.data.success) {
        toast.success('Blog added successfully!')

        setAddForm({
          name: '',
          slug: '',
          stock: '',
          image: '',
          author: '',
          date: '',
          statusactiveinactive: 1,
          imageFile: null,
        })
        setShortDescription('')
        setProductTags([])
        setShowAddForm(false)
        setBlogs([res.data.data, ...blogs]) // 🔹 latest top pe
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add Blog ❌')
    }
  }
  const handleCancel = () => {
    // Hide forms
    setShowAddForm(false)
    setShowEditForm(false)

    // Reset Add Form
    setAddForm({
      name: '',
      slug: '',
      stock: '',
      image: '',
      author: '',
      date: '',
      statusactiveinactive: 1,
      imageFile: null,
    })

    // Reset other states if needed
    setShortDescription('')
    setTagInput('')
    setProductTags([])
  }

  // delete function
  const handleDelete = async (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This will delete the Blog!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await axios.delete(`http://udemandme.cloud/api/blog/${id}`)

          if (res.data.success) {
            // frontend state se remove karna
            setBlogs((prev) => prev.filter((blog) => blog._id !== id))

            toast.success('Blog deleted successfully!')
          } else {
            toast.error(res.data.message || 'Failed to delete blog')
          }
        } catch (error) {
          console.error(error)
          toast.error('Error deleting blog')
        }
      }
    })
  }

  // Allblogs.jsx (Update Section)

  // Open edit form
  const handleEditClick = (blog) => {
    setEditForm({
      _id: blog._id,
      name: blog.blogtitle || '',
      slug: blog.slugurl || '',
      blogcategory: blog.blogcategory ? String(blog.blogcategory) : '',
      author: blog.authorname || '',
      date: blog.blogdate ? blog.blogdate.substring(0, 16) : '',
      blogImage: blog.blogImage || '', // backend path
      shortDescription: blog.blogparagraph || '',
      status: blog.statusactiveinactive === 1 ? 'Active' : 'Inactive',
    })

    setProductTags(blog.blogtags ? blog.blogtags.split(',') : [])
    setShowEditForm(true)
    setShowAddForm(false)
  }

  // Edit form input handler
  const handleEditChange = (e) => {
    const { name, value } = e.target

    if (name === 'name') {
      const slug = value
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
      setEditForm((prev) => ({ ...prev, [name]: value, slug }))
    } else if (name === 'statusactiveinactive') {
      setEditForm((prev) => ({
        ...prev,
        [name]: Number(value), // Convert string "0"/"1" to number 0/1
      }))
    } else {
      setEditForm((prev) => ({ ...prev, [name]: value }))
    }
  }
  // ✅ Input change hone par filter karna
  const handleInputChange = (e) => {
    const value = e.target.value
    setTagInput(value)

    if (value.trim() === '') {
      setFilteredTagsdata([])
    } else {
      const filter = allTags.filter((tag) =>
        tag.tagname.toLowerCase().includes(value.toLowerCase()),
      )
      setFilteredTagsdata(filter)
    }
  }
  // ✅ Tag add karna (manual ya suggestion se)
  // ✅ Tag add karna (sirf suggestion se)
  const handleAddTag = (tagName) => {
    if (tagName && !productTags.includes(tagName)) {
      setProductTags([...productTags, tagName]) // add selected tag
    }
    setTagInput('') // input clear
    setFilteredTagsdata([]) // suggestions clear
  }

  // ✅ Tag remove karna
  const handleRemoveTag = (tag) => {
    setProductTags(productTags.filter((t) => t !== tag))
  }

  // Submit update
  const handleEditSubmit = async () => {
    try {
      const formData = new FormData()
      formData.append('blogtitle', editForm.name)
      formData.append('slugurl', editForm.slug)
      formData.append('blogtags', productTags.join(','))
      formData.append('blogcategory', editForm.blogcategory)
      formData.append('authorname', editForm.author)
      formData.append('blogdate', editForm.date)
      formData.append('blogparagraph', editForm.shortDescription)
      formData.append(
        'statusactiveinactive',
        editForm.statusactiveinactive ?? 1, // ✅ correctly editForm se
      )

      // Only append the file if a new one is selected
      if (editForm.imageFile) {
        formData.append('blogImage', editForm.imageFile)
      }

      const res = await axios.put(
        `http://udemandme.cloud/api/blogupdate/${editForm._id}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      )

      if (res.data.success) {
        toast.success(' Blog updated successfully!')
        setShowEditForm(false)
        setBlogs((prev) => prev.map((b) => (b._id === editForm._id ? res.data.data : b)))
      } else {
        toast.error(res.data.message || 'Failed to update Blog ❌')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update Blog ❌')
    }
  }
  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await axios.patch(`http://udemandme.cloud/api/updatestatus/${id}`, {
        status: newStatus,
      })

      if (res.data.success) {
        toast.success('Blog status updated successfully!')
        setBlogs((prev) =>
          prev.map((b) => (b._id === id ? { ...b, statusactiveinactive: newStatus } : b)),
        )
      } else {
        toast.error(res.data.message || 'Failed to update status ❌')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status ❌')
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
  const handleCheckboxChange = (currentBlogs) => {
    if (selectedRows.some((r) => r._id === currentBlogs._id)) {
      setSelectedRows(selectedRows.filter((r) => r._id !== currentBlogs._id))
    } else {
      setSelectedRows([...selectedRows, currentBlogs])
    }
  }

  // ✅ Delete selected blogs (frontend + backend)
  const handleDeleteSelected = async () => {
    if (selectedRows.length === 0) return toast.warning('Select Blogs to delete')

    const confirmed = await Swal.fire({
      title: 'Are you sure?',
      text: `This will delete ${selectedRows.length} selected Blogs!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete all!',
    })

    if (!confirmed.isConfirmed) return

    try {
      await Promise.all(
        selectedRows.map((blog) => axios.delete(`http://udemandme.cloud/api/blog/${blog._id}`)),
      )

      // FIXED: use blogs instead of prev
      const updated = blogs.filter((b) => !selectedRows.some((sel) => sel._id === b._id))
      setBlogs(updated)

      const newTotalPages = Math.ceil(updated.length / blogsPerPage)
      if (currentPage > newTotalPages) {
        setCurrentPage(newTotalPages > 0 ? newTotalPages : 1)
      }

      setSelectedRows([])
      toast.success('Selected Blogs deleted successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete selected Blogs ❌')
    }
  }

  // ✅ Bulk status change for selected blogs
  const handleBulkStatusChange = async (status) => {
    if (selectedRows.length === 0) return toast.warning('Select Blogs first!')

    try {
      await Promise.all(
        selectedRows.map((blog) =>
          axios.patch(`http://udemandme.cloud/api/updatestatus/${blog._id}`, { status }),
        ),
      )

      // Update frontend state
      setBlogs((prev) =>
        prev.map((b) =>
          selectedRows.some((sel) => sel._id === b._id)
            ? { ...b, statusactiveinactive: status }
            : b,
        ),
      )

      toast.success('Selected Blogs updated successfully!')
      setSelectedRows([])
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status ❌')
    }
  }

  const handleAddChange = (e) => {
    const { name, value } = e.target

    if (name === 'name') {
      const slug = value
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
      setAddForm((prev) => ({
        ...prev,
        [name]: value,
        slug: slug,
      }))
    } else if (name === 'statusactiveinactive') {
      setAddForm((prev) => ({
        ...prev,
        [name]: Number(value), // guaranteed number
      }))
    } else {
      setAddForm((prev) => ({ ...prev, [name]: value }))
    }
  }

  return (
    <CRow className="g-4">
      <ToastContainer position="top-right" autoClose={3000} />
      <CCol xs={12} className="d-flex justify-content-between align-items-center">
        <h4 className="fw-bold mb-0 d-flex align-items-center gap-2">
          {showAddForm ? 'Add Blog' : showEditForm ? 'Edit Blog' : 'Blog List'}
          {!showAddForm && !showEditForm && (
            <span
              className="badge"
              style={{ background: '#5856d6', fontSize: '0.9rem', padding: '8px 12px' }}
            >
              {blogs.length === 1 ? `Blog (${blogs.length})` : `Total Blogs ${blogs.length}`}
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
                <FaTrash /> Delete
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
                + Add Blog
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
                  <label className="form-label ">Blog Tittle</label>
                  <CInputGroup>
                    <CInputGroupText>
                      <FaList />
                    </CInputGroupText>
                    <CFormInput
                      name="name"
                      placeholder="Enter Blog Tittle"
                      value={addForm.name}
                      onChange={handleAddChange}
                    />
                  </CInputGroup>
                </CCol>
                <CCol className="mb-3" md={6}>
                  <label className="form-label ">Blog Slug</label>
                  <CInputGroup>
                    <CInputGroupText>
                      <FaTag />
                    </CInputGroupText>
                    <CFormInput
                      name="slug"
                      placeholder="Blog slug"
                      value={addForm.slug}
                      onChange={handleAddChange}
                      readOnly
                    />
                  </CInputGroup>
                </CCol>
                <CCol md={12} className="mb-3">
                  <label className="form-label">Blog Tags</label>
                  <div className="border rounded p-2">
                    {/* Input for search */}
                    <CFormInput
                      placeholder="Search and select a Blog Tag"
                      value={tagInput}
                      onChange={handleInputChange} // filter suggestions from allTags
                    />

                    {/* Suggestions Dropdown */}
                    {tagInput.trim() !== '' && (
                      <div
                        className="border rounded p-2 mt-1"
                        style={{ maxHeight: '120px', overflowY: 'auto' }}
                      >
                        {filteredTagsdata.length > 0 ? (
                          filteredTagsdata.map((tag, index) => (
                            <div
                              key={index}
                              style={{ cursor: 'pointer', padding: '4px 8px' }}
                              onClick={() => handleAddTag(tag.tagname)} // select karte hi add ho jaye
                            >
                              {tag.tagname}
                            </div>
                          ))
                        ) : (
                          <div style={{ padding: '4px 8px', color: 'red' }}>
                            Please add blog tags
                          </div>
                        )}
                      </div>
                    )}

                    {/* Selected Tags */}
                    <div className="d-flex gap-2 flex-wrap mt-2">
                      {productTags.map((tag, index) => (
                        <span
                          key={index}
                          className="badge bg-secondary d-flex align-items-center gap-1"
                          style={{ padding: '6px 10px' }}
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            style={{
                              border: 'none',
                              background: 'transparent',
                              color: 'white',
                              fontSize: '14px',
                              cursor: 'pointer',
                              padding: 0,
                              lineHeight: 1,
                            }}
                          >
                            <FaTimes size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </CCol>

                <CCol md={6} className="mb-3">
                  <label className="form-label">Blog Category</label>
                  <select
                    name="blogcategory" // ✅ sahi state field
                    className="form-select"
                    value={addForm.blogcategory || ''} // ✅ ensure string
                    onChange={handleAddChange}
                  >
                    <option value="">
                      {categories.length === 0
                        ? 'No Category, Please Add Category'
                        : 'Select Category'}
                    </option>
                    {categories
                      .filter((cat) => cat.statusactiveinactive === 1) // only active categories
                      .map((cat) => (
                        <option key={cat._id} value={cat.categoryname}>
                          {cat.categoryname}
                        </option>
                      ))}
                  </select>
                </CCol>
                <CCol md={6} className="mb-3">
                  <label className="form-label">Blog Image</label>
                  <CInputGroup>
                    <CInputGroupText>
                      <FaImage />
                    </CInputGroupText>
                    <CFormInput
                      type="file"
                      name="blogImage"
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
                <CCol className="mb-3" md={6}>
                  <label className="form-label">Blog Author Name</label>
                  <CInputGroup>
                    <CInputGroupText>
                      <FaUser />
                    </CInputGroupText>
                    <CFormInput
                      name="author"
                      placeholder="Enter blog author name"
                      value={addForm.author}
                      onChange={handleAddChange}
                    />
                  </CInputGroup>
                </CCol>
                <CCol className="mb-3" md={6}>
                  <label className="form-label">Blog Date & Time</label>
                  <CInputGroup>
                    <CInputGroupText>
                      <FaCalendarAlt />
                    </CInputGroupText>
                    <CFormInput
                      type="datetime-local"
                      name="date"
                      value={addForm.date}
                      onChange={handleAddChange}
                    />
                  </CInputGroup>
                </CCol>

                <CCol md={12} className="mb-3">
                  <label className="form-label">Blog Description</label>
                  <ReactQuill
                    theme="snow"
                    value={shortDescription}
                    onChange={setShortDescription}
                    placeholder="Write a Blog description..."
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
                      value={addForm.statusactiveinactive ?? 1} // default active
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
                {/* {showEditForm && editForm._id && (
                  <div
                    style={{
                      padding: '10px',
                      border: '1px solid #ccc',
                      marginTop: '20px',
                      background: '#f9f9f9',
                    }}
                  >
                    <h4>Selected Blog Data (JSON):</h4>
                    <pre>
                      {JSON.stringify(
                        {
                          ...editForm,
                          blogtags: productTags, // tags bhi include karo
                        },
                        null,
                        2,
                      )}
                    </pre>
                  </div>
                )} */}
                {/* Blog Title */}
                <CCol md={6} className="mb-3">
                  <label className="form-label">Blog Title</label>
                  <CInputGroup>
                    <CInputGroupText>
                      <FaList />
                    </CInputGroupText>
                    <CFormInput
                      name="name"
                      placeholder="Enter Blog Title"
                      value={editForm.name}
                      onChange={handleEditChange}
                    />
                  </CInputGroup>
                </CCol>

                {/* Slug */}
                <CCol md={6} className="mb-3">
                  <label className="form-label">Blog Slug</label>
                  <CInputGroup>
                    <CInputGroupText>
                      <FaTag />
                    </CInputGroupText>
                    <CFormInput
                      name="slug"
                      placeholder="Enter Blog Slug"
                      value={editForm.slug}
                      onChange={handleEditChange}
                    />
                  </CInputGroup>
                </CCol>

                {/* Tags */}
                <CCol md={12} className="mb-3">
                  <label className="form-label">Blog Tags</label>
                  <div className="border rounded p-2">
                    {/* Input for search */}
                    <CFormInput
                      placeholder="Search and select a Blog Tag"
                      value={tagInput}
                      onChange={handleInputChange} // filter suggestions from allTags
                    />

                    {/* Suggestions Dropdown */}
                    {tagInput.trim() !== '' && (
                      <div
                        className="border rounded p-2 mt-1"
                        style={{ maxHeight: '120px', overflowY: 'auto' }}
                      >
                        {filteredTagsdata.length > 0 ? (
                          filteredTagsdata.map((tag, index) => (
                            <div
                              key={index}
                              style={{ cursor: 'pointer', padding: '4px 8px' }}
                              onClick={() => handleAddTag(tag.tagname)} // only select from suggestion
                            >
                              {tag.tagname}
                            </div>
                          ))
                        ) : (
                          <div style={{ padding: '4px 8px', color: 'red' }}>
                            Please add blog tags
                          </div>
                        )}
                      </div>
                    )}

                    {/* Selected Tags */}
                    <div className="d-flex gap-2 flex-wrap mt-2">
                      {productTags.map((tag, index) => (
                        <span
                          key={index}
                          className="badge bg-secondary d-flex align-items-center gap-1"
                          style={{ padding: '6px 10px' }}
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            style={{
                              border: 'none',
                              background: 'transparent',
                              color: 'white',
                              fontSize: '14px',
                              cursor: 'pointer',
                              padding: 0,
                              lineHeight: 1,
                            }}
                          >
                            <FaTimes size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </CCol>

                {/* Category */}
                <CCol md={6} className="mb-3">
                  <label className="form-label">Blog Category</label>
                  <select
                    name="blogcategory" // ✅ must match editForm field
                    className="form-select"
                    value={editForm.blogcategory || ''} // ✅ ensure string
                    onChange={handleEditChange}
                  >
                    <option value="">
                      {categories.length === 0
                        ? 'No category found. Please add category'
                        : 'Select Blog Category'}
                    </option>

                    {categories
                      .filter((cat) => cat.statusactiveinactive === 1) // ✅ sirf active categories
                      .map((cat) => (
                        <option key={cat._id} value={cat.categoryname}>
                          {cat.categoryname}
                        </option>
                      ))}
                  </select>
                </CCol>

                {/* Author */}
                <CCol md={6} className="mb-3">
                  <label className="form-label">Blog Author Name</label>
                  <CInputGroup>
                    <CInputGroupText>
                      <FaUser />
                    </CInputGroupText>
                    <CFormInput
                      name="author"
                      placeholder="Enter Blog Author Name"
                      value={editForm.author}
                      onChange={handleEditChange}
                    />
                  </CInputGroup>
                </CCol>

                {/* Date */}
                <CCol md={6} className="mb-3">
                  <label className="form-label">Blog Date & Time</label>
                  <CInputGroup>
                    <CInputGroupText>
                      <FaCalendarAlt />
                    </CInputGroupText>
                    <CFormInput
                      type="datetime-local"
                      name="date"
                      value={editForm.date}
                      onChange={handleEditChange}
                    />
                  </CInputGroup>
                </CCol>

                {/* Image */}
                <CCol md={6} className="mb-3">
                  <label className="form-label">Blog Image</label>
                  <CInputGroup className="align-items-center">
                    <CFormInput
                      type="file"
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          imageFile: e.target.files[0], // file to upload
                          image: URL.createObjectURL(e.target.files[0]), // preview for new file
                          imagePath: `/uploads/blogs/${e.target.files[0]?.name}`, // show path
                        })
                      }
                    />

                    {/* Image + Path inside the input group */}
                    {(editForm.imageFile || editForm.blogImage) && (
                      <div
                        className="d-flex align-items-center gap-2"
                        style={{ marginLeft: '10px' }}
                      >
                        <img
                          src={
                            editForm.imageFile ? editForm.image : `/backend${editForm.blogImage}`
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
                  <label className="form-label">Blog Description</label>
                  <ReactQuill
                    theme="snow"
                    value={editForm.shortDescription}
                    onChange={(value) =>
                      setEditForm((prev) => ({ ...prev, shortDescription: value }))
                    }
                    placeholder="Write a Blog description..."
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
                      value={editForm.statusactiveinactive ?? 1} // default Active
                      onChange={handleEditChange}
                    >
                      <option value={1}>Active</option>
                      <option value={0}>Inactive</option>
                    </select>
                  </CInputGroup>
                </CCol>
                {/* Submit */}
                <CCol xs={12} className="d-flex gap-2">
                  <CButton color="primary" onClick={handleEditSubmit}>
                    Update Blog
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
                        checked={selectedRows.length === currentBlogs.length}
                        onChange={handleSelectAll}
                      />
                    </CTableHeaderCell>
                    <CTableHeaderCell>ID</CTableHeaderCell>
                    <CTableHeaderCell>Image</CTableHeaderCell>
                    <CTableHeaderCell>Blog Title</CTableHeaderCell>
                    <CTableHeaderCell>Blog Category</CTableHeaderCell>
                    <CTableHeaderCell>Blog Date</CTableHeaderCell>
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
                        {p.blogImage ? (
                          <img
                            src={`/backend${p.blogImage}`}
                            width="30"
                            height="30"
                            alt="Blog"
                            style={{ objectFit: 'cover', borderRadius: '4px' }}
                          />
                        ) : (
                          'No Image'
                        )}
                      </CTableDataCell>
                      <CTableDataCell>{p.blogtitle}</CTableDataCell>
                      <CTableDataCell>{p.blogcategory}</CTableDataCell>
                      <CTableDataCell>{new Date(p.blogdate).toLocaleDateString()}</CTableDataCell>
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

              // hamesha first page
              pageNumbers.push(1)

              // left ellipsis
              if (current > 3) {
                pageNumbers.push('...')
              }

              // current ke left aur right ke liye 1 page ka range
              const start = Math.max(2, current - 1)
              const end = Math.min(total - 1, current + 1)

              for (let i = start; i <= end; i++) {
                pageNumbers.push(i)
              }

              // right ellipsis
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

export default Allblogs
