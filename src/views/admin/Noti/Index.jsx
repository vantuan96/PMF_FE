import React from "react"
import { BlockBtnForm } from "src/_components"
import { NotiService } from 'src/_services'
import Hotkeys from 'react-hot-keys'
import BaseComponent from 'src/_components/BaseComponent'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CFormGroup,
  CLabel,
  CRow,
  CInput,
  CTextarea
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { Loading } from 'src/_components'
import SimpleReactValidator from 'simple-react-validator'

class Form extends BaseComponent {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this)
    this.state = {
      Id: props.match.params.id,
      Noti: {
        Subject: '',
        Service: 'APP'
      }
    }
    this.validator = new SimpleReactValidator({ autoForceUpdate: this })
  }
  componentDidMount() {
    this.init()
  }
  async init() {
    this.getData()
  }
  save(keyName, e, handle) {
    console.log(keyName, handle)
    e && e.preventDefault()
    this.submit()
  }
  submit() {
    if (!this.validator.allValid()) {
      this.validator.showMessages()
      return
    }
    new NotiService().create(this.state.Noti)
      .then((Noti) => {
        this.alertSuccess()
      })
  }
  getData() {
  }
  handleChange(event) {
    this.validator.showMessages()
    const { name, value, type, checked } = event.target;
    this.updateStateQuery(name, type === 'checkbox' ? checked : value)
  }
  updateStateQuery(name, value) {
    var Noti = { ...this.state.Noti }
    Noti[name] = value
    this.setState({ Noti })
  }
  render() {
    const { Noti } = this.state;
    if (!Noti) return <Loading/>
    return (
      <>
        <Hotkeys
          allowRepeat="true"
          keyName="ctrl+s"
          onKeyDown={this.save.bind(this)}
          filter={() => {
            return true
          }}
        >
          <CRow className="justify-content-center">
            <CCol lg={5}>
              <CCard>
                <CCardHeader>
                  Thông báo
                </CCardHeader>
                <CCardBody>
                  <CFormGroup row>
                    <CCol md="3">
                      <CLabel>Tiêu đề</CLabel>
                    </CCol>
                    <CCol xs="12" md="12">
                      <CInput type="text" autoComplete="off" name="Subject" value={Noti.Subject} onChange={this.handleChange} placeholder="Tiêu đề" />
                      {/**********   This is where the magic happens     ***********/}
                      {this.validator.message('NotiSubject', this.state.Noti.Subject, 'required')}
                    </CCol>
                  </CFormGroup>
                  <CFormGroup row>
                    <CCol md="3">
                      <CLabel>Nội dung</CLabel>
                    </CCol>
                    <CCol xs="12" md="12">
                      <CTextarea 
                        id="textarea-input" 
                        rows="9"
                        placeholder="Nội dung..."
                        name="Content"
                        onChange={this.handleChange} 
                      />
                      {/**********   This is where the magic happens     ***********/}
                      {this.validator.message('NotiContent', this.state.Noti.Content, 'required')}
                    </CCol>
                  </CFormGroup>
                  
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
          <BlockBtnForm>
            <CRow>
              <CCol md="2">
              </CCol>
              <CCol md="7" className="right">
              </CCol>
              <CCol md="3" className="right">
                <CButton onClick={this.save.bind(this)} className="float-right btn-block" type="submit" color="warning"><CIcon name="cil-scrubber" /> Lưu</CButton>
              </CCol>
            </CRow>
          </BlockBtnForm>
        </Hotkeys>
      </>
    );
  }
}
export default Form
