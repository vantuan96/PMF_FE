import React from "react"
import { PackageService } from "src/_services";
import BaseComponent from 'src/_components/BaseComponent'
import {
  CButton,
  CCol,
  CFormGroup,
  CSwitch, CBadge,
  CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
  CDropdown, CDropdownToggle, CDropdownMenu, CDropdownItem
} from '@coreui/react'
import ReactTooltip from "react-tooltip";
import {
  Loading,
  DataTable,
  ServicesSelect,
  InputSelect,
  NumerInput,
  ServiceInputSelect
} from 'src/_components'
import {
  cloneObj
} from 'src/_helpers'

import SimpleReactValidator from 'simple-react-validator'
import { confirmAlert } from 'react-confirm-alert'
const getBadge = IsDeleted => {
  return IsDeleted ? 'success' : 'danger'
}
const ServiceTypes = ['', 'SRV', 'INV']
class ServiceList extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {
      hasForm: false,
      ReplaceServices: [],
      formData: {
        servicesSelected: [],
        LimitQty: 1,
        IsPackageDrugConsum: false,
        IsActived: true,
        IsCreateForm: true
      },
      oldFormData: {},
      query: {
        pageNumber: 1,
        PageSize: process.env.REACT_APP_PAGE_SIZE
      },
      selected: [],
      allServices: []
    }
    this.handleChangeInputForm = this.handleChangeInputForm.bind(this)
    this.create = this.create.bind(this)
    this.validator = new SimpleReactValidator({ autoForceUpdate: this })
    this.addNewService = this.addNewService.bind(this)
    this.openEditForm = this.openEditForm.bind(this)
    this.confirmRemove = this.confirmRemove.bind(this)
  }
  componentDidMount() {
    this.getData()
    // allData
  }
  componentDidUpdate(prevProps) {
    if (this.props.allData !== prevProps.allData) {
      this.setAllService()
    }
  }
  setAllService () {
    var allServices = [];
    (this.props.allData || []).forEach(e => {
      allServices.push(e.ServiceId)
    })
    this.setState({allServices})
  }
  confirmRemove(item) {
    confirmAlert({
      message: 'Xác nhận xóa dịch vụ này khỏi gói',
      buttons: [
        {
          label: 'Hủy',
        },
        {
          label: 'Đồng ý',
          onClick: () => this.remove(item)
        },
      ]
    })
  }
  pageChange(newPage, oldpage) {
    if (this.state.query.pageNumber !== newPage && !oldpage) {
      this.updateStateQuery('pageNumber', newPage)
      setTimeout(() => {
        this.getData()
      })
    }
  }
  handleChange(e) {
    const { name, value } = e.target;
    this.updateStateQuery(name, value)
  }
  updateStateQuery(name, value) {
    var query = { ...this.state.query }
    query[name] = value
    this.setState({ query })
  }
  validatorData (formData) {
    const { allServices } = this.state
    var arr = (formData.ReplaceService || []).concat(formData.servicesSelected || [])
    // data có data
    if (allServices.find(e => arr.includes(e))) {
      this.alertError('Danh sách dịch vụ trong gói có ít nhất 1 dịch vụ (hoặc dịch vụ thay thế) đang trùng nhau')
      return true
    }
  }
  async create() {
    const { formData, oldFormData, selected, ReplaceServices } = this.state
    var Services = []
    if (this.validatorData(formData)) return false
    if (formData.IsCreateForm) {
      Services = formData.servicesSelected.map(id => {
        return {
          edited: true,
          ServiceId: id,
          Service: selected.find(e => e.Id === id),
          IsActived: formData.IsActived,
          IsPackageDrugConsum: formData.IsPackageDrugConsum,
          LimitQty: formData.LimitQty,
          ServiceType: this.props.ServiceType,
          RootId: null,
          ItemsReplace: (formData.ReplaceService || []).map(rid => {
            return {
              ServiceId: rid,
              IsActived: formData.IsActived,
              IsPackageDrugConsum: formData.IsPackageDrugConsum,
              LimitQty: formData.LimitQty,
              ServiceType: this.props.ServiceType,
              RootId: null,
              IsDeleted: false,
              Service: ((ReplaceServices || []).find(e => e.ServiceId === rid) || {}).Service
            }
          })
        }
      })
    } else {
      var ReplaceService = []
      if (formData.ReplaceService) {
        ReplaceService = formData.ReplaceService.map(id => {
          return {
            ServiceId: id,
            IsActived: formData.IsActived,
            IsPackageDrugConsum: formData.IsPackageDrugConsum,
            LimitQty: formData.LimitQty,
            ServiceType: this.props.ServiceType,
            RootId: formData.Id,
            IsDeleted: false,
            Service: ((ReplaceServices || []).find(e => e.ServiceId === id) || {}).Service
          }
        })
        var currentItem = ReplaceService.map(e => { return e.ServiceId })
        var itemDeleted = (oldFormData.ItemsReplace || []).filter(e => !currentItem.includes(e.ServiceId)).map(e => {
          return {
            IsDeleted: true,
            RootId: formData.Id,
            ServiceId: e.ServiceId,
            Id: e.Id,
            ServiceType: this.props.ServiceType,
            IsActived: formData.IsActived
          }
        })
        ReplaceService = ReplaceService.concat(itemDeleted)
      }
      Services = [{
        ...formData,
        ServiceType: this.props.ServiceType,
        RootId: null,
        edited: true,
        ServiceId: formData.Service.Id,
        ItemsReplace: ReplaceService
      }]
    }
    console.log(Services)
    await this.sendData(Services)
  }
  async sendData(newData) {
    var needResults = cloneObj(this.state.Results || [])
    // update
    needResults = needResults.map(item => {
      var exited = newData.find(e => e.ServiceId === item.ServiceId)
      if (exited) item = {...exited}
      return item
    })
    newData.forEach(item => {
      if (!needResults.find(e => e.ServiceId === item.ServiceId)) needResults.push(item)
    })
    setTimeout(() => {
      this.setState({Results: needResults.map((e, index) => {
        e.STT = index + 1
        return e
      })})
      this.emitValue()
      this.setModal()
    }, 200)
  }
  emitValue () {
    var {Results} = this.state
    if (this.props.onServiceListChange) {
      this.props.onServiceListChange(Results, this.props.ServiceType)
    }
  }
  remove(item) {
    var needResults = this.state.Results.map(e => {
      if (e.ServiceId === item.ServiceId) {
        e.IsDeleted = true
        e.edited = true
      }
      return e
    })
    this.setState({Results: needResults})
    setTimeout(() => {
      this.emitValue()
    }, 200)

    // new PackageService().update('/Delete/', { Ids: [item.Id] })
    //   .then(() => {
    //     this.getData()
    //   }).catch(e => {
    //   })
  }
  resetState() {
    this.setState({
      formData: {
        servicesSelected: [],
        LimitQty: 1,
        IsPackageDrugConsum: false,
        IsActived: true,
        IsCreateForm: true
      }
    })
  }
  addNewService(val) {
    var selected = (val || []).map(e => {
      return {
        Id: e.Id,
        value: e.Id,
        label: e.Code + ' - ' + e.ViName,
        Code: e.Code,
        ViName: e.ViName
      }
    })
    this.handleChangeInputForm({
      target: {
        value: selected.map(e => e.value),
        name: 'servicesSelected'
      }
    })
    this.setState({ selected })
    setTimeout(() => {
      this.setModal(true)
    }, 200)
  }
  isNew () {
    return !this.props.PackageId
  }
  getData() {
    if (!this.props.PackageId) {
      return;
    }
    this.loading(true)
    this.resetState()
    new PackageService({ ...this.state.query, PackageId: this.props.PackageId, status: -1, ServiceType: this.props.ServiceType, IsServiceReplace: 0 }).all()
      .then(response => {
        this.setState({
          Results: response.Results.map((item, index) => {
            item.STT = index + 1
            item._OldItemsReplace = [].concat(item.ItemsReplace)
            item.ServiceId = item.Service.Id
            console.log(item)
            return item
          })
        });
        var bonus = 1
        if ((response.Count % process.env.REACT_APP_PAGE_SIZE) === 0) {
          bonus = 0
        }
        this.setState({ pages: parseInt(response.Count / process.env.REACT_APP_PAGE_SIZE) + bonus });
        this.loading(false)
        this.sendData([])
      })
  }
  handleChangeInputForm(e) {
    const {
      value,
      name,
      type,
      checked,
      _obj
    } = e.target;
    let valueUpdate = {}
    valueUpdate[name] = type === 'checkbox' ? checked : value
    if (name === 'ReplaceService') this.setState({ReplaceServices: _obj.map(e => {
      e.ServiceId = e.Id
      e.Service = Object.assign({}, e)
      return e
    })})
    this.setState(prevState => {
      let formData = Object.assign({}, prevState.formData)
      formData = {
        ...formData,
        ...valueUpdate
      }
      return {
        formData
      }
    })
  }
  inputSelectService () {
    const { selected, formData } = this.state
    if (selected && selected.length === 1) return selected[0].label
    return (
      <>
        <InputSelect
          options={selected}
          isMulti
          placeholder="Chọn"
          name="servicesSelected"
          defaultValue={formData.servicesSelected}
          onChange={this.handleChangeInputForm.bind(this)}
        />
      </>
    )
  }
  formCreate() {
    const { isOpen, selected, formData } = this.state
    const { existPatientReg } = this.props
    var { IsCreateForm } = formData
    var defaultValue = (formData.ItemsReplace || []).filter(e => !e.IsDeleted).map(e => e.ServiceId)
    var fixedValue = []
    if (existPatientReg) {
      fixedValue = (formData._OldItemsReplace || []).map(e => e.ServiceId)
    }
    return (
      <CModal
        show={isOpen}
        onClose={() => this.setModal()}
        size="xl"
        color="primary"
        closeOnBackdrop={false}
      >
        <CModalHeader closeButton>
          <CModalTitle>{IsCreateForm ? (this.props.ServiceType === 2 ? 'Thêm Thuốc và VTTH' : 'Thêm Dịch vụ') : 'Sửa dịch vụ trong gói'}</CModalTitle>
        </CModalHeader>
        <CModalBody className="min-h-x70 auti0">
          {isOpen && <>
            {IsCreateForm ?
              <>{this.inputSelectService()}</>
              :
              <>{formData.Service.Code + ' - ' + formData.Service.ViName}</>
            }
            <hr />
            <CFormGroup row>
              <CCol tag="label" md="3" className="col-form-label">
                Định mức
              </CCol>
              <CCol md="9">
                {existPatientReg ? formData.LimitQty :
                  <NumerInput
                    name="LimitQty"
                    value={formData.LimitQty}
                    onChange={this.handleChangeInputForm}
                    min={1}
                    max={9999}
                  />
                }
              </CCol>
            </CFormGroup>
            {(!IsCreateForm || (selected && selected.length === 1)) &&
              <CFormGroup row>
                <CCol tag="label" md="3" className="col-form-label">
                  Dịch vụ thay thế
                </CCol>
                <CCol md="9">
                  <ServiceInputSelect
                    fixedValue={fixedValue}
                    query={{ ServiceType: ServiceTypes[this.props.ServiceType] }}
                    name="ReplaceService"
                    isMulti={true}
                    defaultValue={defaultValue}
                    onChange={this.handleChangeInputForm}
                  />
                </CCol>
              </CFormGroup>
            }
            {this.props.ServiceType === 1 &&
              <CFormGroup row>
                <CCol md="3" className="d-flex align-items-center justify-content-between">
                  <b>Gói thuốc/ VTTH</b>
                </CCol>
                <CCol md="9" className="d-flex align-items-center justify-content-between">
                  {/*<CFormGroup variant="custom-checkbox" inline>
                    <CInputCheckbox
                      custom
                      id={`IsPackageDrugConsum`}
                      name={`IsPackageDrugConsum`}
                      value='all'
                      checked={formData.IsPackageDrugConsum}
                      onChange={this.handleChangeInputForm}
                    />
                    <CLabel variant="custom-checkbox" htmlFor={`IsPackageDrugConsum`} ></CLabel>
                  </CFormGroup>*/}
                  {existPatientReg ? (formData.IsPackageDrugConsum ? <i className="fa fa-fw fa-check" aria-hidden="true"></i> : '') :
                  <CSwitch
                    name="IsPackageDrugConsum"
                    checked={formData.IsPackageDrugConsum}
                    className="mr-1"
                    color="primary"
                    onChange={this.handleChangeInputForm}
                  />}
                </CCol>
              </CFormGroup>
            }
            {!IsCreateForm &&
              <CFormGroup row>
                <CCol tag="label" md="3" className="col-form-label">
                  Trạng thái
                </CCol>
                <CCol md="9">
                  <div className="col-form-label">
                    {formData.IsActived ? 'Đang sử dụng' : 'Đã khóa'}
                  </div>
                </CCol>
              </CFormGroup>
            }
          </>}
        </CModalBody>
        <CModalFooter>
          <CButton type="button" color="primary" onClick={() => this.create()}>
            Lưu
          </CButton>
        </CModalFooter>
      </CModal>
    )
  }
  setModal(isOpen) {
    this.setState({ isOpen })
    if (!isOpen) this.resetState()
  }
  openEditForm(formData) {
    formData.ReplaceService = formData.ItemsReplace.map(e => e.ServiceId)
    console.log(formData)
    this.setState({ formData })
    this.setState({ ReplaceServices: (formData.ItemsReplace || [])})
    this.setState({ oldFormData: { ...formData } })
    setTimeout(() => {
      this.setModal(true)
    }, 200)
  }
  btnEdit(item) {
    if (this.props.readOnly) return ''
    return (
      <CDropdown className="dropdown-sm">
        <CDropdownToggle color="info" size="sm">
          <i className="fa fa-fw fa-bars" aria-hidden="true"></i>
        </CDropdownToggle>
        <CDropdownMenu>
          <CDropdownItem tag="div" onClick={() => this.openEditForm(item)}>Sửa</CDropdownItem>
          {this.props.existPatientReg ? null : <><CDropdownItem divider /><CDropdownItem onClick={() => this.confirmRemove(item)}>Xóa</CDropdownItem></>}
        </CDropdownMenu>
      </CDropdown>
    )
  }
  render() {
    const { isloading, Results, query, pages } = this.state
    if (isloading) return (<Loading />)
    var fields = [
      { key: 'STT', _classes: 'font-weight-bold', _style: { width: '1%' }, },
      {
        key: 'Title',
        label: 'Mã - Tên dịch vụ',
      },
      {
        key: 'LimitQty',
        label: 'Định mức',
        _style: { width: '1%', whiteSpace: 'nowrap' },
      },
      {
        key: 'IsPackageDrugConsum',
        label: 'Gói thuốc/ VTTH',
        _style: { width: '1%', whiteSpace: 'nowrap' },
      },
      {
        key: 'IsActived',
        label: 'Trạng thái',
        _style: { width: '1%', whiteSpace: 'nowrap' },
      },
      {
        key: 'RootService',
        label: 'Dịch vụ thay thế',
        _style: { width: '1%', whiteSpace: 'nowrap' },
      },
      {
        key: 'show_details',
        label: '-/-',
        _style: { width: '1%', whiteSpace: 'nowrap' },
        sorter: false,
        filter: false
      }
    ]
    if (this.props.ServiceType === 2) fields.splice(3, 1)
    if (this.props.readOnly) fields.splice(fields.length - 1, 1)
    var data = (Results || []).filter(e => !e.IsDeleted).map((e, index) => {
      e.STT = index + 1
      return e
    })
    return (
      <>
        <DataTable
          results={data}
          fields={fields}
          scopedSlots={{
            'IsPackageDrugConsum':
              (item) => (
                <td className="text-center">
                  <CBadge color={getBadge(item.IsPackageDrugConsum)}>
                    {item.IsPackageDrugConsum ? <i className="fa fa-fw fa-check" aria-hidden="true"></i> : ''}
                  </CBadge>
                </td>
              ),
            'IsActived':
              (item) => (
                <td>
                  {item.IsDeleted && 'Deleteed'}
                  <CBadge color={getBadge(item.IsActived)}>
                    {item.IsActived ? 'Đang hoạt động' : 'Đã khóa'}
                  </CBadge>
                </td>
              ),
            'Title':
              (item) => (
                <td>
                  {item.Service.Code + ' - ' + item.Service.ViName}
                </td>
              ),
            'LimitQty':
              (item) => (
                <td className="text-center">
                  {item.LimitQty}
                </td>
              ),
            'RootService':
              (item) => (
                <td className="text-center">

                  {(item.ItemsReplace && item.ItemsReplace.filter(e => !e.IsDeleted).length) ?
                    <>
                      <span data-for={item.Id} data-tip>{item.ItemsReplace.filter(e => !e.IsDeleted).length} dịch vụ thay thế</span>
                      <ReactTooltip id={item.Id} type="info">
                        <div className="v-tootip">
                          <div className="v-tootip-header">Dịch vụ thay thế</div>
                          <div className="v-tootip-body text-left">
                            {item.ItemsReplace.filter(e => !e.IsDeleted).map(e => { return <p>{e.Service ? <>{e.Service.Code || '-'} - {e.Service.ViName || '-'}</> : '-'}</p> })}
                          </div>
                        </div>
                      </ReactTooltip>
                    </>
                    : ''}
                </td>
              ),
            'show_details':
              (item) => (
                <td>
                  {this.btnEdit(item)}
                </td>
              )
          }}
          activePage={query.pageNumber}
          onActivePageChange={this.pageChange.bind(this)}
          pages={pages}
        />
        {(!this.props.readOnly && !this.props.existPatientReg) &&
          <div className="mt-3">
            <ServicesSelect modalTitle={this.props.ServiceType === 2 ? 'Chọn Thuốc và VTTH' : 'Chọn Dịch vụ'} btnText={this.props.ServiceType === 2 ? 'Thêm Thuốc và VTTH' : 'Thêm Dịch vụ'} onChange={this.addNewService} query={{ ServiceType: ServiceTypes[this.props.ServiceType] }} />
          </div>
        }
        {this.formCreate()}
      </>
    )
  }
}
export default ServiceList