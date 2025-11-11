import React from 'react'

// Pages
const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const Login = React.lazy(() => import('./views/pages/login/Login'))
const Forgotpassword = React.lazy(() => import('./views/pages/forgotpassword/Forgotpassword'))
const Resetpassword = React.lazy(() => import('./views/pages/resetpassword/Resetpassword'))

const Profile = React.lazy(() => import('./views/profile/Profile'))
const Setting = React.lazy(() => import('./views/setting/Setting'))

const Customer = React.lazy(() => import('./views/users/Customer'))
const Category = React.lazy(() => import('./views/product/Category'))
const Brand = React.lazy(() => import('./views/product/Brand'))
const Tags = React.lazy(() => import('./views/product/Tags'))
const Attributes = React.lazy(() => import('./views/product/Attributes'))
const Reviews = React.lazy(() => import('./views/product/Reviews'))
const AllProducts = React.lazy(() => import('./views/product/Allproducts'))
const Orders = React.lazy(() => import('./views/orders/Orders'))
const Redundpolicy = React.lazy(() => import('./views/Refund/Redundpolicy'))
const Allblogs = React.lazy(() => import('./views/blogs/Allblogs'))
const Categoryblog = React.lazy(() => import('./views/blogs/Categoryblog'))
const Tagsblog = React.lazy(() => import('./views/blogs/Tags'))
const Dewalthistory = React.lazy(() => import('./views/youtube/Dewalthistory'))
const Safetywelding = React.lazy(() => import('./views/youtube/Safetywelding'))
const Weldingtechnique = React.lazy(() => import('./views/youtube/Weldingtechnique'))
const Annularcutter = React.lazy(() => import('./views/youtube/Annularcutter'))

// Public routes (standalone, no layout)
export const publicRoutes = [
  { path: '/', element: Login },
  { path: '/forgot-password', element: Forgotpassword },
  { path: '/reset-password', element: Resetpassword },
]

// Private routes (wrapped in DefaultLayout)
export const privateRoutes = [
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/profile', name: 'Profile', element: Profile },
  { path: '/setting', name: 'Settings', element: Setting },
  { path: '/users/customers', name: 'Customers', element: Customer },
  { path: '/product/category', name: 'Categories', element: Category },
  { path: '/product/brand', name: 'Brands', element: Brand },
  { path: '/product/tags', name: 'Tags', element: Tags },
  { path: '/product/attributes', name: 'Attributes', element: Attributes },
  { path: '/product/reviews', name: 'Reviews', element: Reviews },
  { path: '/product/allproducts', name: 'All Products', element: AllProducts },
  { path: '/orders', name: 'Orders', element: Orders },
  { path: '/refund-policy', name: 'Refund List', element: Redundpolicy },
  { path: '/blog/allblogs', name: 'All Blogs', element: Allblogs },
  { path: '/blog/category', name: 'Blog Categories', element: Categoryblog },
  { path: '/blog/tags', name: 'Blog Tags', element: Tagsblog },
  { path: '/youtube/dewalthistory', name: 'Dewalt history', element: Dewalthistory },
  { path: '/youtube/safetywelding', name: 'Safety welding', element: Safetywelding },
  { path: '/youtube/weldingtechnique', name: 'welding Technique', element: Weldingtechnique },
  { path: '/youtube/annularcutter', name: 'Annular Cutter', element: Annularcutter },
]

// Legacy default export for breadcrumbs or other legacy components
const routes = [...publicRoutes, ...privateRoutes]
export default routes
