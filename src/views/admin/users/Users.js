import React, { useState, useEffect } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import {
  CBadge,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CDataTable,
  CRow,
  CPagination,
  CInput,
  CFormGroup,
  CLabel,
  CButton,
  CInputGroup,
  CInputGroupAppend
} from '@coreui/react'
// import CIcon from '@coreui/icons-react'
import usersData from './UsersData'

const getBadge = status => {
  switch (status) {
    case 'Active': return 'success'
    case 'Inactive': return 'secondary'
    case 'Pending': return 'warning'
    case 'Banned': return 'danger'
    default: return 'primary'
  }
}

const Users = () => {
  const history = useHistory()
  const queryPage = useLocation().search.match(/page=([0-9]+)/, '')
  const currentPage = Number(queryPage && queryPage[1] ? queryPage[1] : 1)
  const [page, setPage] = useState(currentPage)

  const pageChange = (newPage) => {
    console.log(newPage)
    setTimeout(() => {
      currentPage !== newPage && history.push(`/users?page=${newPage}`)
    }, 2000)
  }

  useEffect(() => {
    currentPage !== page && setPage(currentPage)
  }, [currentPage, page])

  return (
    <CRow>
      <CCol xl={12}>
        <CCard>
          <CCardHeader>
            <CRow>
              <CCol xs="3">
                <CFormGroup>
                  <CLabel htmlFor="appendedInputButton"></CLabel>
                  <div className="controls">
                    <CInputGroup>
                      <CInput id="appendedInputButton" placeholder="Enter username" size="16" type="text" />
                      <CInputGroupAppend>
                        <CButton color="secondary">Search</CButton>
                      </CInputGroupAppend>
                    </CInputGroup>
                  </div>
                </CFormGroup>
              </CCol>
              <CCol xs="9">
                {/* <CFormGroup>
                  <CLabel htmlFor="name">Keyword</CLabel>
                  <CInput id="name" placeholder="Enter your name" required />
                </CFormGroup> */}
              </CCol>
            </CRow>
          </CCardHeader>
          <CCardBody>
            <CDataTable
              items={usersData}
              fields={[
                { key: 'id', _classes: 'font-weight-bold' },
                'name', 'registered', 'role', 'status'
              ]}
              hover
              // size="sm"
              striped
              itemsPerPage={25}
              activePage={page}
              clickableRows
              // itemsPerPageSelect
              // onPaginationChange={pageChange}
              // sorter
              bordered
              onRowClick={(item) => history.push(`/users/${item.id}`)}
              scopedSlots = {{
                'status':
                  (item)=>(
                    <td>
                      <CBadge color={getBadge(item.status)}>
                        {item.status}
                      </CBadge>
                    </td>
                  )
              }}
            />
            <CPagination
              activePage={page}
              onActivePageChange={pageChange}
              pages={5}
              doubleArrows={false} 
              align="start"
            />
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Users
