import React from 'react'
import {
  CCol,
  CContainer,
  CRow,
  CLink
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import i18n from 'src/i18n'
const Page404 = () => {
  return (
    <div className="c-app c-default-layout flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md="6">
            <div className="clearfix">
              <h1 className="float-left display-3 mr-4">404</h1>
              <h4 className="pt-3">Oops! You{'\''}re lost.</h4>
              <p className="text-muted float-left">The page you are looking for was not found.</p>
            </div>
            <div>
              <CLink to="/" className="btn btn-primary"><CIcon name="cil-home" className="mfe-2 "/> {i18n.t('Về trang chủ')}</CLink>
            </div>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Page404
