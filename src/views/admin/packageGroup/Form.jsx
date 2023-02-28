import React from "react"
import { PackageGroup } from "src/_services";
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
  CCardFooter,
  CSwitch
} from '@coreui/react'
import { Loading } from 'src/_components'
import {PackageGroupSelect} from './PackageGroupSelect'
import SimpleReactValidator from 'simple-react-validator'
import { store } from 'src/_helpers'
import { submenuActions } from 'src/_actions'
class PackageGroupForm extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {
      Id: props.match.params.id,
      hasForm: false,
      formData: null
    }
    this.handleChangeInputForm = this.handleChangeInputForm.bind(this)
    this.save = this.save.bind(this)
    this.validator = new SimpleReactValidator({ autoForceUpdate: this })
  }
  componentDidMount() {
    this.getData()
    store.dispatch(submenuActions.newmenu([
      {name: 'Quản lý nhóm gói', path: '/admin/PackageGroup', exact: true},
      {name: this.isNew() ? 'Thêm mới nhóm gói dịch vụ' : 'Chi tiết nhóm gói dịch vụ', path: '/admin/PackageGroup/:id'}
    ]))
  }

  save() {
    if (!this.validator.allValid()) {
      this.validator.showMessages()
      return
    }
    let { formData } = this.state
    new PackageGroup().createOrUpdate(formData)
      .then(() => {
        this.alertSuccess()
        this.props.history.push(`/admin/PackageGroup`)
      }).catch(e => {
      })
  }
  isNew () {
    return this.props.match.params.id === 'new'
  }
  getData() {
    if (this.isNew()) {
      this.setState({
        formData: {
          Code: '',
          Name: '',
          IsActived: true
        }
      })
    } else {
      new PackageGroup().find(this.props.match.params.id)
        .then(response => {
          this.setState({
            formData: response
          })
        }).catch(e => {
        })
    }
  }
  render() {
    const { formData } = this.state
    if (!formData) return (<Loading />)
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
                  Thêm mới nhóm gói dịch vụ
                </CCardHeader>
                <CCardBody>
                  <CFormGroup>
                    <CLabel>Tên <span className="required-text">*</span></CLabel>
                    <div className="controls">
                      <CInput autoComplete="off" name="Name" value={formData.Name} placeholder="Tên" type="text" onChange={this.handleChangeInputForm} />
                      {this.validator.message('Name', formData.Name, 'required', { messages: { required: 'Tên bắt buộc' } })}
                    </div>
                  </CFormGroup>
                  <CFormGroup>
                    <CLabel>Mã <span className="required-text">*</span></CLabel>
                    <div className="controls">
                      <CInput autoComplete="off" name="Code" value={formData.Code} placeholder="Mã" type="text" onChange={this.handleChangeInputForm} />
                      {this.validator.message('Code', formData.Code, 'required', { messages: { required: 'Mã bắt buộc' } })}
                    </div>
                  </CFormGroup>
                  <CFormGroup>
                    <CLabel>Nhóm cha</CLabel>
                    <div className="controls">
                      <PackageGroupSelect
                        name="ParentId"
                        defaultValue={formData.ParentId}
                        onChange={this.handleChangeInputForm}
                        currentNodeId={formData.Id}
                      />
                    </div>
                  </CFormGroup>
                  <CFormGroup row>
                      <CCol tag="label" md="9" className="col-form-label">
                        Trạng thái (đang sử dụng)
                      </CCol>
                      <CCol md="3">
                        <div className="col-form-label text-right">
                          <CSwitch
                            name="IsActived"
                            checked={formData.IsActived}
                            className="mr-1"
                            color="primary"
                            onChange={this.handleChangeInputForm}
                          />
                        </div>
                      </CCol>
                    </CFormGroup>
                </CCardBody>
                <CCardFooter>
                  <CButton type="button" color="primary" onClick={() => this.save()}>
                    Lưu
                  </CButton>
                </CCardFooter>
              </CCard>
            </CCol>
          </CRow>
        </Hotkeys>
      </>
    )
  }
}
export default PackageGroupForm
