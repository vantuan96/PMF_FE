import React from "react"
import { Package, PackageService } from "src/_services";
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
  CSwitch,
  CTabs
} from '@coreui/react'
import { Loading, InputSelect, BlockBtnForm } from 'src/_components'
import { PackageGroupSelect } from '../packageGroup/PackageGroupSelect'
import SimpleReactValidator from 'simple-react-validator'
import ServiceList from './ServiceList'
import { confirmAlert } from 'react-confirm-alert'
import { store } from 'src/_helpers'
import { submenuActions } from 'src/_actions'
import RouteLeavingGuard from "src/_components/RouteLeavingGuard";

class PackageForm extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {
      Id: props.match.params.id,
      hasForm: false,
      formData: null,
      ServiceListType1: [],
      ServiceListType2: []
    }
    this.handleChangeInputForm = this.handleChangeInputForm.bind(this)
    this.serviceListChange = this.serviceListChange.bind(this)
    this.save = this.save.bind(this)
    this.validator = new SimpleReactValidator({ autoForceUpdate: this })
  }
  componentDidMount() {
    this.getData()
    store.dispatch(submenuActions.newmenu([
      {name: 'Quản lý danh mục gói', path: '/admin/Package', exact: true},
      {name: this.isNew() ? 'Thêm mới danh mục gói' : 'Chi tiết danh mục gói', path: '/admin/Package/:id'}
    ]))
  }
  componentDidUpdate(prevProps) {
    if (this.props.match.params.id !== prevProps.match.params.id) {
      this.getData()
    }
  }
  serviceListChange (values, type) {
    if (type === 1) {
      this.setState({ServiceListType1: values})
    }
    if (type === 2) {
      this.setState({ServiceListType2: values})
    }
  }
  sendData(Services, packageId) {
    new PackageService().create({ Services, PackageId: packageId }).then(() => {
      this.alertSuccess()
      if (this.isNew()) {
        this.confirmDone(packageId)
      } else {
        this.confirmDoneOnUpdate(packageId, Services)
      }
      this.resetWithloading()
    })
  }
  confirmDoneOnUpdate (packageId, services) {
    var isChanged = services.find(e => e.edited)
    if (isChanged) {
      confirmAlert({
        closeOnEscape: true,
        closeOnClickOutside: true,
        message: 'Danh sách dịch vụ, Thuốc, VTTT đã bị thay đổi, bạn cần thiết lập giá gói?',
        buttons: [
          {
            label: 'Để sau',
            onClick: () => this.reload()
          },
          {
            label: 'Đồng ý',
            onClick: () => this.props.history.push(`/admin/Package/${packageId}/price-policy`)
          },
        ]
      })
      return
    }
    this.reload()
  }
  removeItems (Ids) {
    return new PackageService().update('/Delete/', { Ids })
    .then(() => {
    }).catch(e => {
    })
  }
  reset () {
  }
  async save() {
    if (!this.validator.allValid()) {
      this.validator.showMessages()
      return
    }
    let { formData, ServiceListType2, ServiceListType1 } = this.state
    var services = ServiceListType2.concat(ServiceListType1)
    if (this.isNew() && services.length === 0) {
      this.alert('', 'Vui lòng chọn ít nhất dịch vụ trong gói')
      return
    }
    
    var submitData = {...formData}
    // if (submitData.IsLimitedDrugConsum && ServiceListType1.length === 0) {
    //   this.alert('', 'Vui lòng chọn ít nhất dịch vụ trong gói.')
    //   return
    // }
    submitData.IsLimitedDrugConsum = submitData.IsLimitedDrugConsum === '1'
    await this.validateData(services)
    new Package().createOrUpdate(submitData)
      .then(({ Id }) => {
        this.setState({isSubmited: true})
        this.sendData(services, Id || formData.Id)
      }).catch(e => {
        console.log(e)
      })
  }
  async validateData (Services) {
    await new Package().update('/ValidSetupService', { Services }).then(() => {
    }).catch(e => {
      throw e
    })
  }
  confirmDone(Id) {
    confirmAlert({
      closeOnEscape: true,
      closeOnClickOutside: true,
      message: 'Bạn có muốn thiết lập giá luôn không?',
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
  async getData() {
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
      this.setState({
        rawData: {
          Code: '',
          Name: '',
          IsActived: true,
          IsLimitedDrugConsum: '1'
        }
      })
      this.loading(false)
    } else {
      await this.checkExistPatientReg(this.props.match.params.id)
      new Package().find(this.props.match.params.id)
        .then(response => {
          response.IsLimitedDrugConsum = response.IsLimitedDrugConsum ? '1' : '0'
          this.setState({
            formData: response
          })
          this.setState({rawData: response})
          this.loading(false)
        }).catch(e => {
          this.loading(false)
        })
    }
  }
  changedData () {
    const { formData, rawData, ServiceListType2, ServiceListType1, isSubmited } = this.state
    var services = ServiceListType2.concat(ServiceListType1)
    var isChanged = services.find(e => e.edited) 
    return (formData.Code !== rawData.Code ||
        formData.IsActived !== rawData.IsActived ||
        formData.IsLimitedDrugConsum !== rawData.IsLimitedDrugConsum ||
        formData.Name !== rawData.Name || (isChanged !== null && isChanged !== undefined)) && !isSubmited
  }
  render() {
    const { formData, isloading, existPatientReg, ServiceListType1, ServiceListType2 } = this.state
    var allData = [].concat(ServiceListType1).concat(ServiceListType2)
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
          <RouteLeavingGuard
            when={this.changedData()}
            navigate={path => {
              this.props.history.push(path);
            }}
            shouldBlockNavigation={location => {
              return true;
            }}
            yes="Yes"
            no="No"
            content="Bạn chưa lưu dữ liệu, bạn có chắc chắn muốn hủy không?"
          />
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
                      {this.isNew() ? <>
                        <CInput autoComplete="off" name="Code" value={formData.Code} placeholder="Mã" maxLength="250" type="text" onChange={this.handleChangeInputForm} />
                        {this.validator.message('Code', formData.Code, 'required', { messages: { required: 'Mã gói bắt buộc' } })}
                      </> : <>
                        <label className="col-form-label pl-0">{formData.Code}</label>
                      </>}
                      
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
              <CRow className="justifyx-content-center">
                <CCol md="6">
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
                {/* <CCol>
                  <CFormGroup row>
                    <CCol tag="label" md="3" className="col-form-label">
                      Thuốc và VTTH <span className="required-text">*</span>
                      </CCol>
                    <CCol md="9">
                    { existPatientReg ? 
                      <p className="fake-input readonly">{formData.IsLimitedDrugConsum === '0' ? 'Không theo định mức' : 'Theo định mức' }</p>
                      :
                      <InputSelect name="IsLimitedDrugConsum" options={[{ value: '0', label: 'Không theo định mức' }, { value: '1', label: 'Theo định mức' }]} defaultValue={formData.IsLimitedDrugConsum} applyCallback={this.handleChangeInputForm} />
                    }
                    </CCol>
                  </CFormGroup>
                </CCol> */}
                {!this.isNew() &&
                  <CCol md="6">
                    <CFormGroup row>
                      <CCol tag="label" md="3" className="col-form-label">
                        Trạng thái (đang sử dụng)
                        </CCol>
                      <CCol md="9" className="text-right col-form-label">
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
                }
              </CRow>
              {/* {!this.isNew() &&
              <CRow>
                <CCol md="6">
                  <CFormGroup row>
                    <CCol tag="label" md="3" className="col-form-label">
                      Trạng thái (đang sử dụng)
                      </CCol>
                    <CCol md="9" className="text-right col-form-label">
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
              } */}
            </CCardBody>
          </CCard>
          <>
          <CCard>
            <CTabs>
              <CCardHeader>
              Danh sách dịch vụ
              </CCardHeader>
              <CCardBody>
              <ServiceList existPatientReg={existPatientReg} allData={allData} name="ServiceListType1" PackageId={formData.Id} ServiceType={1} onServiceListChange={this.serviceListChange} title={"Danh sách dịch vụ"} />
              </CCardBody>
            </CTabs>
          </CCard>
          <CCard>
            <CTabs>
              <CCardHeader>
              Danh sách thuốc và VTTH
              </CCardHeader>
              <CCardBody>
              <ServiceList existPatientReg={existPatientReg} allData={allData} name="ServiceListType2" PackageId={formData.Id} ServiceType={2} onServiceListChange={this.serviceListChange} title={"Danh sách thuốc và VTTH"} />
              </CCardBody>
            </CTabs>
          </CCard>
          <br/><br/><br/><br/>
            <BlockBtnForm>
              <CRow>
                <CCol md="5">
                </CCol>
                <CCol md="7" className="text-right">
                  <CButton type="button" color="secondary" onClick={() => this.goBack()}>
                    Hủy
                  </CButton>
                  {" "}
                  <CButton type="button" color="warning" onClick={() => this.save()}>
                    Lưu
                  </CButton>
                </CCol>
              </CRow>
            </BlockBtnForm>
          </>
        </Hotkeys>
      </>
    )
  }
}
export default PackageForm
