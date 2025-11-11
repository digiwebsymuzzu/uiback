import React, { Suspense, useEffect } from 'react'
import { HashRouter, Route, Routes, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { CSpinner, useColorModes } from '@coreui/react'
import './scss/style.scss'
import 'react-toastify/dist/ReactToastify.css'
import 'react-quill/dist/quill.snow.css'

// Routes
import { publicRoutes, privateRoutes } from './routes'

// Layout
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/" />
}

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token')
  return token ? <Navigate to="/dashboard" /> : children
}

const App = () => {
  const { isColorModeSet, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')
  const storedTheme = useSelector((state) => state.theme)

  useEffect(() => {
    if (!isColorModeSet()) setColorMode(storedTheme)
  }, [])

  return (
    <HashRouter>
      <Suspense
        fallback={
          <div className="pt-3 text-center">
            <CSpinner color="primary" variant="grow" />
          </div>
        }
      >
        <Routes>
          {/* Public routes */}
          {publicRoutes.map((route, idx) => (
  <Route
    key={idx}
    path={route.path}
    element={<PublicRoute><route.element /></PublicRoute>}
  />
))}


          {/* Private routes wrapped in DefaultLayout */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <DefaultLayout />
              </PrivateRoute>
            }
          >
            {privateRoutes.map((route, idx) => (
              <Route key={idx} path={route.path.replace('/', '')} element={<route.element />} />
            ))}
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
    </HashRouter>
  )
}

export default App