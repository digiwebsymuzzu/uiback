import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilSpeedometer,
  cilStar,
  cilUser,
  cilTags,
  cilCart,
  cilLoopCircular,
  cilNotes,
  cibYoutube,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    component: CNavGroup,
    name: 'Uers',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Customers',
        to: '/users/customers',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Product',
    icon: <CIcon icon={cilTags} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'All Products',
        to: '/product/allproducts',
      },
      {
        component: CNavItem,
        name: 'Category',
        to: '/product/category',
      },
      {
        component: CNavItem,
        name: 'Brand',
        to: '/product/brand',
      },
      {
        component: CNavItem,
        name: 'Tags',
        to: '/product/tags',
      },
      {
        component: CNavItem,
        name: 'Attributes',
        to: '/product/attributes',
      },
      {
        component: CNavItem,
        name: 'Reviews',
        to: '/product/reviews',
      },
    ],
  },

  {
    component: CNavGroup,
    name: 'Post',
    icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'All Blogs',
        to: '/blog/allblogs',
      },
      {
        component: CNavItem,
        name: 'Category',
        to: '/blog/category',
      },
      {
        component: CNavItem,
        name: 'Tags',
        to: '/blog/tags',
      },
    ],
  },
  {
    component: CNavItem,
    name: 'Orders',
    to: '/orders',
    icon: <CIcon icon={cilCart} customClassName="nav-icon" />,
  },
  {
    component: CNavGroup,
    name: 'Youtube',
    icon: <CIcon icon={cibYoutube} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'DeWalt history',
        to: '/youtube/dewalthistory',
      },
      {
        component: CNavItem,
        name: 'Safety in welding',
        to: '/youtube/safetywelding',
      },
      {
        component: CNavItem,
        name: 'Welding Techniques',
        to: '/youtube/weldingtechnique',
      },
      {
        component: CNavItem,
        name: 'Annular Cutter',
        to: '/youtube/annularcutter',
      },
    ],
  },
]

export default _nav
