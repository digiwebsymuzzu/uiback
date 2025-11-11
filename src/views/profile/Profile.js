import React, { useRef, useState, useEffect, memo } from 'react'
import {
  CCard,
  CCardBody,
  CCol,
  CFormInput,
  CRow,
  CButton,
  CInputGroup,
  CInputGroupText,
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
} from 'react-icons/fa'
import logo from 'src/assets/images/profile.jpg'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const DEBUG = true

// ✅ Extracted input field component
const InputWithIcon = memo(function InputWithIcon({
  label,
  icon,
  type = 'text',
  placeholder,
  name,
  value,
  onChange,
  onFocus,
  onBlur,
}) {
  useEffect(() => {
    if (DEBUG) console.log(`[MOUNT] <InputWithIcon name="${name}">`)
    return () => {
      if (DEBUG) console.log(`[UNMOUNT] <InputWithIcon name="${name}">`)
    }
  }, [name])

  return (
    <div className="mb-3">
      <label className="form-label fw-semibold">{label}</label>
      <CInputGroup>
        <CInputGroupText>{icon}</CInputGroupText>
        <CFormInput
          type={type}
          placeholder={placeholder}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
        />
      </CInputGroup>
    </div>
  )
})

const Profile = () => {
  if (DEBUG) console.log('[RENDER] <Profile>')

  const fileInputRef = useRef(null)
  const [image, setImage] = useState(logo)
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)

  // 🔹 Form state
  const [formData, setFormData] = useState({
    username: '',
    role: '',
    fullName: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    description: '',
  })

  // 🔹 Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('http://udemandme.cloud/api/profile', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        })

        const data = await res.json()
        console.log('🔥 Raw API response:', data)

        if (res.ok && data._id) {
          setFormData({
            username: data.username || '', // if you don’t have username, leave blank
            role: data.role || '', // same for role
            fullName: data.fullName || '',
            email: data.email || '',
            password: '', // never show password
            phone: data.phone || '',
            address: data.address || '',
            description: data.description || '',
          })
        } else {
          toast.error('Failed to fetch profile')
        }
      } catch (err) {
        console.error(err)
        toast.error('Something went wrong fetching profile')
      }
    }

    fetchProfile()
  }, [])

  // 🔹 Handlers
  const handleChange = (e) => {
    const { name, value } = e.target
    if (DEBUG) console.log('[CHANGE]', name, '→', value)
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFocus = (e) => {
    if (DEBUG) console.log('[FOCUS]', e.target.name)
  }

  const handleBlur = (e) => {
    if (DEBUG)
      console.log(
        '[BLUR]',
        e.target.name,
        '→ next activeElement:',
        document.activeElement?.tagName,
        document.activeElement?.className || '',
      )
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const imageURL = URL.createObjectURL(file)
      setImage(imageURL)
      setSelectedFile(file)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  // 🔹 Submit profile update
  const handleSubmit = async () => {
    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        address: formData.address,
        description: formData.description,
      }

      const res = await fetch('http://udemandme.cloud/api/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // ✅ important
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload), // ✅ must stringify
      })

      const data = await res.json()
      if (data.success) {
        toast.success('Profile updated successfully!')
        setFormData((prev) => ({
          ...prev,
          ...data.profile,
          password: '', // clear password field
        }))
      } else {
        toast.error(data.message || 'Failed to update profile')
      }
    } catch (err) {
      console.error('Profile update error:', err)
      toast.error('Something went wrong')
    }
  }

  return (
    <CRow className="g-4">
      <ToastContainer position="top-right" autoClose={3000} />
      {/* Left Panel: Profile Image */}
      <CCol xs={12} md={4}>
        <CCard className="shadow-sm text-center p-3">
          <img
            src={image}
            alt="Profile"
            className="img-fluid rounded-circle mb-3 mx-auto d-block"
            style={{ width: '150px', height: '150px', objectFit: 'cover' }}
          />
          <h5 className="mb-1 fw-bold">{formData.fullName || 'John Doe'}</h5>
          <p className="text-muted mb-2">{formData.role || 'Admin'}</p>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageChange}
            style={{ display: 'none' }}
          />
        </CCard>
        <CCard className="shadow-sm text-start mt-4 p-3">
          <h6 className="mb-3 fw-bold d-flex align-items-center gap-2">
            <FaUser />
            Contact
          </h6>
          <p className="mb-2 fs-6 fw-semibold d-flex align-items-center gap-2">
            <FaUserCircle />
            {formData.role || 'Admin'}
          </p>
          <p className="mb-2 fs-6 fw-semibold d-flex align-items-center gap-2">
            <FaPhoneAlt />
            +971 {formData.phone || '+1234567890'}
          </p>
          <p className="mb-2 fs-6 fw-semibold d-flex align-items-center gap-2">
            <FaEnvelope />
            {formData.email || 'john@gmail.com'}
          </p>
          <p className="mb-2 fs-6 fw-semibold d-flex align-items-center gap-2">
            <FaMapMarkerAlt />
            {formData.address || 'Address'}
          </p>
        </CCard>
      </CCol>

      {/* Right Panel: Form Fields */}
      <CCol xs={12} md={8}>
        <CCard className="shadow-sm">
          <CCardBody>
            <CRow>
              <CCol md={6}>
                <InputWithIcon
                  label="Full Name"
                  icon={<FaUserCircle />}
                  placeholder="Enter your name"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </CCol>
              <CCol md={6}>
                <InputWithIcon
                  label="Email"
                  icon={<FaEnvelope />}
                  type="email"
                  placeholder="Enter your email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </CCol>

              <CCol md={6}>
                <label className="form-label fw-semibold">Password</label>
                <CInputGroup>
                  <CInputGroupText>
                    <FaLock />
                  </CInputGroupText>
                  <CFormInput
                    type={passwordVisible ? 'text' : 'password'}
                    placeholder="Enter your password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <CInputGroupText
                    style={{ cursor: 'pointer' }}
                    onClick={() => setPasswordVisible(!passwordVisible)}
                  >
                    {passwordVisible ? <FaEye /> : <FaEyeSlash />}
                  </CInputGroupText>
                </CInputGroup>
              </CCol>

              <CCol md={6}>
                <InputWithIcon
                  label="Phone Number"
                  icon={<FaPhoneAlt />}
                  type="text"
                  placeholder="Enter phone number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </CCol>
              <CCol md={12}>
                <InputWithIcon
                  label="Address"
                  icon={<FaMapMarkerAlt />}
                  placeholder="Enter address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </CCol>
              {/* Description Field */}
              <CCol md={12}>
                <label className="form-label fw-semibold">Description</label>
                <CInputGroup>
                  <CInputGroupText>
                    <FaInfoCircle />
                  </CInputGroupText>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Write something about yourself..."
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  ></textarea>
                </CInputGroup>
              </CCol>
              {/* Submit Button */}
              <CCol xs={12} className="text-start mt-3">
                <CButton color="primary" onClick={handleSubmit}>
                  Update Profile
                </CButton>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Profile
