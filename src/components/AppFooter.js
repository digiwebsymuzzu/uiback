import React from 'react'
import { CFooter } from '@coreui/react'

const AppFooter = () => {
  return (
    <CFooter className="px-4">
      <div>
        <a href="/" target="_blank" rel="noopener noreferrer">
          UdemandMe
        </a>
        <span className="ms-1">&copy; 2025 UdemandMe.</span>
      </div>
      <div className="ms-auto">
        <span className="me-1">Powered by</span>
        <a href="https://digitalwebsynation.com/" target="_blank" rel="noopener noreferrer">
          Digital Websynation LLP
        </a>
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)
