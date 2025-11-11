import React from 'react'

import {
  CCard,
  CCardBody,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'

import WidgetsDropdown from '../widgets/WidgetsDropdown'

const Dashboard = () => {
  const tableExample = [
    {
      id: 1,
      name: 'Order 1',
      Date: '12/8/2025',
      Status: 'Payment Pending',
      Price: '300',
      status: 'Active',
    },
    {
      id: 2,
      name: 'Order 2',
      Date: '12/8/2025',
      Status: 'Processing',
      Price: '500',
      status: 'Inactive',
    },
    {
      id: 3,
      name: 'Order 3',
      Date: '12/8/2025',
      Status: 'On Hold',
      Price: '500',
      status: 'Inactive',
    },
    {
      id: 4,
      name: 'Order 4',
      Date: '12/8/2025',
      Status: 'Completed',
      Price: '500',
      status: 'Inactive',
    },
    {
      id: 5,
      name: 'Order 5',
      Date: '12/8/2025',
      Status: 'Cancelled',
      Price: '500',
      status: 'Inactive',
    },
    {
      id: 6,
      name: 'Order 6',
      Date: '12/8/2025',
      Status: 'Refund',
      Price: '500',
      status: 'Inactive',
    },
  ]

  return (
    <>
      <WidgetsDropdown className="mb-4" />

      <CRow>
        <CCol xs>
          <CCard className="mb-4">
            <CCardBody>
              <CTable align="middle" className="mb-0 border" hover responsive>
                <CTableHead className="text-nowrap">
                  <CTableRow>
                    <CTableHeaderCell className="bg-body-tertiary text-center">Id</CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary">Order Name</CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary text-center">
                      Order Date
                    </CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary">Status</CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary text-center">
                      Price
                    </CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {tableExample.map((item, index) => (
                    <CTableRow key={index}>
                      <CTableDataCell className="text-center">{item.id}</CTableDataCell>
                      <CTableDataCell>{item.name}</CTableDataCell>
                      <CTableDataCell className="text-center">{item.Date}</CTableDataCell>
                      <CTableDataCell>
                        <span
                          className="text-white px-2 py-1 rounded fw-semibold"
                          style={{
                            backgroundColor:
                              item.Status === 'Payment Pending'
                                ? '#FFA500'
                                : item.Status === 'Processing'
                                  ? '#007BFF'
                                  : item.Status === 'On Hold'
                                    ? '#ffbc00'
                                    : item.Status === 'Completed'
                                      ? 'green'
                                      : item.Status === 'Cancelled'
                                        ? 'red'
                                        : item.Status === 'Refund'
                                          ? 'gray'
                                          : '#6c757d',
                          }}
                        >
                          {item.Status}
                        </span>
                      </CTableDataCell>
                      <CTableDataCell className="text-center">${item.Price}</CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default Dashboard
