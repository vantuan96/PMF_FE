import {
  // CButton,
  CCol,
  CRow
} from '@coreui/react'
// import { history } from '../_helpers';
export const BlockBtnForm = ({children, hasBack}) => {
  return (
    <div className="float-block-bottom">
      <div className="c-body">
        <div className="container-fluid">
          <CRow>
            <CCol md="12" className="right">
            {children}
            </CCol>
          </CRow>
        </div>
      </div>
    </div>
  )
}