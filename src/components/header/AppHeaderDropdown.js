import React from 'react'
import { Link } from 'react-router-dom'
import {
  CAvatar,
  CBadge,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import {
  cilBell,
  cilCommentSquare,
  cilEnvelopeOpen,
  cilLockLocked,
  cilSettings,
  cilUser,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'

import avatar8 from './../../assets/images/avatars/8.jpg'

const AppHeaderDropdown = () => {
  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle placement="bottom-end" className="py-0 pe-0" caret={false}>
        <CAvatar src={avatar8} size="md" />
      </CDropdownToggle>
      <CDropdownMenu className="pt-0" placement="bottom-end">
        <CDropdownHeader className="bg-body-secondary fw-semibold mb-2">Account</CDropdownHeader>
        <Link to="/orders" className="dropdown-item">
          <CIcon icon={cilBell} className="me-2" />
          Orders
        </Link>
        <Link to="/product/reviews" className="dropdown-item">
          <CIcon icon={cilCommentSquare} className="me-2" />
          Reviews
        </Link>
        <CDropdownHeader className="bg-body-secondary fw-semibold my-2">Settings</CDropdownHeader>
        <Link to="/profile" className="dropdown-item">
          <CIcon icon={cilUser} className="me-2" />
          Profile
        </Link>
        <Link to="/setting" className="dropdown-item">
          <CIcon icon={cilSettings} className="me-2" />
          Settings
        </Link>
        <CDropdownDivider />
        <CDropdownItem
          onClick={() => {
            localStorage.removeItem('token')
            window.location.href = '/'
          }}
        >
          <CIcon icon={cilLockLocked} className="me-2" />
          Lock Account
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown
