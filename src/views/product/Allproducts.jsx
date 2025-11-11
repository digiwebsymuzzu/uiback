import React, { useState, useEffect } from 'react'
import AsyncSelect from 'react-select/async'
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
  CModal,
  CForm,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import {
  FaList,
  FaTag,
  FaRupeeSign,
  FaDollarSign,
  FaWeightHanging,
  FaRulerCombined,
  FaImage,
  FaImages,
  FaTrash,
  FaEdit,
  FaTimes,
  FaFileExport,
} from 'react-icons/fa'

import { ToastContainer, toast } from 'react-toastify'
import Swal from 'sweetalert2'
import 'react-toastify/dist/ReactToastify.css'
import ReactQuill from 'react-quill'

const generateSlug = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')

const Allproducts = () => {
  const [products, setProducts] = useState([])

  const [addForm, setAddForm] = useState({
    // Basic Product Info
    productName: '', // Name of product
    productSlug: '', // Slug
    productSku: '', // SKU
    productStock: 1, // 0 = Out of Stock, 1 = In Stock
    productWeight: '',
    productLength: '',
    productWidth: '',
    productHeight: '',
    productImage: '', // Main image
    productGalleryImages: [], // Array of gallery image URLs

    // Pricing
    productRegularPriceInr: '',
    productSalePriceInr: '',
    productRegularPriceUsd: '',
    productSalePriceUsd: '',

    // Relations
    selectedCategories: [], // Array of category names
    selectedBrands: [], // Array of brand names
    selectedTags: [], // Array of tag names

    // Rich Text
    shortDescription: '', // Short description (ReactQuill)
    longDescription: '', // Long description (ReactQuill)

    // Attributes
    selectedAttributes: [
      /*
    Example structure:
    {
      attributeName: '',
      attributeValues: [
        {
          attributeValue: '',
          attributeSku: '',
          attributeRegularPriceInr: '',
          attributeSalePriceInr: '',
          attributeRegularPriceUsd: '',
          attributeSalePriceUsd: '',
          attributeStockStatus: 1,   // 0 = Out of Stock, 1 = In Stock
          attributeImage: ''
        }
      ]
    }
    */
    ],
  })

  const [editForm, setEditForm] = useState({
    _id: '',
    // Basic Product Info
    productName: '', // Name of product
    productSlug: '', // Slug
    productSku: '', // SKU
    productStock: 1, // 0 = Out of Stock, 1 = In Stock
    productWeight: '',
    productLength: '',
    productWidth: '',
    productHeight: '',
    productImage: '', // Main image
    productGalleryImages: [],
    galleryImages: [], // Array of gallery image URLs

    // Pricing
    productRegularPriceInr: '',
    productSalePriceInr: '',
    productRegularPriceUsd: '',
    productSalePriceUsd: '',

    // Relations
    selectedCategories: [], // Array of category names
    selectedBrands: [], // Array of brand names
    selectedTags: [], // Array of tag names

    // Rich Text
    shortDescription: '', // Short description (ReactQuill)
    longDescription: '', // Long description (ReactQuill)

    // Attributes
    selectedAttributes: [
      /*
    Example structure:
    {
      attributeName: '',
      attributeValues: [
        {
          attributeValue: '',
          attributeSku: '',
          attributeRegularPriceInr: '',
          attributeSalePriceInr: '',
          attributeRegularPriceUsd: '',
          attributeSalePriceUsd: '',
          attributeStockStatus: 1,   // 0 = Out of Stock, 1 = In Stock
          attributeImage: ''
        }
      ]
    }
    */
    ],
  })

  const [selectedRows, setSelectedRows] = useState([])
  const [statusFilter, setStatusFilter] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [shortDescription, setShortDescription] = useState('')
  const [longDescription, setLongDescription] = useState('')
  const [productTags, setProductTags] = useState([])
  const [tagInput, setTagInput] = useState('')

  // Start Here
  const [selectedTags, setSelectedTags] = useState([])

  //Cateegories
  const [categories, setCategories] = useState([])
  const [displayedCategories, setDisplayedCategories] = useState([])
  const [categoryIndex, setCategoryIndex] = useState(0)
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [loadingMoreCategories, setLoadingMoreCategories] = useState(false)
  const BATCH_SIZE = 30

  //Brands
  const [brands, setBrands] = useState([])
  const [loadingBrands, setLoadingBrands] = useState(false)
  const [displayedBrands, setDisplayedBrands] = useState([])
  const [brandIndex, setBrandIndex] = useState(0)
  const [loadingMoreBrands, setLoadingMoreBrands] = useState(false)
  const BRAND_BATCH_SIZE = 30

  //Attributes
  const [attributes, setAttributes] = useState([])
  const [newAttribute, setNewAttribute] = useState('')
  const [allAttributes, setAllAttributes] = useState([])
  const [attributeOptions, setAttributeOptions] = useState([])
  const [loadingAttributes, setLoadingAttributes] = useState(false)

  const [visible, setVisible] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  //  Pagination States (added here)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [search, setSearch] = useState('')
  const [totalProducts, setTotalProducts] = useState(0)

  const handleInnerFieldChange = (attrIndex, valName, field, fieldValue) => {
    setAttributes((prev) => {
      const updated = [...prev]
      updated[attrIndex].fields[valName][field] = fieldValue
      return updated
    })
  }

  // Main Product Image Upload
  const handleImageUpload = (e, options = null) => {
    const file = e.target.files[0]
    if (!file) return

    if (options?.type === 'attribute') {
      // Attribute image
      const { attrIndex, value } = options
      setAttributes((prev) => {
        const updated = [...prev]
        if (!updated[attrIndex].fields[value]) updated[attrIndex].fields[value] = {}
        updated[attrIndex].fields[value].image = URL.createObjectURL(file) // preview
        updated[attrIndex].fields[value].imageFile = file // raw file for payload
        return updated
      })
    } else {
      // Main product image
      setAddForm((prev) => ({
        ...prev,
        productImage: URL.createObjectURL(file), // preview
        productImageFile: file, // raw file for payload
      }))
    }
  }

  const handleEditImageUpload = (e, options = null) => {
    const file = e.target.files[0]
    if (!file) return

    if (options?.type === 'attribute') {
      // Attribute image
      const { attrIndex, value } = options
      setAttributes((prev) => {
        const updated = [...prev]
        if (!updated[attrIndex].fields[value]) updated[attrIndex].fields[value] = {}
        updated[attrIndex].fields[value].image = URL.createObjectURL(file) // preview
        updated[attrIndex].fields[value].imageFile = file // raw file for payload
        return updated
      })
    } else {
      // Main product image (editForm instead of addForm)
      setEditForm((prev) => ({
        ...prev,
        productImage: URL.createObjectURL(file), // preview
        productImageFile: file, // raw file for payload
      }))
    }
  }

  // Gallery Images Upload
  const handleGalleryImagesUpload = (e) => {
    const files = Array.from(e.target.files)
    setAddForm((prev) => ({
      ...prev,
      productGalleryImages: [
        ...(prev.productGalleryImages || []),
        ...files.map((f) => URL.createObjectURL(f)),
      ],
      productGalleryFiles: [...(prev.productGalleryFiles || []), ...files],
    }))
  }

  // Remove one gallery image
  const handleRemoveGalleryImage = (index) => {
    setAddForm((prev) => {
      const newPreviews = [...prev.productGalleryImages]
      const newFiles = [...prev.productGalleryFiles]

      newPreviews.splice(index, 1)
      newFiles.splice(index, 1)

      return {
        ...prev,
        productGalleryImages: newPreviews,
        productGalleryFiles: newFiles,
      }
    })
  }

  // Upload new gallery images
  const handleEditGalleryImagesUpload = (e) => {
    const files = Array.from(e.target.files)
    setEditForm((prev) => ({
      ...prev,
      productGalleryImages: [...(prev.productGalleryImages || []), ...files],
      productGalleryFiles: [...(prev.productGalleryFiles || []), ...files],
    }))
  }

  // Remove one gallery image
  const handleEditRemoveGalleryImage = (index) => {
    setEditForm((prev) => {
      const newPreviews = [...(prev.productGalleryImages || [])]
      const newFiles = [...(prev.productGalleryFiles || [])]

      newPreviews.splice(index, 1)
      newFiles.splice(index, 1)

      return {
        ...prev,
        productGalleryImages: newPreviews,
        productGalleryFiles: newFiles,
      }
    })
  }

  const handleAddChange = (e) => {
    const { name, value } = e.target
    if (name === 'productName') {
      setAddForm((prev) => ({
        ...prev,
        productName: value,
        productSlug: generateSlug(value),
      }))
    } else {
      setAddForm((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleEditChange = (e) => {
    const { name, value, type } = e.target

    if (name === 'productName') {
      setEditForm((prev) => ({
        ...prev,
        productName: value,
        productSlug: generateSlug(value),
      }))
    } else if (type !== 'checkbox') {
      setEditForm((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleEditSubmit = async () => {
    try {
      const formData = new FormData()

      // ---------------- Basic fields ----------------
      formData.append('productName', editForm.productName)
      formData.append('productSlug', editForm.productSlug)
      formData.append('productSku', editForm.productSku)
      formData.append('productShortDescription', editForm.shortDescription || '')
      formData.append('productLongDescription', editForm.longDescription || '')
      formData.append('productStock', editForm.productStock || 1)
      formData.append('productWeight', editForm.productWeight || '')
      formData.append('productLength', editForm.productLength || '')
      formData.append('productWidth', editForm.productWidth || '')
      formData.append('productHeight', editForm.productHeight || '')
      formData.append('productRegularPriceInr', editForm.productRegularPriceInr || 0)
      formData.append('productSalePriceInr', editForm.productSalePriceInr || 0)
      formData.append('productRegularPriceUsd', editForm.productRegularPriceUsd || 0)
      formData.append('productSalePriceUsd', editForm.productSalePriceUsd || 0)

      // ---------------- Categories, Brands, Tags ----------------
      formData.append(
        'categories',
        JSON.stringify(
          editForm.selectedCategories?.map((cat) => ({ _id: cat._id, name: cat.name })) || [],
        ),
      )

      formData.append(
        'brands',
        JSON.stringify(
          editForm.selectedBrands?.map((brand) => ({ _id: brand._id, name: brand.name })) || [],
        ),
      )

      formData.append(
        'tags',
        JSON.stringify(
          editForm.selectedTags?.map((tag) => ({ _id: tag.value, name: tag.label })) || [],
        ),
      )

      // Main Image
      if (editForm.productImageFile) formData.append('mainImage', editForm.productImageFile)

      // Gallery Images
      if (editForm.productGalleryFiles?.length > 0) {
        editForm.productGalleryFiles.forEach((file) => formData.append('images', file))
      }

      // ---------------- Attributes ----------------
      if (attributes.length > 0) {
        const attrsForBackend = attributes.map((attr) => ({
          attributeName: attr.name,
          attributeValues: attr.selectedValues.map((val) => ({
            attributeValue: val,
            attributeSku: attr.fields[val]?.sku || '',
            attributeRegularPriceInr: attr.fields[val]?.regularPriceInr || 0,
            attributeSalePriceInr: attr.fields[val]?.salePriceInr || 0,
            attributeRegularPriceUsd: attr.fields[val]?.regularPriceUsd || 0,
            attributeSalePriceUsd: attr.fields[val]?.salePriceUsd || 0,
            attributeStockStatus: attr.fields[val]?.stockStatus ?? 1,
            attributeImageName: attr.fields[val]?.imageFile?.name || attr.fields[val]?.image || '',
          })),
        }))

        formData.append('attributes', JSON.stringify(attrsForBackend))

        // ---------------- Attribute Images ----------------
        attributes.forEach((attr) => {
          attr.selectedValues.forEach((val) => {
            if (attr.fields[val]?.imageFile) {
              formData.append('attrImages', attr.fields[val].imageFile)
            }
          })
        })
      }

      // ---------------- Debug ----------------
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1])
      }

      // ---------------- Send API ----------------
      const response = await axios.put(
        `http://udemandme.cloud/api/products/${editForm._id}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      )

      console.log('Product updated:', response.data)
      toast.success('Product updated successfully!')
      setShowEditForm(false)

      // Update products in state
      setProducts(products.map((p) => (p._id === editForm._id ? response.data.product : p)))
    } catch (err) {
      console.error('Edit submit error:', err)
      toast.error('Failed to update product. Please try again.')
    }
  }

  const handleEditClick = async (product) => {
    try {
      const res = await axios.get(`http://udemandme.cloud/api/products/${product.id}`)
      if (!res.data.success) {
        toast.error('Failed to load product details')
        return
      }

      const dbProduct = res.data.product
      console.log('Fetched product for edit:', dbProduct)

      // Normalize image paths
      const ensureUploadsPath = (p) => {
        if (!p) return ''
        if (typeof p !== 'string') return ''
        const trimmed = p.trim()
        if (!trimmed) return ''
        if (trimmed.startsWith('/uploads/products')) return trimmed
        if (trimmed.startsWith('uploads/products')) return '/' + trimmed
        return `/uploads/products/${trimmed.replace(/^\/+/, '')}`
      }

      // ----- Map attributes -----
      const mappedAttributes = (dbProduct.productAttributes || []).map((attr) => {
        const selectedValues = (attr.attributeValues || []).map((v) => v.attributeValue)
        const fields = {}
        ;(attr.attributeValues || []).forEach((v) => {
          fields[v.attributeValue] = {
            sku: v.attributeSku || '',
            regularPriceInr: v.attributeRegularPriceInr ?? '',
            salePriceInr: v.attributeSalePriceInr ?? '',
            regularPriceUsd: v.attributeRegularPriceUsd ?? '',
            salePriceUsd: v.attributeSalePriceUsd ?? '',
            stockStatus: v.attributeStockStatus === 1 ? '1' : '0',
            image: ensureUploadsPath(v.attributeImage || ''),
          }
        })

        return {
          name: attr.attributeName || '',
          values: (attr.attributeValues || []).map((v) => v.attributeValue),
          selectedValues,
          fields,
        }
      })

      // ----- Map tags (they are coming as JSON string inside array) -----
      let mappedTags = []
      if (dbProduct.productTags && dbProduct.productTags.length > 0) {
        try {
          mappedTags = JSON.parse(dbProduct.productTags[0]).map((tag) => ({
            _id: tag._id,
            name: tag.name,
            value: tag._id,
            label: tag.name,
          }))
        } catch (err) {
          console.warn('Failed to parse productTags:', err)
        }
      }

      // ----- Map categories & brands -----
      const selectedCategories = (dbProduct.productCategories || []).map((c) => ({
        _id: c._id,
        name: c.name,
        value: c._id,
        label: c.name,
      }))

      const selectedBrands = (dbProduct.productBrands || []).map((b) => ({
        _id: b._id,
        name: b.name,
        value: b._id,
        label: b.name,
      }))

      // ----- Map images -----
      const mainImage = ensureUploadsPath(dbProduct.productMainImage || '')
      const galleryImages = (dbProduct.productImages || []).map((g) => ensureUploadsPath(g))

      // ----- Stock normalize (DB gives 0/1) -----
      const stockVal = dbProduct.productStock === 1 ? '1' : '0'

      // ----- Set edit form -----
      setEditForm({
        _id: dbProduct._id || '',

        // Basic Info
        productName: dbProduct.productName || '',
        productSlug: dbProduct.productSlug || '',
        productSku: dbProduct.productSku || '',
        productStock: stockVal,
        productWeight: dbProduct.productWeight ?? '',
        productLength: dbProduct.productDimensions?.length ?? '',
        productWidth: dbProduct.productDimensions?.width ?? '',
        productHeight: dbProduct.productDimensions?.height ?? '',
        productImage: mainImage,
        productGalleryImages: galleryImages,

        // Pricing
        productRegularPriceInr: dbProduct.productRegularPriceInr ?? '',
        productSalePriceInr: dbProduct.productSalePriceInr ?? '',
        productRegularPriceUsd: dbProduct.productRegularPriceUsd ?? '',
        productSalePriceUsd: dbProduct.productSalePriceUsd ?? '',

        // Relations
        selectedCategories,
        selectedBrands,
        selectedTags: mappedTags,

        // Rich Text
        shortDescription: dbProduct.productShortDescription || '',
        longDescription: dbProduct.productLongDescription || '',

        // Attributes
        selectedAttributes: mappedAttributes.map((a) => ({
          attributeName: a.name,
          attributeValues: a.values.map((v) => ({
            attributeValue: v,
            attributeSku: a.fields[v]?.sku || '',
            attributeRegularPriceInr: a.fields[v]?.regularPriceInr || '',
            attributeSalePriceInr: a.fields[v]?.salePriceInr || '',
            attributeRegularPriceUsd: a.fields[v]?.regularPriceUsd || '',
            attributeSalePriceUsd: a.fields[v]?.salePriceUsd || '',
            attributeStockStatus: a.fields[v]?.stockStatus === '1' ? 1 : 0,
            attributeImage: a.fields[v]?.image || '',
          })),
        })),
      })

      // Also set UI-specific states
      setAttributes(mappedAttributes)
      if (typeof setSelectedTags === 'function') setSelectedTags(mappedTags)

      setShowEditForm(true)
      setShowAddForm(false)
    } catch (err) {
      console.error('Error fetching product for edit:', err)
      toast.error('Failed to load product details')
    }
  }

  const handleDelete = async (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This will delete the product!',
      icon: 'warning',
      showCancelButton: true,
    }).then(async (res) => {
      if (res.isConfirmed) {
        try {
          axios.delete('http://udemandme.cloud/api/products', {
            data: { ids: [id] },
          })

          setProducts(products.filter((p) => p.id !== id))
          toast.success('Product deleted successfully')
        } catch (err) {
          console.error('Delete error:', err)
          toast.error('Failed to delete product')
        }
      }
    })
  }

  const handleSelectAll = () => {
    if (selectedRows.length === products.length) {
      setSelectedRows([])
    } else {
      setSelectedRows(products)
    }
  }

  const handleCheckboxChange = (product) => {
    setSelectedRows((prev) =>
      prev.some((r) => r.id === product.id)
        ? prev.filter((r) => r.id !== product.id)
        : [...prev, product],
    )
  }

  const handleDeleteSelected = () => {
    if (selectedRows.length === 0) return toast.warning('Select products to delete')

    Swal.fire({
      title: 'Are you sure?',
      text: 'This will delete all selected products!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete all!',
    }).then(async (res) => {
      if (res.isConfirmed) {
        try {
          const ids = selectedRows.map((r) => r.id)

          axios.delete('http://udemandme.cloud/api/products', {
            data: { ids },
          })

          setProducts(products.filter((p) => !ids.includes(p.id)))
          setSelectedRows([])
          toast.success('Selected products deleted successfully')
        } catch (err) {
          console.error('Bulk delete error:', err)
          toast.error('Failed to delete selected products')
        }
      }
    })
  }

  const handleStockChange = async (id, newStockValue) => {
    newStockValue = Number(newStockValue) // ensure it's 0 or 1

    try {
      // ✅ Optimistic UI update
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, productStock: newStockValue } : p)),
      )

      // ✅ API Update
      await axios.patch(`http://udemandme.cloud/api/products/${id}/status`, {
        productStock: newStockValue,
      })

      // ✅ Toast message
      newStockValue === 1
        ? toast.success('Product marked as In Stock!')
        : toast.error('Product marked as Out of Stock!')

      // ✅ Refresh list
      fetchProducts()
    } catch (err) {
      console.error(err)
      toast.error('Failed to update product stock!')
    }
  }

  // Bulk status change
  const handleBulkStatusChange = (newStatus) => {
    if (selectedRows.length === 0) {
      return toast.warning('Select products to update status')
    }

    const ids = selectedRows.map((r) => r.id)

    const updated = products.map((p) => (ids.includes(p.id) ? { ...p, status: newStatus } : p))
    setProducts(updated)
    setSelectedRows([])

    if (newStatus === 'Active') {
      toast.success('Selected products Activated!')
    } else {
      toast.error('Selected products Deactivated!')
    }
  }

  const handleAddTag = () => {
    if (tagInput.trim() !== '' && !productTags.includes(tagInput.trim())) {
      setProductTags([...productTags, tagInput.trim()])
      setTagInput('')
    }
  }

  const handleRemoveTag = (indexToRemove) => {
    setProductTags(productTags.filter((_, i) => i !== indexToRemove))
  }
  const renderCategories = (categories, level = 0) => {
    return categories.map((cat) => (
      <div key={cat.name} style={{ marginLeft: `${level * 20}px` }}>
        <div className="form-check">
          <input
            type="checkbox"
            className="form-check-input"
            id={cat.name}
            // checked={addForm.selectedCategories.includes(cat.name)}
            onChange={(e) => {
              const selected = addForm.selectedCategories
              const isChecked = e.target.checked
              const newSelection = isChecked
                ? [...selected, cat.name]
                : selected.filter((c) => c !== cat.name)

              setAddForm((prev) => ({ ...prev, selectedCategories: newSelection }))
            }}
          />
          <label className="form-check-label" htmlFor={cat.name}>
            {cat.name}
          </label>
        </div>
        {cat.children && renderCategories(cat.children, level + 1)}
      </div>
    ))
  }

  const handleAddAttribute = () => {
    if (!newAttribute) return
    const selected = attributeOptions.find((attr) => attr._id === newAttribute)
    if (!selected) return
    setAttributes((prev) => [
      ...prev,
      {
        _id: selected._id,
        name: selected.name,
        values: selected.values || [],
        selectedValues: [],
        fields: {},
      },
    ])
    setNewAttribute('')
  }

  const handleAttributeImageUpload = (e, { attrIndex, value }) => {
    const file = e.target.files[0]
    if (!file) return
    setAttributes((prev) => {
      const newAttrs = [...prev]
      if (!newAttrs[attrIndex].fields[value]) newAttrs[attrIndex].fields[value] = {}
      newAttrs[attrIndex].fields[value].image = URL.createObjectURL(file) // preview
      newAttrs[attrIndex].fields[value].imageFile = file // raw file
      return newAttrs
    })
  }

  // const handleValueSelect = (attrIndex, value) => {
  //   setAttributes(prev => {
  //     const newAttrs = [...prev];
  //     if (!newAttrs[attrIndex].selectedValues.includes(value)) {
  //       newAttrs[attrIndex].selectedValues.push(value);
  //     }
  //     return newAttrs;
  //   });
  // };

  const handleValueSelect = (attrIndex, valName, isEditForm = false) => {
    setAttributes((prev) => {
      const newAttrs = [...prev]
      const attr = newAttrs[attrIndex]

      // Add to selectedValues if not already present
      if (!attr.selectedValues.includes(valName)) {
        attr.selectedValues.push(valName)
      }

      // Only for edit form: initialize fields[valName]
      if (isEditForm) {
        if (!attr.fields) attr.fields = {}
        if (!attr.fields[valName]) {
          attr.fields[valName] = {
            sku: '',
            regularPriceInr: 0,
            salePriceInr: 0,
            regularPriceUsd: 0,
            salePriceUsd: 0,
            stockStatus: 1,
            image: null,
          }
        }
      }

      return newAttrs
    })
  }

  const handleFieldChange = (attrIndex, val, field, value) => {
    setAttributes((prev) => {
      const newAttrs = [...prev]
      if (!newAttrs[attrIndex].fields[val]) newAttrs[attrIndex].fields[val] = {}
      newAttrs[attrIndex].fields[val][field] = value
      return newAttrs
    })
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    setSelectedFile(file)
  }

  // const handleSubmit = (e) => {
  //   e.preventDefault()

  //   if (!selectedFile) {
  //     toast.error('Please choose a file!')
  //     return
  //   }

  //   if (!selectedFile.name.endsWith('.csv')) {
  //     toast.error('Only CSV files are allowed!')
  //     return
  //   }

  //   toast.success(`Submitted: ${selectedFile.name}`)

  //   console.log('File submitted:', selectedFile.name)

  //   setSelectedFile(null)
  //   setVisible(false)
  // }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedFile) {
      alert('Please select a file first!')
      return
    }

    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      setUploading(true)
      const res = await fetch('http://udemandme.cloud/api/products/import', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (res.ok) {
        alert('CSV imported successfully')
        console.log('Response:', data)
        setVisible(false)
        setSelectedFile(null)
      } else {
        alert(`Error: ${data.message || 'Failed to import'}`)
      }
    } catch (error) {
      console.error('CSV Upload Error:', error)
      alert('Something went wrong while uploading!')
    } finally {
      setUploading(false)
    }
  }

  const handleAddSubmit = async () => {
    try {
      const formData = new FormData()

      // ---------------- Basic fields ----------------
      formData.append('productName', addForm.productName)
      formData.append('productSlug', addForm.productSlug)
      formData.append('productSku', addForm.productSku)
      formData.append('productShortDescription', shortDescription)
      formData.append('productLongDescription', longDescription)
      formData.append('productStock', addForm.productStock || 1)
      formData.append('productWeight', addForm.productWeight || '')
      formData.append('productLength', addForm.productLength || '')
      formData.append('productWidth', addForm.productWidth || '')
      formData.append('productHeight', addForm.productHeight || '')
      formData.append('productRegularPriceInr', addForm.productRegularPriceInr || 0)
      formData.append('productSalePriceInr', addForm.productSalePriceInr || 0)
      formData.append('productRegularPriceUsd', addForm.productRegularPriceUsd || 0)
      formData.append('productSalePriceUsd', addForm.productSalePriceUsd || 0)

      // ---------------- Categories, Brands, Tags ----------------
      formData.append(
        'categories',
        JSON.stringify(
          addForm.selectedCategories?.map((cat) => ({ _id: cat.value, name: cat.label })) || [],
        ),
      )

      formData.append(
        'brands',
        JSON.stringify(
          addForm.selectedBrands?.map((brand) => ({ _id: brand._id, name: brand.name })) || [],
        ),
      )

      formData.append(
        'tags',
        JSON.stringify(
          addForm.selectedTags?.map((tag) => ({ _id: tag.value, name: tag.label })) || [],
        ),
      )

      // ---------------- Main Image ----------------
      if (addForm.productImageFile) formData.append('images', addForm.productImageFile)

      // ---------------- Gallery Images ----------------
      if (addForm.productGalleryFiles?.length > 0) {
        addForm.productGalleryFiles.forEach((file) => formData.append('images', file))
      }

      // ---------------- Attributes ----------------
      if (attributes.length > 0) {
        const attrsForBackend = attributes.map((attr) => ({
          attributeName: attr.name,
          attributeValues: attr.selectedValues.map((val) => ({
            attributeValue: val,
            attributeSku: attr.fields[val]?.sku || '',
            attributeRegularPriceInr: attr.fields[val]?.regularPriceInr || 0,
            attributeSalePriceInr: attr.fields[val]?.salePriceInr || 0,
            attributeRegularPriceUsd: attr.fields[val]?.regularPriceUsd || 0,
            attributeSalePriceUsd: attr.fields[val]?.salePriceUsd || 0,
            attributeStockStatus: attr.fields[val]?.stockStatus ?? 1,
            attributeImageName: attr.fields[val]?.imageFile?.name || '',
          })),
        }))

        formData.append('attributes', JSON.stringify(attrsForBackend))

        // ---------------- Attribute Images ----------------
        attributes.forEach((attr) => {
          attr.selectedValues.forEach((val) => {
            if (attr.fields[val]?.imageFile) {
              formData.append('attrImages', attr.fields[val].imageFile)
            }
          })
        })
      }

      // ---------------- Debug ----------------
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1])
      }

      // ---------------- Send API ----------------
      const response = await axios.post('http://udemandme.cloud/api/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      console.log('Product created:', response.data)
      toast.success('Product added successfully!')
      setShowAddForm(false)
      fetchProducts()
      setAddForm({
        productName: '',
        productSlug: '',
        productSku: '',
        productStock: 1,
        productWeight: '',
        productLength: '',
        productWidth: '',
        productHeight: '',
        productImage: '',
        productGalleryImages: [],
        productRegularPriceInr: '',
        productSalePriceInr: '',
        productRegularPriceUsd: '',
        productSalePriceUsd: '',
        selectedCategories: [],
        selectedBrands: [],
        selectedTags: [],
        shortDescription: '',
        longDescription: '',
        selectedAttributes: [],
      })
    } catch (err) {
      console.error('Submit error:', err)
      toast.error('Failed to add product. Please try again.')
    }
  }

  // Start Here
  //Tags
  const loadTagOptions = async (inputValue) => {
    try {
      const res = await fetch(
        `http://udemandme.cloud/api/tags?search=${inputValue}&limit=20&page=1`,
      )
      const result = await res.json()

      return result.data
        .filter((tag) => tag.status === 1) //  only active tags
        .map((tag) => ({
          value: tag._id,
          label: tag.name,
        }))
    } catch (error) {
      console.error('Error fetching tags:', error)
      return []
    }
  }

  // Categories

  useEffect(() => {
    const fetchAllCategories = async () => {
      try {
        setLoadingCategories(true)
        let allCategories = []
        let page = 1
        let totalPages = 1

        do {
          const res = await fetch(`http://udemandme.cloud/api/categories?page=${page}&limit=100`)
          if (!res.ok) throw new Error('Failed to fetch categories')

          const result = await res.json()
          allCategories = [...allCategories, ...result.data]
          totalPages = result.pagination.pages
          page++
        } while (page <= totalPages)

        // Only active categories
        const activeCategories = allCategories.filter((cat) => cat.cat_status === 1)
        setCategories(activeCategories)

        // Build parent-child tree
        const map = {}
        const tree = []

        activeCategories.forEach((cat) => {
          map[cat.cat_id] = { ...cat, children: [] }
        })

        activeCategories.forEach((cat) => {
          if (cat.cat_parent && map[cat.cat_parent]) {
            map[cat.cat_parent].children.push(map[cat.cat_id])
          } else {
            tree.push(map[cat.cat_id])
          }
        })

        // Initialize displayedCategories for lazy loading
        setDisplayedCategories(tree.slice(0, BATCH_SIZE))
        setCategoryIndex(BATCH_SIZE)

        console.log('Fetched categories count:', activeCategories.length)
      } catch (err) {
        console.error('Error fetching categories:', err)
      } finally {
        setLoadingCategories(false)
      }
    }

    fetchAllCategories()
  }, [])

  // Lazy loader function
  const loadMoreCategories = () => {
    if (categoryIndex >= categories.length) return
    setLoadingMoreCategories(true)

    setTimeout(() => {
      const nextBatch = categories.slice(categoryIndex, categoryIndex + BATCH_SIZE)
      setDisplayedCategories((prev) => [...prev, ...nextBatch])
      setCategoryIndex(categoryIndex + BATCH_SIZE)
      setLoadingMoreCategories(false)
    }, 200) // optional delay to simulate async
  }

  // Brands
  useEffect(() => {
    const fetchAllBrands = async () => {
      try {
        setLoadingBrands(true)
        let allBrands = []
        let page = 1
        let totalPages = 1

        do {
          const res = await fetch(`http://udemandme.cloud/api/brands?page=${page}&limit=100`)
          if (!res.ok) throw new Error('Failed to fetch brands')

          const result = await res.json()
          allBrands = [...allBrands, ...result.data]

          totalPages = result.pagination.pages
          page++
        } while (page <= totalPages)

        // Only active brands
        const activeBrands = allBrands.filter((brand) => brand.status === 1)
        setBrands(activeBrands)

        // Build parent-child tree using _id and parentBrand
        const map = {}
        const tree = []

        activeBrands.forEach((brand) => {
          map[brand._id] = { ...brand, children: [] }
        })

        activeBrands.forEach((brand) => {
          if (brand.parentBrand && map[brand.parentBrand]) {
            map[brand.parentBrand].children.push(map[brand._id])
          } else {
            tree.push(map[brand._id]) // top-level brands
          }
        })

        // Initialize displayedBrands for lazy loading
        setDisplayedBrands(tree.slice(0, BRAND_BATCH_SIZE))
        setBrandIndex(BRAND_BATCH_SIZE)

        console.log('Fetched brands count:', activeBrands.length)
      } catch (err) {
        console.error('Error fetching brands:', err)
      } finally {
        setLoadingBrands(false)
      }
    }

    fetchAllBrands()
  }, [])

  // --- Lazy loader function for brands ---
  const loadMoreBrands = () => {
    if (brandIndex >= brands.length) return
    setLoadingMoreBrands(true)

    setTimeout(() => {
      const nextBatch = brands.slice(brandIndex, brandIndex + BRAND_BATCH_SIZE)
      setDisplayedBrands((prev) => [...prev, ...nextBatch])
      setBrandIndex(brandIndex + BRAND_BATCH_SIZE)
      setLoadingMoreBrands(false)
    }, 200) // optional delay
  }

  //Attributes
  useEffect(() => {
    const fetchAttributes = async () => {
      try {
        setLoadingAttributes(true)

        const res = await fetch('http://udemandme.cloud/api/attributes')
        if (!res.ok) throw new Error('Failed to fetch attributes')

        const result = await res.json()
        console.log('Raw attribute API result:', result)

        //  API gives array
        const attrs = Array.isArray(result) ? result : []

        //  Only active attributes
        const activeAttrs = attrs.filter((attr) => attr.status === 1)

        // Preserve _id + items (with their own _id)
        const mappedAttrs = activeAttrs.map((attr) => ({
          _id: attr._id,
          name: attr.name,
          values: Array.isArray(attr.items)
            ? attr.items
                .filter((item) => item.status === 1)
                .map((item) => ({ _id: item._id, name: item.name }))
            : [],
        }))

        setAttributeOptions(mappedAttrs)
        console.log('Fetched attributes count:', mappedAttrs.length)
        console.log('Mapped attributes:', mappedAttrs)
      } catch (err) {
        console.error('Error fetching attributes:', err)
      } finally {
        setLoadingAttributes(false)
      }
    }

    fetchAttributes()
  }, [])

  // GET API
  // GET API
  const fetchProducts = async () => {
    try {
      const res = await axios.get(
        `http://udemandme.cloud/api/products?page=${page}&limit=${limit}&search=${search}`,
      )

      if (res.data.success) {
        //  update pagination info
        setTotal(res.data.total)
        setPages(res.data.pages)

        setTotalProducts(res.data.total)

        //  format and update product list
        const formattedProducts = res.data.products.map((p) => {
          return {
            id: p._id,
            name: p.productName || '',
            sku: p.productSku || '',
            stock: p.productStock || 0,
            regularPriceInr: p.productRegularPriceInr || 0,
            selectedCategories:
              p.productCategories
                ?.filter((c) => c)
                ?.map((c) => c.name)
                .join(', ') || '',
            selectedBrands:
              p.productBrands
                ?.filter((b) => b)
                ?.map((b) => b.name)
                .join(', ') || '',
            image: p.productImages?.length > 0 ? `http://udemandme.cloud${p.productImages[0]}` : '',
            status: 'Active', // static for now
          }
        })

        setProducts(formattedProducts)
      }
    } catch (err) {
      console.error('Error fetching products:', err)
    }
  }

  //  Re-fetch when page/limit changes
  useEffect(() => {
    fetchProducts()
  }, [page, limit, search])

  return (
    <CRow className="g-4">
      <ToastContainer position="top-right" autoClose={3000} />
      <CCol xs={12} className="d-flex justify-content-between align-items-center">
        <h4 className="fw-bold mb-0">
          {showAddForm ? 'Add Product' : showEditForm ? 'Edit Product' : 'Products List'}
          <small style={{ fontSize: '12px' }}>&nbsp;&nbsp;({totalProducts} Products)</small>
        </h4>
        <div className="d-flex gap-2">
          {!showAddForm && !showEditForm && (
            <>
              <div className="d-flex justify-content-end mb-3">
                <input
                  type="text"
                  className="form-control w-auto"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1) // reset to page 1 on search
                  }}
                />
              </div>

              {/* Export Button */}
              {/* <CButton
                color="info"
                variant="outline"
                size="sm"
                onClick={() => setVisible(true)}
                className="d-flex align-items-center gap-1 rounded-sm"
              >
                <FaFileExport />
                Export
              </CButton> */}

              {/* Existing Modal Code */}
              <CModal visible={visible} onClose={() => setVisible(false)}>
                <CForm onSubmit={handleSubmit}>
                  <CModalHeader>
                    <CModalTitle>Export File</CModalTitle>
                  </CModalHeader>
                  <CModalBody>
                    <label className="form-label fw-semibold">Choose File</label>
                    <CFormInput type="file" onChange={handleFileChange} accept=".xlsx,.csv,.pdf" />
                    {selectedFile && (
                      <div className="mt-2 text-success">Selected: {selectedFile.name}</div>
                    )}
                  </CModalBody>
                  <CModalFooter>
                    <CButton color="secondary" onClick={() => setVisible(false)}>
                      Cancel
                    </CButton>
                    <CButton color="success" type="submit" disabled={uploading}>
                      {uploading ? 'Uploading...' : 'Submit'}
                    </CButton>
                  </CModalFooter>
                </CForm>
              </CModal>

              {/* Filter + Buttons */}
              <div className="CTableDataCell">
                <select
                  className="form-select form-select-sm"
                  value={statusFilter}
                  onChange={(e) => handleStatusFilterChange(e.target.value)}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
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
                + Add Product
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
                {/* Product Name */}
                <CCol md={6} className="mb-3">
                  <label className="form-label">Product Name</label>
                  <CInputGroup>
                    <CInputGroupText>
                      <FaList />
                    </CInputGroupText>
                    <CFormInput
                      name="productName"
                      placeholder="Enter Product Name"
                      value={addForm.productName}
                      onChange={handleAddChange}
                    />
                  </CInputGroup>
                </CCol>

                {/* Product Slug (auto-generated, disabled) */}
                <CCol md={6} className="mb-3">
                  <label className="form-label">Product Slug</label>
                  <CInputGroup>
                    <CInputGroupText>
                      <FaTag />
                    </CInputGroupText>
                    <CFormInput
                      name="productSlug"
                      placeholder="Enter Product Slug"
                      value={addForm.productSlug}
                      disabled
                    />
                  </CInputGroup>
                </CCol>

                {/* Product Tags */}
                <CCol md={12} className="mb-3">
                  <label className="form-label">Product Tags</label>
                  <AsyncSelect
                    isMulti
                    cacheOptions
                    defaultOptions
                    loadOptions={loadTagOptions}
                    value={addForm.selectedTags}
                    onChange={(tags) => setAddForm((prev) => ({ ...prev, selectedTags: tags }))}
                    placeholder="Search & select tags..."
                  />
                </CCol>

                {/* Short Description */}
                <CCol md={12} className="mb-3">
                  <label className="form-label">Product Short Description</label>
                  <ReactQuill
                    theme="snow"
                    value={shortDescription}
                    onChange={setShortDescription}
                    placeholder="Write a short description..."
                    style={{ height: '150px', marginBottom: '50px' }}
                  />
                </CCol>

                {/* Long Description */}
                <CCol md={12} className="mb-3">
                  <label className="form-label">Product Long Description</label>
                  <ReactQuill
                    theme="snow"
                    value={longDescription}
                    onChange={setLongDescription}
                    placeholder="Write a long description..."
                    style={{ height: '150px', marginBottom: '50px' }}
                  />
                </CCol>

                {/* Product Attributes */}
                <CCol md={12} className="mb-3">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <select
                      className="form-select"
                      value={newAttribute}
                      onChange={(e) => setNewAttribute(e.target.value)}
                    >
                      <option value="">-- Select Attribute --</option>
                      {attributeOptions.map((attr) => (
                        <option key={attr._id} value={attr._id}>
                          {attr.name}
                        </option>
                      ))}
                    </select>
                    <CButton color="primary" onClick={handleAddAttribute}>
                      Add
                    </CButton>
                  </div>

                  {attributes.map((attr, index) => (
                    <div key={index} className="border rounded p-3 mt-3">
                      <div className="d-flex justify-content-between mb-2">
                        <strong>{attr.name}</strong>
                        <CButton
                          className="custom-hover-danger"
                          size="sm"
                          color="danger"
                          onClick={() =>
                            setAttributes((prev) => prev.filter((_, i) => i !== index))
                          }
                        >
                          Remove
                        </CButton>
                      </div>

                      <select
                        className="form-select mb-3"
                        onChange={(e) => handleValueSelect(index, e.target.value)}
                      >
                        <option value="">-- Select {attr.name} Value --</option>
                        {Array.isArray(attr.values) && attr.values.length > 0 ? (
                          attr.values.map((val) => (
                            <option key={val._id} value={val.name}>
                              {val.name}
                            </option>
                          ))
                        ) : (
                          <option disabled>No values found</option>
                        )}
                      </select>

                      {attr.selectedValues.map((val) => (
                        <div key={val} className="border p-2 mb-2">
                          <strong>{val}</strong>
                          <CRow className="mt-2">
                            {/* Attribute Image */}
                            <CCol md={6} className="mb-3">
                              <label className="form-label">Product Image</label>
                              <CInputGroup>
                                <CInputGroupText>
                                  <FaImage />
                                </CInputGroupText>
                                <CFormInput
                                  type="file"
                                  onChange={(e) =>
                                    handleImageUpload(e, {
                                      type: 'attribute',
                                      attrIndex: index,
                                      value: val,
                                    })
                                  }
                                />
                              </CInputGroup>
                              {attr.fields[val]?.image && (
                                <img
                                  src={attr.fields[val].image}
                                  alt="preview"
                                  width="60"
                                  className="form-control mb-2"
                                />
                              )}
                            </CCol>

                            {/* SKU */}
                            <CCol md={6} className="mb-3">
                              <label className="form-label">SKU</label>
                              <CFormInput
                                placeholder="Enter SKU"
                                value={attr.fields[val]?.sku || ''}
                                onChange={(e) =>
                                  handleFieldChange(index, val, 'sku', e.target.value)
                                }
                              />
                            </CCol>

                            {/* Prices */}
                            <CCol md={6} className="mb-3">
                              <label className="form-label">Regular Price (AED)</label>
                              <CInputGroup>
                                <CInputGroupText>
                                  <FaRupeeSign />
                                </CInputGroupText>
                                <CFormInput
                                  type="number"
                                  placeholder="Enter Regular Price"
                                  value={attr.fields[val]?.regularPriceInr || ''}
                                  onChange={(e) =>
                                    handleFieldChange(index, val, 'regularPriceInr', e.target.value)
                                  }
                                />
                              </CInputGroup>
                            </CCol>

                            <CCol md={6} className="mb-3">
                              <label className="form-label">Sale Price (AED)</label>
                              <CInputGroup>
                                <CInputGroupText>
                                  <FaRupeeSign />
                                </CInputGroupText>
                                <CFormInput
                                  type="number"
                                  placeholder="Enter Sale Price"
                                  value={attr.fields[val]?.salePriceInr || ''}
                                  onChange={(e) =>
                                    handleFieldChange(index, val, 'salePriceInr', e.target.value)
                                  }
                                />
                              </CInputGroup>
                            </CCol>

                            <CCol md={6} className="mb-3">
                              <label className="form-label">Regular Price (USD)</label>
                              <CInputGroup>
                                <CInputGroupText>
                                  <FaDollarSign />
                                </CInputGroupText>
                                <CFormInput
                                  type="number"
                                  placeholder="Enter Regular Price USD"
                                  value={attr.fields[val]?.regularPriceUsd || ''}
                                  onChange={(e) =>
                                    handleFieldChange(index, val, 'regularPriceUsd', e.target.value)
                                  }
                                />
                              </CInputGroup>
                            </CCol>

                            <CCol md={6} className="mb-3">
                              <label className="form-label">Sale Price (USD)</label>
                              <CInputGroup>
                                <CInputGroupText>
                                  <FaDollarSign />
                                </CInputGroupText>
                                <CFormInput
                                  type="number"
                                  placeholder="Enter Sale Price USD"
                                  value={attr.fields[val]?.salePriceUsd || ''}
                                  onChange={(e) =>
                                    handleFieldChange(index, val, 'salePriceUsd', e.target.value)
                                  }
                                />
                              </CInputGroup>
                            </CCol>

                            {/* Stock Status */}
                            <CCol md={6} className="mb-3">
                              <label className="form-label">Stock Status</label>
                              <select
                                className="form-select"
                                value={attr.fields[val]?.stockStatus || '1'}
                                onChange={(e) =>
                                  handleFieldChange(index, val, 'stockStatus', e.target.value)
                                }
                              >
                                <option value="1">In Stock</option>
                                <option value="0">Out of Stock</option>
                              </select>
                            </CCol>
                          </CRow>
                        </div>
                      ))}
                    </div>
                  ))}
                </CCol>

                <CCol md={6} className="mb-3">
                  <label className="form-label">Select Product Categories</label>
                  <div
                    className="border rounded p-2"
                    style={{ maxHeight: '300px', overflowY: 'auto' }}
                    onScroll={(e) => {
                      const { scrollTop, scrollHeight, clientHeight } = e.target
                      if (scrollTop + clientHeight >= scrollHeight - 10 && !loadingMoreCategories) {
                        loadMoreCategories()
                      }
                    }}
                  >
                    {displayedCategories.map((cat) => (
                      <div key={cat._id} style={{ marginLeft: '0px' }}>
                        <div className="form-check mb-1">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id={cat.name}
                            checked={addForm.selectedCategories.some((c) => c.value === cat._id)}
                            onChange={(e) => {
                              const newSelection = e.target.checked
                                ? [
                                    ...addForm.selectedCategories,
                                    { value: cat._id, label: cat.name },
                                  ]
                                : addForm.selectedCategories.filter((c) => c.value !== cat._id)
                              setAddForm((prev) => ({ ...prev, selectedCategories: newSelection }))
                            }}
                          />
                          <label className="form-check-label" htmlFor={cat.name}>
                            {cat.name}
                          </label>
                        </div>

                        {cat.children?.map((child1) => (
                          <div key={child1._id} style={{ marginLeft: '20px' }}>
                            <div className="form-check mb-1">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                id={child1.name}
                                checked={addForm.selectedCategories.some(
                                  (c) => c._id === child1._id,
                                )}
                                onChange={(e) => {
                                  const newSelection = e.target.checked
                                    ? [
                                        ...addForm.selectedCategories,
                                        { _id: child1._id, name: child1.name },
                                      ]
                                    : addForm.selectedCategories.filter((c) => c._id !== child1._id)
                                  setAddForm((prev) => ({
                                    ...prev,
                                    selectedCategories: newSelection,
                                  }))
                                }}
                              />
                              <label className="form-check-label" htmlFor={child1.name}>
                                {child1.name}
                              </label>
                            </div>

                            {child1.children?.map((child2) => (
                              <div key={child2._id} style={{ marginLeft: '40px' }}>
                                <div className="form-check mb-1">
                                  <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id={child2.name}
                                    checked={addForm.selectedCategories.some(
                                      (c) => c._id === child2._id,
                                    )}
                                    onChange={(e) => {
                                      const newSelection = e.target.checked
                                        ? [
                                            ...addForm.selectedCategories,
                                            { _id: child2._id, name: child2.name },
                                          ]
                                        : addForm.selectedCategories.filter(
                                            (c) => c._id !== child2._id,
                                          )
                                      setAddForm((prev) => ({
                                        ...prev,
                                        selectedCategories: newSelection,
                                      }))
                                    }}
                                  />
                                  <label className="form-check-label" htmlFor={child2.name}>
                                    {child2.name}
                                  </label>
                                </div>

                                {child2.children?.map((child3) => (
                                  <div key={child3._id} style={{ marginLeft: '60px' }}>
                                    <div className="form-check mb-1">
                                      <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id={child3.name}
                                        checked={addForm.selectedCategories.some(
                                          (c) => c._id === child3._id,
                                        )}
                                        onChange={(e) => {
                                          const newSelection = e.target.checked
                                            ? [
                                                ...addForm.selectedCategories,
                                                { _id: child3._id, name: child3.name },
                                              ]
                                            : addForm.selectedCategories.filter(
                                                (c) => c._id !== child3._id,
                                              )
                                          setAddForm((prev) => ({
                                            ...prev,
                                            selectedCategories: newSelection,
                                          }))
                                        }}
                                      />
                                      <label className="form-check-label" htmlFor={child3.name}>
                                        {child3.name}
                                      </label>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    ))}
                    {loadingMoreCategories && <div>Loading more categories...</div>}
                  </div>
                </CCol>

                <CCol md={6} className="mb-3">
                  <label className="form-label">Select Product Brands</label>
                  <div
                    className="border rounded p-2"
                    style={{ maxHeight: '300px', overflowY: 'auto' }}
                    onScroll={(e) => {
                      const { scrollTop, scrollHeight, clientHeight } = e.target
                      if (scrollTop + clientHeight >= scrollHeight - 10 && !loadingMoreBrands) {
                        loadMoreBrands()
                      }
                    }}
                  >
                    {displayedBrands.map((brand) => (
                      <div key={brand._id}>
                        {/* Level 1 Brand */}
                        <div className="form-check mb-1">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id={brand._id}
                            checked={addForm.selectedBrands.some((b) => b._id === brand._id)}
                            onChange={(e) => {
                              const newSelection = e.target.checked
                                ? [...addForm.selectedBrands, { _id: brand._id, name: brand.name }]
                                : addForm.selectedBrands.filter((b) => b._id !== brand._id)

                              setAddForm((prev) => ({ ...prev, selectedBrands: newSelection }))
                            }}
                          />
                          <label className="form-check-label" htmlFor={brand._id}>
                            {brand.name}
                          </label>
                        </div>

                        {/* Level 2 Brand */}
                        {brand.children?.map((child1) => (
                          <div key={child1._id} style={{ marginLeft: '20px' }}>
                            <div className="form-check mb-1">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                id={child1._id}
                                checked={addForm.selectedBrands.some((b) => b._id === child1._id)}
                                onChange={(e) => {
                                  const newSelection = e.target.checked
                                    ? [
                                        ...addForm.selectedBrands,
                                        { _id: child1._id, name: child1.name },
                                      ]
                                    : addForm.selectedBrands.filter((b) => b._id !== child1._id)

                                  setAddForm((prev) => ({ ...prev, selectedBrands: newSelection }))
                                }}
                              />
                              <label className="form-check-label" htmlFor={child1._id}>
                                {child1.name}
                              </label>
                            </div>

                            {/* Level 3 Brand */}
                            {child1.children?.map((child2) => (
                              <div key={child2._id} style={{ marginLeft: '40px' }}>
                                <div className="form-check mb-1">
                                  <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id={child2._id}
                                    checked={addForm.selectedBrands.some(
                                      (b) => b._id === child2._id,
                                    )}
                                    onChange={(e) => {
                                      const newSelection = e.target.checked
                                        ? [
                                            ...addForm.selectedBrands,
                                            { _id: child2._id, name: child2.name },
                                          ]
                                        : addForm.selectedBrands.filter((b) => b._id !== child2._id)

                                      setAddForm((prev) => ({
                                        ...prev,
                                        selectedBrands: newSelection,
                                      }))
                                    }}
                                  />
                                  <label className="form-check-label" htmlFor={child2._id}>
                                    {child2.name}
                                  </label>
                                </div>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    ))}
                    {loadingMoreBrands && <div>Loading more brands...</div>}
                  </div>
                </CCol>

                {/* Product Main Image */}
                <CCol md={6} className="mb-3">
                  <label className="form-label">Product Image</label>
                  <CInputGroup>
                    <CInputGroupText>
                      <FaImage />
                    </CInputGroupText>
                    <CFormInput type="file" onChange={handleImageUpload} />
                  </CInputGroup>
                  {addForm.productImage && (
                    <img src={addForm.productImage} alt="preview" width="60" className="mt-2" />
                  )}
                </CCol>

                {/* Product Gallery Images */}
                <CCol md={6} className="mb-3">
                  <label className="form-label">Product Gallery Images</label>
                  <CInputGroup>
                    <CInputGroupText>
                      <FaImages />
                    </CInputGroupText>
                    <CFormInput type="file" multiple onChange={handleGalleryImagesUpload} />
                  </CInputGroup>
                  <div className="d-flex gap-2 mt-2 flex-wrap">
                    {addForm.productGalleryImages?.map((img, index) => (
                      <div
                        key={index}
                        style={{ position: 'relative', width: '60px', height: '60px' }}
                      >
                        <img
                          src={img}
                          alt={`gallery-${index}`}
                          width="60"
                          height="60"
                          style={{ objectFit: 'cover', borderRadius: '4px' }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryImage(index)}
                          style={{
                            position: 'absolute',
                            top: '-6px',
                            right: '-6px',
                            backgroundColor: 'red',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '20px',
                            height: '20px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 0,
                          }}
                        >
                          <FaTimes size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </CCol>

                {/* Prices */}
                <CCol md={6} className="mb-3">
                  <label className="form-label">Regular Price (AED)</label>
                  <CInputGroup>
                    <CInputGroupText>
                      <FaRupeeSign />
                    </CInputGroupText>
                    <CFormInput
                      type="number"
                      placeholder="Enter Product Regular Price"
                      name="productRegularPriceInr"
                      value={addForm.productRegularPriceInr}
                      onChange={handleAddChange}
                    />
                  </CInputGroup>
                </CCol>

                <CCol md={6} className="mb-3">
                  <label className="form-label">Sale Price (AED)</label>
                  <CInputGroup>
                    <CInputGroupText>
                      <FaRupeeSign />
                    </CInputGroupText>
                    <CFormInput
                      type="number"
                      placeholder="Enter Product Sale Price"
                      name="productSalePriceInr"
                      value={addForm.productSalePriceInr}
                      onChange={handleAddChange}
                    />
                  </CInputGroup>
                </CCol>

                <CCol md={6} className="mb-3">
                  <label className="form-label">Regular Price (USD)</label>
                  <CInputGroup>
                    <CInputGroupText>
                      <FaDollarSign />
                    </CInputGroupText>
                    <CFormInput
                      type="number"
                      placeholder="Enter Product Regular Price USD"
                      name="productRegularPriceUsd"
                      value={addForm.productRegularPriceUsd}
                      onChange={handleAddChange}
                    />
                  </CInputGroup>
                </CCol>

                <CCol md={6} className="mb-3">
                  <label className="form-label">Sale Price (USD)</label>
                  <CInputGroup>
                    <CInputGroupText>
                      <FaDollarSign />
                    </CInputGroupText>
                    <CFormInput
                      type="number"
                      placeholder="Enter Product Sale Price USD"
                      name="productSalePriceUsd"
                      value={addForm.productSalePriceUsd}
                      onChange={handleAddChange}
                    />
                  </CInputGroup>
                </CCol>

                {/* SKU */}
                <CCol md={6} className="mb-3">
                  <label className="form-label">SKU</label>
                  <CInputGroup>
                    <CInputGroupText>
                      <FaTag />
                    </CInputGroupText>
                    <CFormInput
                      name="productSku"
                      value={addForm.productSku}
                      onChange={handleAddChange}
                    />
                  </CInputGroup>
                </CCol>

                {/* Stock */}
                <CCol md={6} className="mb-3">
                  <label className="form-label">Stock</label>
                  <select
                    name="productStock"
                    className="form-select"
                    value={addForm.productStock}
                    onChange={handleAddChange}
                  >
                    <option value="">Select Stock Status</option>
                    <option value="1">In Stock</option>
                    <option value="0">Out of Stock</option>
                  </select>
                </CCol>

                {/* Weight */}
                <CCol md={6} className="mb-3">
                  <label className="form-label">Weight (kg)</label>
                  <CInputGroup>
                    <CInputGroupText>
                      <FaWeightHanging />
                    </CInputGroupText>
                    <CFormInput
                      name="productWeight"
                      placeholder="Enter product weight"
                      value={addForm.productWeight || ''}
                      onChange={handleAddChange}
                    />
                  </CInputGroup>
                </CCol>

                {/* Dimensions */}
                <CCol xs={6}>
                  <label className="form-label">Dimensions (cm)</label>
                  <div className="d-flex gap-2">
                    <CInputGroup>
                      <CInputGroupText>
                        <FaRulerCombined />
                      </CInputGroupText>
                      <CFormInput
                        type="number"
                        name="productLength"
                        placeholder="Length"
                        value={addForm.productLength}
                        onChange={handleAddChange}
                      />
                    </CInputGroup>
                    <CInputGroup>
                      <CInputGroupText>
                        <FaRulerCombined />
                      </CInputGroupText>
                      <CFormInput
                        type="number"
                        name="productWidth"
                        placeholder="Width"
                        value={addForm.productWidth}
                        onChange={handleAddChange}
                      />
                    </CInputGroup>
                    <CInputGroup>
                      <CInputGroupText>
                        <FaRulerCombined />
                      </CInputGroupText>
                      <CFormInput
                        type="number"
                        name="productHeight"
                        placeholder="Height"
                        value={addForm.productHeight}
                        onChange={handleAddChange}
                      />
                    </CInputGroup>
                  </div>
                </CCol>

                {/* Submit */}
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
          {/* Debug Section */}
          <CCard>
            <CCardBody>
              <CRow>
                {/* Product Name */}
                <CCol md={6} className="mb-3">
                  <label className="form-label">Product Name</label>
                  <CInputGroup>
                    <CInputGroupText>
                      <FaList />
                    </CInputGroupText>
                    <CFormInput
                      name="productName"
                      placeholder="Enter Product Name"
                      value={editForm.productName}
                      onChange={handleEditChange}
                    />
                  </CInputGroup>
                </CCol>

                {/* Product Slug (auto-generated, disabled) */}
                <CCol md={6} className="mb-3">
                  <label className="form-label">Product Slug</label>
                  <CInputGroup>
                    <CInputGroupText>
                      <FaTag />
                    </CInputGroupText>
                    <CFormInput
                      name="productSlug"
                      placeholder="Enter Product Slug"
                      value={editForm.productSlug}
                      disabled
                    />
                  </CInputGroup>
                </CCol>

                <CCol md={12} className="mb-3">
                  <label className="form-label">Product Tags</label>
                  <AsyncSelect
                    isMulti
                    cacheOptions
                    defaultOptions
                    loadOptions={loadTagOptions}
                    value={editForm.selectedTags}
                    onChange={(tags) => setEditForm((prev) => ({ ...prev, selectedTags: tags }))}
                    placeholder="Search & select tags..."
                  />
                </CCol>

                {/* Short Description */}
                <CCol md={12} className="mb-3">
                  <label className="form-label">Product Short Description</label>
                  <ReactQuill
                    theme="snow"
                    value={editForm.shortDescription}
                    onChange={(value) =>
                      setEditForm((prev) => ({ ...prev, shortDescription: value }))
                    }
                    placeholder="Write a short description..."
                    style={{ height: '150px', marginBottom: '50px' }}
                  />
                </CCol>

                {/* Long Description */}
                <CCol md={12} className="mb-3">
                  <label className="form-label">Product Long Description</label>
                  <ReactQuill
                    theme="snow"
                    value={editForm.longDescription}
                    onChange={(value) =>
                      setEditForm((prev) => ({ ...prev, longDescription: value }))
                    }
                    placeholder="Write a long description..."
                    style={{ height: '150px', marginBottom: '50px' }}
                  />
                </CCol>

                <>
                  {/* Attribute Multi Select */}
                  <CCol md={12} className="mb-3">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <select
                        className="form-select"
                        value={newAttribute}
                        onChange={(e) => setNewAttribute(e.target.value)}
                      >
                        <option value="">-- Select Attribute --</option>
                        {attributeOptions.map((attr) => (
                          <option key={attr._id} value={attr._id}>
                            {attr.name}
                          </option>
                        ))}
                      </select>

                      <CButton color="primary" onClick={handleAddAttribute}>
                        Add
                      </CButton>
                    </div>

                    {attributes.map((attr, index) => (
                      <div key={index} className="border rounded p-3 mt-3">
                        <div className="d-flex justify-content-between mb-2">
                          <strong>{attr.name}</strong>
                          <CButton
                            className="custom-hover-danger"
                            size="sm"
                            color="danger"
                            onClick={() => {
                              setAttributes((prev) => prev.filter((_, i) => i !== index))
                            }}
                          >
                            Remove
                          </CButton>
                        </div>

                        {/* Value Dropdown (like "Select Size") */}
                        <select
                          className="form-select mb-3"
                          onChange={(e) => handleValueSelect(index, e.target.value, true)}
                        >
                          <option value="">-- Select {attr.name} Value --</option>
                          {Array.isArray(attr.values) && attr.values.length > 0 ? (
                            attr.values.map((val) => (
                              <option key={val._id} value={val.name}>
                                {val.name}
                              </option>
                            ))
                          ) : (
                            <option disabled>No values found</option>
                          )}
                        </select>

                        {/* Render Each Selected Value Section */}
                        {attr.selectedValues.map((val) => (
                          <div key={val} className="border p-2 mb-2">
                            <strong>{val}</strong>
                            <CRow className="mt-2">
                              {/* Product Image */}

                              <CCol md={6} className="mb-3">
                                <label className="form-label">Product Images</label>
                                <CInputGroup>
                                  <CInputGroupText>
                                    <FaImage />
                                  </CInputGroupText>
                                  <CFormInput
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                      handleEditImageUpload(e, {
                                        type: 'attribute',
                                        attrIndex: index,
                                        value: val,
                                      })
                                    }
                                  />
                                </CInputGroup>

                                <div className="mt-2">
                                  {/* Show DB image only if no new file selected */}
                                  {attr.fields[val]?.image &&
                                    !attr.fields[val]?.imageFile &&
                                    !editForm.productMainImageFile && (
                                      <img
                                        src={
                                          attr.fields[val].image.startsWith('http')
                                            ? attr.fields[val].image
                                            : `http://udemandme.cloud${attr.fields[val].image}`
                                        }
                                        alt="db-preview"
                                        width="80"
                                        style={{
                                          border: '1px solid #ddd',
                                          borderRadius: '6px',
                                          padding: '2px',
                                        }}
                                      />
                                    )}

                                  {/* Show preview if a new file is selected */}
                                  {attr.fields[val]?.imageFile && (
                                    <img
                                      src={URL.createObjectURL(attr.fields[val].imageFile)}
                                      alt="preview"
                                      width="80"
                                    />
                                  )}
                                </div>
                              </CCol>

                              {/* SKU */}
                              <CCol md={6} className="mb-3">
                                <label className="form-label">SKU</label>
                                <CFormInput
                                  placeholder="Enter SKU"
                                  value={attr.fields[val].sku || ''}
                                  onChange={(e) =>
                                    handleFieldChange(index, val, 'sku', e.target.value)
                                  }
                                />
                              </CCol>

                              {/* Regular Price (INR) */}
                              <CCol md={6} className="mb-3">
                                <label className="form-label">Regular Price (AED)</label>
                                <CInputGroup>
                                  <CInputGroupText>
                                    <FaRupeeSign />
                                  </CInputGroupText>
                                  <CFormInput
                                    type="number"
                                    placeholder="Enter Regular Price"
                                    value={attr.fields[val].regularPriceInr || ''}
                                    onChange={(e) =>
                                      handleFieldChange(
                                        index,
                                        val,
                                        'regularPriceInr',
                                        e.target.value,
                                      )
                                    }
                                  />
                                </CInputGroup>
                              </CCol>

                              {/* Sale Price (INR) */}
                              <CCol md={6} className="mb-3">
                                <label className="form-label">Sale Price (AED)</label>
                                <CInputGroup>
                                  <CInputGroupText>
                                    <FaRupeeSign />
                                  </CInputGroupText>
                                  <CFormInput
                                    type="number"
                                    placeholder="Enter Sale Price"
                                    value={attr.fields[val].salePriceInr || ''}
                                    onChange={(e) =>
                                      handleFieldChange(index, val, 'salePriceInr', e.target.value)
                                    }
                                  />
                                </CInputGroup>
                              </CCol>

                              {/* Regular Price (USD) */}
                              <CCol md={6} className="mb-3">
                                <label className="form-label">Regular Price (USD)</label>
                                <CInputGroup>
                                  <CInputGroupText>
                                    <FaDollarSign />
                                  </CInputGroupText>
                                  <CFormInput
                                    type="number"
                                    placeholder="Enter Regular Price USD"
                                    value={attr.fields[val].regularPriceUsd || ''}
                                    onChange={(e) =>
                                      handleFieldChange(
                                        index,
                                        val,
                                        'regularPriceUsd',
                                        e.target.value,
                                      )
                                    }
                                  />
                                </CInputGroup>
                              </CCol>

                              {/* Sale Price (USD) */}
                              <CCol md={6} className="mb-3">
                                <label className="form-label">Sale Price (USD)</label>
                                <CInputGroup>
                                  <CInputGroupText>
                                    <FaDollarSign />
                                  </CInputGroupText>
                                  <CFormInput
                                    type="number"
                                    placeholder="Enter Sale Price USD"
                                    value={attr.fields[val].salePriceUsd || ''}
                                    onChange={(e) =>
                                      handleFieldChange(index, val, 'salePriceUsd', e.target.value)
                                    }
                                  />
                                </CInputGroup>
                              </CCol>
                              {/* Stock Dropdown */}
                              <CCol md={6} className="mb-3">
                                <label className="form-label">Stock Status</label>
                                <select
                                  className="form-select"
                                  value={(() => {
                                    // 1) try fields keyed by value (common in your attributes state)
                                    const f = attr?.fields?.[val]
                                    if (
                                      f &&
                                      f.stockStatus !== undefined &&
                                      f.stockStatus !== null
                                    ) {
                                      return f.stockStatus === '1' || f.stockStatus === 1
                                        ? 'In Stock'
                                        : 'Out of Stock'
                                    }
                                    // 2) fallback: find in attributeValues array (DB shape)
                                    const found = (attr?.attributeValues || []).find(
                                      (av) => av.attributeValue === val,
                                    )
                                    if (
                                      found &&
                                      found.attributeStockStatus !== undefined &&
                                      found.attributeStockStatus !== null
                                    ) {
                                      return found.attributeStockStatus === 1
                                        ? 'In Stock'
                                        : 'Out of Stock'
                                    }
                                    // 3) final safe default
                                    return ''
                                  })()}
                                  onChange={(e) => {
                                    const selected = e.target.value === 'In Stock' ? 1 : 0

                                    // Prefer updating attr.fields (UI attributes state)
                                    if (attr?.fields?.[val]) {
                                      // If your handleFieldChange expects 'stockStatus' as string '1'/'0'
                                      handleFieldChange(
                                        index,
                                        val,
                                        'stockStatus',
                                        selected === 1 ? '1' : '0',
                                      )
                                      return
                                    }

                                    // Otherwise update attributeStockStatus (DB-like shape)
                                    handleFieldChange(index, val, 'attributeStockStatus', selected)
                                  }}
                                >
                                  <option value="">-- Select Stock Status --</option>
                                  <option value="In Stock">In Stock</option>
                                  <option value="Out of Stock">Out of Stock</option>
                                </select>
                              </CCol>
                            </CRow>
                          </div>
                        ))}
                      </div>
                    ))}
                  </CCol>
                </>

                <CRow>
                  <CCol md={6} className="mb-3">
                    <label className="form-label">Select Product Categories</label>

                    <div
                      className="border rounded p-2"
                      style={{ maxHeight: '300px', overflowY: 'auto' }}
                      onScroll={(e) => {
                        const { scrollTop, scrollHeight, clientHeight } = e.target
                        if (
                          scrollTop + clientHeight >= scrollHeight - 10 &&
                          !loadingMoreCategories
                        ) {
                          loadMoreCategories()
                        }
                      }}
                    >
                      {displayedCategories.map((cat) => (
                        <div key={cat._id} style={{ marginLeft: '0px' }}>
                          {/* Top-level category */}
                          <div className="form-check mb-1">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id={cat._id}
                              checked={editForm.selectedCategories.some((c) => c._id === cat._id)}
                              onChange={(e) => {
                                const isChecked = e.target.checked
                                let newSelection
                                if (isChecked) {
                                  newSelection = [
                                    ...editForm.selectedCategories,
                                    { _id: cat._id, name: cat.name },
                                  ]
                                } else {
                                  newSelection = editForm.selectedCategories.filter(
                                    (c) => c._id !== cat._id,
                                  )
                                }
                                setEditForm((prev) => ({
                                  ...prev,
                                  selectedCategories: newSelection,
                                }))
                              }}
                            />
                            <label className="form-check-label" htmlFor={cat._id}>
                              {cat.name}
                            </label>
                          </div>

                          {/* Children Level 1 */}
                          {cat.children?.map((child1) => (
                            <div key={child1._id} style={{ marginLeft: '20px' }}>
                              <div className="form-check mb-1">
                                <input
                                  type="checkbox"
                                  className="form-check-input"
                                  id={child1._id}
                                  checked={editForm.selectedCategories.some(
                                    (c) => c._id === child1._id,
                                  )}
                                  onChange={(e) => {
                                    const isChecked = e.target.checked
                                    let newSelection
                                    if (isChecked) {
                                      newSelection = [
                                        ...editForm.selectedCategories,
                                        { _id: child1._id, name: child1.name },
                                      ]
                                    } else {
                                      newSelection = editForm.selectedCategories.filter(
                                        (c) => c._id !== child1._id,
                                      )
                                    }
                                    setEditForm((prev) => ({
                                      ...prev,
                                      selectedCategories: newSelection,
                                    }))
                                  }}
                                />
                                <label className="form-check-label" htmlFor={child1._id}>
                                  {child1.name}
                                </label>
                              </div>

                              {/* Children Level 2 */}
                              {child1.children?.map((child2) => (
                                <div key={child2._id} style={{ marginLeft: '40px' }}>
                                  <div className="form-check mb-1">
                                    <input
                                      type="checkbox"
                                      className="form-check-input"
                                      id={child2._id}
                                      checked={editForm.selectedCategories.some(
                                        (c) => c._id === child2._id,
                                      )}
                                      onChange={(e) => {
                                        const isChecked = e.target.checked
                                        let newSelection
                                        if (isChecked) {
                                          newSelection = [
                                            ...editForm.selectedCategories,
                                            { _id: child2._id, name: child2.name },
                                          ]
                                        } else {
                                          newSelection = editForm.selectedCategories.filter(
                                            (c) => c._id !== child2._id,
                                          )
                                        }
                                        setEditForm((prev) => ({
                                          ...prev,
                                          selectedCategories: newSelection,
                                        }))
                                      }}
                                    />
                                    <label className="form-check-label" htmlFor={child2._id}>
                                      {child2.name}
                                    </label>
                                  </div>

                                  {/* Children Level 3 */}
                                  {child2.children?.map((child3) => (
                                    <div key={child3._id} style={{ marginLeft: '60px' }}>
                                      <div className="form-check mb-1">
                                        <input
                                          type="checkbox"
                                          className="form-check-input"
                                          id={child3._id}
                                          checked={editForm.selectedCategories.some(
                                            (c) => c._id === child3._id,
                                          )}
                                          onChange={(e) => {
                                            const isChecked = e.target.checked
                                            let newSelection
                                            if (isChecked) {
                                              newSelection = [
                                                ...editForm.selectedCategories,
                                                { _id: child3._id, name: child3.name },
                                              ]
                                            } else {
                                              newSelection = editForm.selectedCategories.filter(
                                                (c) => c._id !== child3._id,
                                              )
                                            }
                                            setEditForm((prev) => ({
                                              ...prev,
                                              selectedCategories: newSelection,
                                            }))
                                          }}
                                        />
                                        <label className="form-check-label" htmlFor={child3._id}>
                                          {child3.name}
                                        </label>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      ))}
                      {loadingMoreCategories && <div>Loading more categories...</div>}
                    </div>
                  </CCol>

                  <CCol md={6} className="mb-3">
                    <label className="form-label">Select Product Brands</label>

                    <div
                      className="border rounded p-2"
                      style={{ maxHeight: '300px', overflowY: 'auto' }}
                      onScroll={(e) => {
                        const { scrollTop, scrollHeight, clientHeight } = e.target
                        if (scrollTop + clientHeight >= scrollHeight - 10 && !loadingMoreBrands) {
                          loadMoreBrands()
                        }
                      }}
                    >
                      {displayedBrands.map((brand) => {
                        const isChecked = editForm.selectedBrands.some(
                          (b) => b._id === brand._id || b.value === brand._id,
                        )
                        return (
                          <div key={brand._id}>
                            {/* Main brand */}
                            <div className="form-check mb-1">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                id={brand._id}
                                checked={isChecked}
                                onChange={(e) => {
                                  const checked = e.target.checked
                                  let newSelection
                                  if (checked) {
                                    newSelection = [
                                      ...editForm.selectedBrands,
                                      {
                                        _id: brand._id,
                                        name: brand.name,
                                        value: brand._id,
                                        label: brand.name,
                                      },
                                    ]
                                  } else {
                                    newSelection = editForm.selectedBrands.filter(
                                      (b) => b._id !== brand._id && b.value !== brand._id,
                                    )
                                  }
                                  setEditForm((prev) => ({ ...prev, selectedBrands: newSelection }))
                                }}
                              />
                              <label className="form-check-label" htmlFor={brand._id}>
                                {brand.name}
                              </label>
                            </div>

                            {/* Nested children if any */}
                            {brand.children?.map((child1) => {
                              const isChild1Checked = editForm.selectedBrands.some(
                                (b) => b._id === child1._id || b.value === child1._id,
                              )
                              return (
                                <div key={child1._id} style={{ marginLeft: '20px' }}>
                                  <div className="form-check mb-1">
                                    <input
                                      type="checkbox"
                                      className="form-check-input"
                                      id={child1._id}
                                      checked={isChild1Checked}
                                      onChange={(e) => {
                                        const checked = e.target.checked
                                        let newSelection
                                        if (checked) {
                                          newSelection = [
                                            ...editForm.selectedBrands,
                                            {
                                              _id: child1._id,
                                              name: child1.name,
                                              value: child1._id,
                                              label: child1.name,
                                            },
                                          ]
                                        } else {
                                          newSelection = editForm.selectedBrands.filter(
                                            (b) => b._id !== child1._id && b.value !== child1._id,
                                          )
                                        }
                                        setEditForm((prev) => ({
                                          ...prev,
                                          selectedBrands: newSelection,
                                        }))
                                      }}
                                    />
                                    <label className="form-check-label" htmlFor={child1._id}>
                                      {child1.name}
                                    </label>
                                  </div>

                                  {child1.children?.map((child2) => {
                                    const isChild2Checked = editForm.selectedBrands.some(
                                      (b) => b._id === child2._id || b.value === child2._id,
                                    )
                                    return (
                                      <div key={child2._id} style={{ marginLeft: '40px' }}>
                                        <div className="form-check mb-1">
                                          <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id={child2._id}
                                            checked={isChild2Checked}
                                            onChange={(e) => {
                                              const checked = e.target.checked
                                              let newSelection
                                              if (checked) {
                                                newSelection = [
                                                  ...editForm.selectedBrands,
                                                  {
                                                    _id: child2._id,
                                                    name: child2.name,
                                                    value: child2._id,
                                                    label: child2.name,
                                                  },
                                                ]
                                              } else {
                                                newSelection = editForm.selectedBrands.filter(
                                                  (b) =>
                                                    b._id !== child2._id && b.value !== child2._id,
                                                )
                                              }
                                              setEditForm((prev) => ({
                                                ...prev,
                                                selectedBrands: newSelection,
                                              }))
                                            }}
                                          />
                                          <label className="form-check-label" htmlFor={child2._id}>
                                            {child2.name}
                                          </label>
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              )
                            })}
                          </div>
                        )
                      })}
                      {loadingMoreBrands && <div>Loading more brands...</div>}
                    </div>
                  </CCol>

                  <CCol md={6} className="mb-3">
                    <label className="form-label">Regular Price (AED)</label>
                    <CInputGroup>
                      <CInputGroupText>
                        <FaRupeeSign />
                      </CInputGroupText>
                      <CFormInput
                        type="number"
                        placeholder="Enter Product Regular Price"
                        name="productRegularPriceInr"
                        value={editForm.productRegularPriceInr}
                        onChange={handleEditChange}
                      />
                    </CInputGroup>
                  </CCol>

                  <CCol md={6} className="mb-3">
                    <label className="form-label">Sale Price (AED)</label>
                    <CInputGroup>
                      <CInputGroupText>
                        <FaRupeeSign />
                      </CInputGroupText>
                      <CFormInput
                        type="number"
                        placeholder="Enter Product Sale Price"
                        name="productSalePriceInr"
                        value={editForm.productSalePriceInr}
                        onChange={handleEditChange}
                      />
                    </CInputGroup>
                  </CCol>

                  <CCol md={6} className="mb-3">
                    <label className="form-label">Regular Price (USD)</label>
                    <CInputGroup>
                      <CInputGroupText>
                        <FaDollarSign />
                      </CInputGroupText>
                      <CFormInput
                        type="number"
                        placeholder="Enter Product Regular Price USD"
                        name="productRegularPriceUsd"
                        value={editForm.productRegularPriceUsd}
                        onChange={handleEditChange}
                      />
                    </CInputGroup>
                  </CCol>

                  <CCol md={6} className="mb-3">
                    <label className="form-label">Sale Price (USD)</label>
                    <CInputGroup>
                      <CInputGroupText>
                        <FaDollarSign />
                      </CInputGroupText>
                      <CFormInput
                        type="number"
                        placeholder="Enter Product Sale Price USD"
                        name="productSalePriceUsd"
                        value={editForm.productSalePriceUsd}
                        onChange={handleEditChange}
                      />
                    </CInputGroup>
                  </CCol>
                </CRow>

                <CCol md={6} className="mb-3">
                  <label className="form-label">Product Image</label>
                  <CInputGroup>
                    <CInputGroupText>
                      <FaImage />
                    </CInputGroupText>
                    <CFormInput
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0]
                        if (!file) return
                        // store the new file in editForm state
                        setEditForm((prev) => ({
                          ...prev,
                          productImageFile: file, // for preview
                        }))
                      }}
                    />
                  </CInputGroup>

                  <div className="mt-2">
                    {/* Show DB image only if no new file selected */}
                    {editForm.productImage && !editForm.productImageFile && (
                      <img
                        src={
                          editForm.productImage.startsWith('http')
                            ? editForm.productImage
                            : `http://udemandme.cloud${editForm.productImage}`
                        }
                        alt="db-preview"
                        width="80"
                        style={{ border: '1px solid #ddd', borderRadius: '6px', padding: '2px' }}
                      />
                    )}

                    {/* Show preview of newly selected file */}
                    {editForm.productImageFile && (
                      <img
                        src={URL.createObjectURL(editForm.productImageFile)}
                        alt="preview"
                        width="80"
                        style={{ border: '1px solid #ddd', borderRadius: '6px', padding: '2px' }}
                      />
                    )}
                  </div>
                </CCol>

                <CCol md={6} className="mb-3">
                  <label className="form-label">Product Gallery Images</label>
                  <CInputGroup>
                    <CInputGroupText>
                      <FaImages />
                    </CInputGroupText>
                    <CFormInput type="file" multiple onChange={handleEditGalleryImagesUpload} />
                  </CInputGroup>

                  <div className="d-flex gap-2 mt-2 flex-wrap">
                    {editForm.productGalleryImages?.map((img, index) => (
                      <div
                        key={index}
                        style={{ position: 'relative', width: '60px', height: '60px' }}
                      >
                        <img
                          src={
                            typeof img === 'string'
                              ? img.startsWith('http')
                                ? img
                                : `http://udemandme.cloud${img}`
                              : URL.createObjectURL(img)
                          }
                          alt={`gallery-${index}`}
                          width="60"
                          height="60"
                          style={{ objectFit: 'cover', borderRadius: '4px' }}
                        />
                        <button
                          type="button"
                          onClick={() => handleEditRemoveGalleryImage(index)}
                          style={{
                            position: 'absolute',
                            top: '-6px',
                            right: '-6px',
                            backgroundColor: 'red',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '20px',
                            height: '20px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 0,
                          }}
                        >
                          <FaTimes size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </CCol>

                {/* SKU */}
                <CCol md={6} className="mb-3">
                  <label className="form-label">SKU</label>
                  <CInputGroup>
                    <CInputGroupText>
                      <FaTag />
                    </CInputGroupText>
                    <CFormInput
                      name="productSku"
                      value={editForm.productSku}
                      onChange={handleEditChange}
                    />
                  </CInputGroup>
                </CCol>

                {/* Stock */}
                <CCol md={6} className="mb-3">
                  <label className="form-label">Stock</label>
                  <select
                    name="productStock"
                    className="form-select"
                    value={editForm.productStock}
                    onChange={handleEditChange}
                  >
                    <option value="">Select Stock Status</option>
                    <option value="1">In Stock</option>
                    <option value="0">Out of Stock</option>
                  </select>
                </CCol>

                <CCol md={6} className="mb-3">
                  <label className="form-label">Weight (kg)</label>
                  <CInputGroup>
                    <CInputGroupText>
                      <FaWeightHanging />
                    </CInputGroupText>
                    <CFormInput
                      name="productWeight"
                      placeholder="Enter product weight"
                      value={editForm.productWeight || ''}
                      onChange={handleEditChange}
                    />
                  </CInputGroup>
                </CCol>

                <CCol xs={6}>
                  <label className="form-label">Dimensions (cm)</label>
                  <div className="d-flex gap-2">
                    <CInputGroup>
                      <CInputGroupText>
                        <FaRulerCombined />
                      </CInputGroupText>
                      <CFormInput
                        type="number"
                        name="productLength"
                        placeholder="Length"
                        value={editForm.productLength}
                        onChange={handleEditChange}
                      />
                    </CInputGroup>
                    <CInputGroup>
                      <CInputGroupText>
                        <FaRulerCombined />
                      </CInputGroupText>
                      <CFormInput
                        type="number"
                        name="productWidth"
                        placeholder="Width"
                        value={editForm.productWidth}
                        onChange={handleEditChange}
                      />
                    </CInputGroup>
                    <CInputGroup>
                      <CInputGroupText>
                        <FaRulerCombined />
                      </CInputGroupText>
                      <CFormInput
                        type="number"
                        name="productHeight"
                        placeholder="Height"
                        value={editForm.productHeight}
                        onChange={handleEditChange}
                      />
                    </CInputGroup>
                  </div>
                </CCol>

                <CCol xs={12}>
                  <CButton color="primary" onClick={handleEditSubmit}>
                    Update Product
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
                        checked={selectedRows.length === products.length && products.length > 0}
                        onChange={handleSelectAll}
                      />
                    </CTableHeaderCell>
                    <CTableHeaderCell>Name</CTableHeaderCell>
                    <CTableHeaderCell>SKU</CTableHeaderCell>
                    <CTableHeaderCell>Stock</CTableHeaderCell>
                    <CTableHeaderCell>Price</CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                    <CTableHeaderCell className="text-end">Actionss</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {products.map((p) => (
                    <CTableRow key={p.id}>
                      <CTableDataCell>
                        <input
                          type="checkbox"
                          checked={selectedRows.some((r) => r.id === p.id)}
                          onChange={() => handleCheckboxChange(p)}
                        />
                      </CTableDataCell>
                      <CTableDataCell>{p.name}</CTableDataCell>
                      <CTableDataCell>{p.sku}</CTableDataCell>
                      <CTableDataCell>
                        <span className={`badge ${p.stock > 0 ? 'bg-success' : 'bg-danger'}`}>
                          {p.stock > 0 ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </CTableDataCell>
                      <CTableDataCell>AED {p.regularPriceInr}</CTableDataCell>
                      <CTableDataCell>
                        <select
                          className="form-select form-select-sm"
                          value={Number(p.stock)}
                          onChange={(e) => handleStockChange(p.id, Number(e.target.value))}
                        >
                          <option value={1}>In Stock</option>
                          <option value={0}>Out of Stock</option>
                        </select>
                      </CTableDataCell>
                      <CTableDataCell className="text-end d-flex gap-2 justify-content-end">
                        <CButton
                          size="sm"
                          className="btn btn-outline-success btn-sm d-flex align-items-center gap-1 rounded-sm custom-hover-success"
                          onClick={() => handleEditClick(p)}
                        >
                          <FaEdit /> Edit
                        </CButton>
                        <CButton
                          size="sm"
                          className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1 rounded-sm custom-hover-danger"
                          onClick={() => handleDelete(p.id)}
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

          {/* SMART PAGINATION */}
          {pages > 1 && (
            <div className="d-flex justify-content-end mt-3">
              <nav>
                <ul className="pagination pagination-sm">
                  {/* Prev Button */}
                  <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => setPage((p) => p - 1)}>
                      « Prev
                    </button>
                  </li>

                  {/* Dynamic Page Window */}
                  {[...Array(5)].map((_, i) => {
                    const pageNumber = page - 2 + i
                    if (pageNumber > 0 && pageNumber <= pages) {
                      return (
                        <li
                          key={pageNumber}
                          className={`page-item ${page === pageNumber ? 'active' : ''}`}
                        >
                          <button className="page-link" onClick={() => setPage(pageNumber)}>
                            {pageNumber}
                          </button>
                        </li>
                      )
                    }
                    return null
                  })}

                  {/* Next Button */}
                  <li className={`page-item ${page === pages ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => setPage((p) => p + 1)}>
                      Next »
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </CCol>
      )}
    </CRow>
  )
}

export default Allproducts
