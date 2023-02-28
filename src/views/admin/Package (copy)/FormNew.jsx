import React from "react"
import { Package } from "src/_services";
import Hotkeys from 'react-hot-keys'
import BaseComponent from 'src/_components/BaseComponent'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CFormGroup,
  CRow,
  CInput,
  CCardFooter,
  CSwitch,
  CTabs
} from '@coreui/react'
import { Loading, InputSelect } from 'src/_components'
import { PackageGroupSelect } from '../packageGroup/PackageGroupSelect'
import SimpleReactValidator from 'simple-react-validator'
import ServiceList from './ServiceListNew'
import { confirmAlert } from 'react-confirm-alert'

class PackageForm extends BaseComponent {
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
  }
  componentDidUpdate(prevProps) {
    if (this.props.match.params.id !== prevProps.match.params.id) {
      this.getData()
    }
  }
  save() {
    if (!this.validator.allValid()) {
      this.validator.showMessages()
      return
    }
    let { formData } = this.state
    var submitData = {...formData}
    submitData.IsLimitedDrugConsum = submitData.IsLimitedDrugConsum === '1'
    new Package().createOrUpdate(submitData)
      .then(({ Id }) => {
        this.alertSuccess()
        if (!formData.Id) {
          this.props.history.push(`/admin/Package/${Id}`)
        }
      }).catch(e => {
        console.log(e)
      })
  }
  confirmDone(Id) {
    confirmAlert({
      title: 'Bạn có muốn thiết lập giá luôn không?',
      buttons: [
        {
          label: 'Hủy',
          onClick: () => this.props.history.push(`/admin/Package/${Id}`)
        },
        {
          label: 'Đồng ý',
          onClick: () => this.props.history.push(`/admin/price-policy/${Id}/form/new`)
        },
      ]
    })
  }
  isNew() {
    return this.props.match.params.id === 'new'
  }
  getData() {
    this.loading(true)
    if (this.isNew()) {
      this.setState({
        formData: {
          Code: '',
          Name: '',
          IsActived: true,
          IsLimitedDrugConsum: '1'
        }
      })
      this.loading(false)
    } else {
      new Package().find(this.props.match.params.id)
        .then(response => {
          response.IsLimitedDrugConsum = response.IsLimitedDrugConsum ? '1' : 0
          this.setState({
            formData: response
          })
          this.loading(false)
        }).catch(e => {
          this.loading(false)
        })
    }
  }
  render() {
    const { formData, isloading } = this.state
    if (isloading || !formData) return (<Loading />)
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

          <CCard>
            <CCardHeader>
              Thông tin gói
                </CCardHeader>
            <CCardBody>
              <CRow className="justify-content-center">
                <CCol>
                  <CFormGroup row>
                    <CCol tag="label" md="3" className="col-form-label">
                      Mã <span className="required-text">*</span>
                      </CCol>
                    <CCol md="9">
                      <CInput autoComplete="off" name="Code" value={formData.Code} placeholder="Mã" maxLength="250" type="text" onChange={this.handleChangeInputForm} />
                      {this.validator.message('Code', formData.Code, 'required', { messages: { required: 'Mã gói bắt buộc' } })}
                    </CCol>
                  </CFormGroup>
                </CCol>
                <CCol>
                  <CFormGroup row>
                    <CCol tag="label" md="3" className="col-form-label">
                      Tên <span className="required-text">*</span>
                      </CCol>
                    <CCol md="9">
                      <CInput autoComplete="off" name="Name" value={formData.Name} placeholder="Tên" maxLength="250" type="text" onChange={this.handleChangeInputForm} />
                      {this.validator.message('Name', formData.Name, 'required', { messages: { required: 'Tên gói bắt buộc' } })}
                    </CCol>
                  </CFormGroup>
                </CCol>
              </CRow>
              <CRow className="justify-content-center">
                <CCol>
                  <CFormGroup row>
                    <CCol tag="label" md="3" className="col-form-label">
                      Nhóm gói <span className="required-text">*</span>
                      </CCol>
                    <CCol md="9">
                      <PackageGroupSelect
                        name="PackageGroupId"
                        defaultValue={formData.PackageGroupId}
                        onChange={this.handleChangeInputForm}
                        currentNodeId={formData.Id}
                        allowSelectChil={true}
                      />
                      {this.validator.message('PackageGroup', formData.PackageGroupId, 'required', { messages: { required: 'Danh mục nhóm gói bắt buộc' } })}
                    </CCol>
                  </CFormGroup>
                </CCol>
                <CCol>
                  <CFormGroup row>
                    <CCol tag="label" md="3" className="col-form-label">
                      Thuốc và VTTH
                      </CCol>
                    <CCol md="9">
                      <InputSelect name="IsLimitedDrugConsum" options={[{ value: '0', label: 'Không theo định mức' }, { value: '1', label: 'Theo định mức' }]} defaultValue={formData.IsLimitedDrugConsum} applyCallback={this.handleChangeInputForm} />
                    </CCol>
                  </CFormGroup>
                </CCol>
              </CRow>
              <CRow>
                <CCol md="6">
                  <CFormGroup row>
                    <CCol tag="label" md="3" className="col-form-label">
                      Trạng thái (đang sử dụng)
                      </CCol>
                    <CCol md="9" className="text-right">
                      <CSwitch
                        name="IsActived"
                        checked={formData.IsActived}
                        className="mr-1"
                        color="primary"
                        onChange={this.handleChangeInputForm}
                      />
                    </CCol>
                  </CFormGroup>
                </CCol>
              </CRow>
            </CCardBody>
            <CCardFooter>
              <CButton type="button" color="primary" onClick={() => this.save()}>
                Lưu
                  </CButton>
            </CCardFooter>
          </CCard>
          <>
          <CCard>
            <CTabs>
              <CCardHeader>
              Danh sách dịch vụ
              </CCardHeader>
              <CCardBody>
              <ServiceList name="Services" PackageId={formData.Id} ServiceType={1} onChange={this.handleChangeInputForm} title={"Danh sách dịch vụ"} />
              </CCardBody>
            </CTabs>
          </CCard>
          <CCard>
            <CTabs>
              <CCardHeader>
              Danh sách thuốc và VTTH
              </CCardHeader>
              <CCardBody>
              <ServiceList name="Services" PackageId={formData.Id} ServiceType={2} onChange={this.handleChangeInputForm} title={"Danh sách thuốc và VTTH"} />
              </CCardBody>
            </CTabs>
          </CCard>
          </>
        </Hotkeys>
      </>
    )
  }
}
export default PackageForm
