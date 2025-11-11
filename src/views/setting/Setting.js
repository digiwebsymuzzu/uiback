import React, { useState, useEffect, memo } from 'react'
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
  FaGlobe,
  FaReceipt,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaImage,
  FaLinkedin,
  FaInstagram,
  FaYoutube,
  FaFacebook,
  FaTwitter,
} from 'react-icons/fa'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// ✅ Memoized reusable input component
const InputWithIcon = memo(function InputWithIcon({
  label,
  icon,
  type = 'text',
  placeholder,
  name,
  value,
  onChange,
}) {
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
        />
      </CInputGroup>
    </div>
  )
})

const Setting = () => {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    website: '',
    address: '',
    tax: '',
    logo: null, // File or null
    linkedin: '',
    instagram: '',
    youtube: '',
    facebook: '',
    twitter: '',
  })
  const [logoPreview, setLogoPreview] = useState(null)

  const buildLogoUrl = (path) => {
    if (!path) return null
    const clean = path.startsWith('/') ? path.slice(1) : path
    return `https://udemandme.cloud/${clean}`
  }

  // 🔹 Fetch existing settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('https://udemandme.cloud/api/settings', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        })

        const data = await res.json()
        if (res.ok && data.success && data.settings) {
          const s = data.settings
          setFormData({
            name: s.name || '',
            mobile: s.mobile || '',
            email: s.email || '',
            website: s.website || '',
            address: s.address || '',
            tax: s.tax || '',
            logo: null, // keep null for uploads
            linkedin: s.linkedin || '',
            instagram: s.instagram || '',
            youtube: s.youtube || '',
            facebook: s.facebook || '',
            twitter: s.twitter || '',
          })
          if (s.logo) setLogoPreview(buildLogoUrl(s.logo))
        } else {
          toast.error((data && data.message) || 'Failed to fetch settings')
        }
      } catch (err) {
        console.error('Fetch error:', err)
        toast.error('Something went wrong while fetching settings')
      }
    }

    fetchSettings()
  }, [])

  // 🔹 Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // 🔹 Handle logo upload + preview
  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData((prev) => ({ ...prev, logo: file }))
      setLogoPreview(URL.createObjectURL(file))
    }
  }

  // 🔹 Submit form
  const handleSubmit = async () => {
    try {
      const { logo, ...textFields } = formData

      let res
      // If a file is selected, send multipart/form-data
      if (logo instanceof File) {
        const fd = new FormData()
        Object.entries(textFields).forEach(([k, v]) => fd.append(k, v ?? ''))
        fd.append('logo', logo)

        res = await fetch('https://udemandme.cloud/api/settings/update', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            // ⚠️ Don't set Content-Type; browser will set boundary for FormData
          },
          body: fd,
        })
      } else {
        // Otherwise keep your existing JSON update
        res = await fetch('https://udemandme.cloud/api/settings/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(textFields),
        })
      }

      const data = await res.json()
      if (res.ok && data.success && data.settings) {
        toast.success('Settings updated successfully!')
        const s = data.settings
        setFormData((prev) => ({
          ...prev,
          name: s.name || '',
          mobile: s.mobile || '',
          email: s.email || '',
          website: s.website || '',
          address: s.address || '',
          tax: s.tax || '',
          logo: null, // reset to allow re-upload of same file
          linkedin: s.linkedin || '',
          instagram: s.instagram || '',
          youtube: s.youtube || '',
          facebook: s.facebook || '',
          twitter: s.twitter || '',
        }))
        if (s.logo) setLogoPreview(buildLogoUrl(s.logo))
      } else {
        toast.error((data && data.message) || 'Failed to update settings')
      }
    } catch (err) {
      console.error('Settings update error:', err)
      toast.error('Something went wrong')
    }
  }

  return (
    <CRow className="g-4">
      <ToastContainer position="top-right" autoClose={3000} />
      <CCol xs={12} md={12}>
        <CCard className="shadow-sm">
          <CCardBody>
            {/* Header */}
            <CRow className="align-items-center mb-4">
              <CCol>
                <h5 className="fw-bold mb-0">Company Settings</h5>
              </CCol>
            </CRow>

            {/* Form */}
            <CRow>
              <CCol md={6}>
                <InputWithIcon
                  label="Name"
                  icon={<FaUser />}
                  name="name"
                  placeholder="Enter company name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </CCol>
              <CCol md={6}>
                <InputWithIcon
                  label="Mobile Number"
                  icon={<FaPhoneAlt />}
                  type="text"
                  name="mobile"
                  placeholder="Enter phone number"
                  value={formData.mobile}
                  onChange={handleChange}
                />
              </CCol>
              <CCol md={6}>
                <InputWithIcon
                  label="Email"
                  icon={<FaEnvelope />}
                  type="email"
                  name="email"
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </CCol>
              <CCol md={6}>
                <InputWithIcon
                  label="Website"
                  icon={<FaGlobe />}
                  name="website"
                  placeholder="Enter website"
                  value={formData.website}
                  onChange={handleChange}
                />
              </CCol>
              <CCol md={6}>
                <InputWithIcon
                  label="Address"
                  icon={<FaMapMarkerAlt />}
                  name="address"
                  placeholder="Enter address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </CCol>
              <CCol md={6}>
                <InputWithIcon
                  label="Tax"
                  icon={<FaReceipt />}
                  name="tax"
                  placeholder="Enter tax number"
                  value={formData.tax}
                  onChange={handleChange}
                />
              </CCol>

              {/* Logo Upload */}
              <CCol md={6}>
                <label className="form-label fw-semibold">Company Logo</label>
                <CInputGroup>
                  <CInputGroupText>
                    <FaImage />
                  </CInputGroupText>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </CInputGroup>
                {logoPreview && (
                  <img
                    src={logoPreview}
                    alt="Logo Preview"
                    className="mt-2"
                    style={{ width: '120px', height: 'auto' }}
                  />
                )}
              </CCol>

              {/* Social Links */}
              <CCol md={6}>
                <InputWithIcon
                  label="LinkedIn"
                  icon={<FaLinkedin />}
                  name="linkedin"
                  placeholder="LinkedIn URL"
                  value={formData.linkedin}
                  onChange={handleChange}
                />
              </CCol>
              <CCol md={6}>
                <InputWithIcon
                  label="Instagram"
                  icon={<FaInstagram />}
                  name="instagram"
                  placeholder="Instagram URL"
                  value={formData.instagram}
                  onChange={handleChange}
                />
              </CCol>
              <CCol md={6}>
                <InputWithIcon
                  label="YouTube"
                  icon={<FaYoutube />}
                  name="youtube"
                  placeholder="YouTube URL"
                  value={formData.youtube}
                  onChange={handleChange}
                />
              </CCol>
              <CCol md={6}>
                <InputWithIcon
                  label="Facebook"
                  icon={<FaFacebook />}
                  name="facebook"
                  placeholder="Facebook URL"
                  value={formData.facebook}
                  onChange={handleChange}
                />
              </CCol>
              <CCol md={6}>
                <InputWithIcon
                  label="Twitter"
                  icon={<FaTwitter />}
                  name="twitter"
                  placeholder="Twitter URL"
                  value={formData.twitter}
                  onChange={handleChange}
                />
              </CCol>

              {/* Submit */}
              <CCol xs={12} className="text-start mt-3">
                <CButton color="primary" onClick={handleSubmit}>
                  Update
                </CButton>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Setting
