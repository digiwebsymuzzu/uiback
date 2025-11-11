import React from 'react'
import { Link } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'
import logo from 'src/assets/images/logo.webp'

const Login = () => {
  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={6}>

            <div className='mb-3 text-center'>
              <img src={logo} className='img-fluid'/>
            </div>


            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm>
                    <h1>Reset Your Password</h1>
                    <p className="text-body-secondary">Enter Your Email</p>
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput placeholder="Enter Your Email" autoComplete="username" />
                    </CInputGroup>
                    <CRow>
                      <CCol xs={8}>
                        <CButton color="primary" className="px-4">
                          Send Password Reset Email
                        </CButton>
                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
            </CCardGroup>

            <div className='mt-3'>
              <p className="text-body-secondary text-center">Developed & Designed By Digital Websynation LLP</p>
            </div>

          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login
