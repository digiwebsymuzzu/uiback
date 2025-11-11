import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { CBreadcrumb, CBreadcrumbItem } from '@coreui/react'
import routes from '../routes'
import { FaRegClock } from 'react-icons/fa'

const AppBreadcrumb = () => {
  const currentLocation = useLocation().pathname
  const [currentDateTime, setCurrentDateTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const getRouteName = (pathname, routes) => {
    const currentRoute = routes.find((route) => route.path === pathname)
    return currentRoute ? currentRoute.name : false
  }

  const getBreadcrumbs = (location) => {
    const breadcrumbs = []
    location.split('/').reduce((prev, curr, index, array) => {
      const currentPathname = `${prev}/${curr}`
      const routeName = getRouteName(currentPathname, routes)
      if (routeName) {
        breadcrumbs.push({
          pathname: currentPathname,
          name: routeName,
          active: index + 1 === array.length,
        })
      }
      return currentPathname
    })
    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs(currentLocation)

  return (
    <div
      className="d-flex justify-content-between align-items-center mb-3"
      style={{ width: '100%' }}
    >
      {/* Left: Date/Time */}

      {/* Right: Breadcrumb */}
      <div>
        <CBreadcrumb className="mb-0">
          <CBreadcrumbItem href="/">Home</CBreadcrumbItem>
          {breadcrumbs.map((breadcrumb, index) => (
            <CBreadcrumbItem
              key={index}
              {...(breadcrumb.active ? { active: true } : { href: breadcrumb.pathname })}
            >
              {breadcrumb.name}
            </CBreadcrumbItem>
          ))}
        </CBreadcrumb>
      </div>
      <div
        className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded shadow-sm bg-white border mt-2"
        style={{
          fontSize: '14px',
          color: '#495057',
          fontWeight: 500,
          borderColor: '#dee2e6',
        }}
      >
        <FaRegClock style={{ color: '#0d6efd' }} />
        {currentDateTime.toLocaleDateString('en-GB')} |{' '}
        {currentDateTime.toLocaleTimeString('en-GB')}
      </div>
    </div>
  )
}

export default React.memo(AppBreadcrumb)
