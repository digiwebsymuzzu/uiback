import React, { useRef, useState } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import Swal from 'sweetalert2'
import {
  CCard,
  CCardBody,
  CCol,
  CFormInput,
  CRow,
  CButton,
  CInputGroup,
  CInputGroupText,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
} from '@coreui/react'

import {
  FaUser,
  FaUserTag,
  FaUserCircle,
  FaEnvelope,
  FaLock,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaInfoCircle,
  FaEye,
  FaEyeSlash,
  FaEdit,
  FaTrash,
} from 'react-icons/fa'

import logo from 'src/assets/images/profile.jpg'

const Customer = () => {
  const fileInputRef = useRef(null)
  const [image, setImage] = useState(logo)
  const [password, setPassword] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editCustomerData, setEditCustomerData] = useState(null)

  const [customers, setCustomers] = useState([
    {
      id: 1,
      name: 'John Doe',
      role: 'Frontend Developer',
      email: 'john@gmail.com',
      phone: '+1234567890',
      address: '123 Main St',
      image: logo,
    },
  ])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const imageURL = URL.createObjectURL(file)
      setImage(imageURL)
    }
  }

  const handleClick = () => {
    fileInputRef.current.click()
  }

  const handleSubmit = () => {
    setShowForm(false)
    toast.success('Customer added successfully!')
  }

  const handleEdit = (cust) => {
    setEditCustomerData(cust)
    setShowForm(false)
    setShowEditForm(true)
    setImage(cust.image)
  }

  const handleEditSubmit = () => {
    setShowEditForm(false)
    toast.success('Customer updated successfully!')
  }

  const confirmDelete = (id) => {
    Swal.fire({
      icon: 'warning',
      title: 'Are you sure?',
      text: 'This action cannot be undone.',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#d33',
    }).then((result) => {
      if (result.isConfirmed) {
        setCustomers(customers.filter((c) => c.id !== id))
        toast.success('Customer deleted successfully!')
      }
    })
  }

  const InputWithIcon = ({ label, icon, type = 'text', placeholder }) => (
    <div className="mb-3">
      <label className="form-label fw-semibold">{label}</label>
      <CInputGroup>
        <CInputGroupText>{icon}</CInputGroupText>
        <CFormInput type={type} placeholder={placeholder} />
      </CInputGroup>
    </div>
  )

  const renderForm = (isEdit = false) => (
    <>
      <CCol xs={12} md={4}>
        <CCard className="shadow-sm text-center p-3">
          <img
            src={image}
            alt="Profile"
            className="img-fluid rounded-circle mb-3 mx-auto d-block"
            style={{ width: '150px', height: '150px', objectFit: 'cover' }}
          />
          <h5 className="mb-1 fw-bold">{isEdit ? editCustomerData.name : 'John Doe'}</h5>
          <p className="text-muted mb-2">{isEdit ? editCustomerData.role : 'Frontend Developer'}</p>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageChange}
            style={{ display: 'none' }}
          />
          <CButton color="primary" variant="outline" size="sm" onClick={handleClick}>
            Change Photo
          </CButton>
        </CCard>
        <CCard className="shadow-sm text-start mt-4 p-3">
          <h6 className="mb-3 fw-bold d-flex align-items-center gap-2">
            <FaUser />
            Contact
          </h6>
          <p className="mb-2 text-lg fs-6 fw-semibold d-flex align-items-center gap-2">
            <FaUserCircle />
            Frontend Developer
          </p>
          <p className="mb-2 text-lg fs-6 fw-semibold d-flex align-items-center gap-2">
            <FaPhoneAlt />
            +1234567890
          </p>
          <p className="mb-2 text-lg fs-6 fw-semibold d-flex align-items-center gap-2">
            <FaEnvelope />
            john@gmail.com
          </p>
          <p className="mb-2 text-lg fs-6 fw-semibold d-flex align-items-center gap-2">
            <FaMapMarkerAlt />
            address
          </p>
        </CCard>
      </CCol>

      <CCol xs={12} md={8}>
        <CCard className="shadow-sm">
          <CCardBody>
            <CRow>
              <CCol md={6}>
                <InputWithIcon label="Username" icon={<FaUser />} placeholder="Enter username" />
              </CCol>
              <CCol md={6}>
                <InputWithIcon label="Role" icon={<FaUserTag />} placeholder="Enter role" />
              </CCol>
              <CCol md={6}>
                <InputWithIcon label="Full Name" icon={<FaUserCircle />} placeholder="Enter name" />
              </CCol>
              <CCol md={6}>
                <InputWithIcon
                  label="Email"
                  icon={<FaEnvelope />}
                  type="email"
                  placeholder="Enter email"
                />
              </CCol>

              <CCol md={6}>
                <label className="form-label fw-semibold">Password</label>
                <CInputGroup>
                  <CInputGroupText>
                    <FaLock />
                  </CInputGroupText>
                  <CFormInput
                    type={password ? 'text' : 'password'}
                    placeholder="Enter your password"
                  />
                  <CInputGroupText
                    style={{ cursor: 'pointer' }}
                    onClick={() => setPassword(!password)}
                  >
                    {password ? <FaEye /> : <FaEyeSlash />}
                  </CInputGroupText>
                </CInputGroup>
              </CCol>

              <CCol md={6}>
                <InputWithIcon
                  label="Phone Number"
                  icon={<FaPhoneAlt />}
                  type="number"
                  placeholder="Enter phone"
                />
              </CCol>
              <CCol md={12}>
                <InputWithIcon
                  label="Address"
                  icon={<FaMapMarkerAlt />}
                  placeholder="Enter address"
                />
              </CCol>
              <CCol md={12}>
                <label className="form-label fw-semibold">Description</label>
                <CInputGroup>
                  <CInputGroupText>
                    <FaInfoCircle />
                  </CInputGroupText>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Write something..."
                  ></textarea>
                </CInputGroup>
              </CCol>

              <CCol xs={12} className="text-start mt-3">
                <CButton color="primary" onClick={isEdit ? handleEditSubmit : handleSubmit}>
                  {isEdit ? 'Update Customer' : 'Submit Form'}
                </CButton>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      </CCol>
    </>
  )

  return (
    <CRow className="g-4">
      <ToastContainer position="top-right" autoClose={3000} />
      <CCol xs={12} className="d-flex justify-content-between align-items-center">
        <h4 className="fw-bold mb-0">
          {showForm ? 'Add Customer' : showEditForm ? 'Edit Customer' : 'Customer List'}
        </h4>
        {!showForm && !showEditForm && (
          <CButton
            color="primary"
            onClick={() => {
              setShowForm(true)
              setShowEditForm(false)
            }}
          >
            + Add Customer
          </CButton>
        )}
      </CCol>

      {showForm && renderForm(false)}
      {showEditForm && renderForm(true)}

      {!showForm && !showEditForm && (
        <CCol xs={12}>
          <CCard className="shadow-sm">
            <CCardBody>
              <CTable striped hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Id</CTableHeaderCell>
                    <CTableHeaderCell>Customer Image</CTableHeaderCell>
                    <CTableHeaderCell>Name</CTableHeaderCell>
                    <CTableHeaderCell>Email</CTableHeaderCell>
                    <CTableHeaderCell>Role</CTableHeaderCell>
                    <CTableHeaderCell>Phone</CTableHeaderCell>
                    <CTableHeaderCell className="text">Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {customers.map((cust) => (
                    <CTableRow key={cust.id}>
                      <CTableDataCell>{cust.id}</CTableDataCell>
                      <CTableDataCell>
                        <img
                          src={cust.image}
                          alt="Profile"
                          style={{ width: '30px', height: '30px', borderRadius: '50%' }}
                        />
                      </CTableDataCell>
                      <CTableDataCell>{cust.name}</CTableDataCell>
                      <CTableDataCell>{cust.email}</CTableDataCell>
                      <CTableDataCell>{cust.role}</CTableDataCell>
                      <CTableDataCell>{cust.phone}</CTableDataCell>

                      <CTableDataCell className="text-end d-flex gap-2 justify-content-end">
                        <CButton
                          size="sm"
                          color="success"
                          variant="outline"
                          className="d-flex align-items-center gap-1 rounded-sm custom-hover-success"
                          onClick={() => handleEdit(cust)}
                        >
                          <FaEdit />
                          <span>Edit</span>
                        </CButton>

                        <CButton
                          size="sm"
                          color="danger"
                          variant="outline"
                          onClick={() => confirmDelete(cust.id)}
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
      )}
    </CRow>
  )
}

export default Customer
