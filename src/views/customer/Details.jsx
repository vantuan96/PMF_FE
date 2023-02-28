import React from 'react';
import BaseComponent from 'src/_components/BaseComponent'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CButtonGroup,
  CLabel,
  CForm,
  CButton
} from '@coreui/react'
import {
  SiteSelect,
  InputSelect,
  Loading,
  InputText,
  VIcon,
  DataTable
} from 'src/_components'
import { Gender } from 'src/_constants'
import { dateToString } from 'src/_helpers'

import {PackageStatus} from 'src/_constants'
import { PatientService } from 'src/_services'
class CustomerDetail extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false
    };
  }
}
export default CustomerDetail