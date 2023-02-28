import React from 'react';
import {
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
  CInputCheckbox,
  CSwitch,
  CButtonGroup,
  CCardFooter
} from '@coreui/react'
import {
  VIcon,
  VInputRange,
  BlockBtnForm,
  Loading,
  ServicesSelect,
  InputText,
  DateRange
} from 'src/_components'
import { ConfigRevenuePercentService } from 'src/_services'
import BaseComponent from 'src/_components/BaseComponent'
import SimpleReactValidator from 'simple-react-validator'
import { confirmAlert } from 'react-confirm-alert'
import moment from "moment-timezone";
class ServiceRuleGroupDetail extends BaseComponent {
  constructor(props) {
    super(props);
    this.defaultFilter = {
      Name: '',
      Code: ''
    }
    this.state = {
      Results: null,
      pages: 1,
      query: {
        Name: '',
        Code: '',
        pageNumber: 1,
        PageSize: process.env.REACT_APP_PAGE_SIZE
      },
      groups: [],
      selectedAll: false,
      total: 0,
      selectedServiceData: [],
      hasForm: false,
      GroupId: props.match.params.id,
      formData: null,
      rangerTime: '',
      forAll: true,
      reviewPage: 1,
      reviewPages: 1,
      GroupName: ''
    };

    this.handleChange = this.handleChange.bind(this)
    this.selectedService = this.selectedService.bind(this)
    this.clearSelectedService = this.clearSelectedService.bind(this)
    this.openRuleForm = this.openRuleForm.bind(this)
    this.handleChangeInputForm = this.handleChangeInputForm.bind(this)
    this.handleFilterChange = this.handleFilterChange.bind(this)
    this.addNewService = this.addNewService.bind(this)

    this.submit = this.submit.bind(this);
    this.remove = this.remove.bind(this);
    this.validator = new SimpleReactValidator({ autoForceUpdate: this })
    this.addAllService = this.addAllService.bind(this);
  }
  addNewService(items) {
    new ConfigRevenuePercentService().update('Add', {
      Id: this.props.match.params.id,
      Services: items.map(e => e.Id),
    })
      .then(() => {
        this.getData()
        this.alertSuccess()
        this.clearSelectedService()
      }).catch(e => {
      })
  }
  addAllService(query) {
    let { formData } = this.state
    if (formData.Details) {
      delete formData.Details
    }
    new ConfigRevenuePercentService().update('all', {
      ...formData,
      ...query,
      Id: this.props.match.params.id
    })
      .then(() => {
        this.getData()
      }).catch(e => {
      })
  }
  handleFilterChange(e) {
    const { name, value } = e.target
    var query = { ...this.state.query }
    query[name] = value
    this.setState({ query })
  }
  openRuleForm(status, forAll) {
    this.setState({ hasForm: status })
    this.setState({ forAll: forAll })
  }
  submit() {
    if (!this.validator.allValid()) {
      this.validator.showMessages()
      return
    }

    let { formData } = this.state

    formData.ChargePackagePercent = formData.ChargePackagePercent / 100
    formData.ChargePercent = formData.ChargePercent / 100
    formData.OperationPackagePercent = formData.OperationPackagePercent / 100
    formData.OperationPercent = formData.OperationPercent / 100
    formData.ConfigName = formData.Name

    new ConfigRevenuePercentService().update(this.props.match.params.id === 'new' ? '' : this.props.match.params.id, formData)
      .then((res) => {
        if (this.props.match.params.id === 'new') {
          this.props.history.push(`/config-revenue-percent/${res.Id}`)
        } else {
          this.getData()
          this.clearSelectedService()
        }
        this.alertSuccess()
      }).catch(e => {
      })
  }
  handleChangeInputForm(e) {
    const { value, name, type, checked } = e.target;
    let valueUpdate = {}
    if (type === 'text') valueUpdate[name] = value
    if (type === 'checkbox') valueUpdate[name] = checked
    if (name === 'ChargePackagePercent') {
      valueUpdate['ChargePackagePercent'] = value
      valueUpdate['OperationPackagePercent'] = 100 - valueUpdate['ChargePackagePercent']
    }
    if (name === 'ChargePercent') {
      valueUpdate['ChargePercent'] = value
      valueUpdate['OperationPercent'] = 100 - valueUpdate['ChargePercent']
    }
    if (name === 'StartAtEndAt') {
      valueUpdate = {
        StartAt: value.start,
        EndAt: value.end
      }
    }
    this.setState(prevState => {
      let formData = Object.assign({}, prevState.formData)
      formData = { ...formData, ...valueUpdate }
      console.log(formData)
      return { formData }
    })
  }
  setForm(formData) {
    formData.ChargePackagePercent = 100 * formData.ChargePackagePercent
    formData.ChargePercent = 100 * formData.ChargePercent
    formData.OperationPackagePercent = 100 * formData.OperationPackagePercent
    formData.OperationPercent = 100 * formData.OperationPercent
    this.setState({ formData })
  }
  handleFilterSubmit() {
    this.getData()
  }
  getData() {
    // this.updateUrlSearch()
    setTimeout(() => {
      new ConfigRevenuePercentService(this.state.query).find(this.props.match.params.id)
        .then(response => {
          this.setState({
            selectedAll: false
          })
          this.setState({
            total: response.Count
          })
          this.setForm(response)
          this.setState({
            Results: (response.Details || []).map((e, index) => {
              e.Index = ((this.state.query.pageNumber - 1) * this.state.query.PageSize) + (index + 1)
              e.Group = `${e.GroupViName} - ${e.GroupCode}`
              e.selected = this.state.selectedServiceData.filter(ser => ser.Id === e.Id).length !== 0
              return e
            })
          })
          var bonus = 1
          if ((response.Count % process.env.REACT_APP_PAGE_SIZE) === 0) {
            bonus = 0
          }
          // console.log(process.env.REACT_APP_PAGE_SIZE)
          this.setState({ pages: parseInt(response.Count / process.env.REACT_APP_PAGE_SIZE) + bonus });
        })
    }, 100)
  }
  componentDidUpdate(prevProps, prevState, snapshot) {
    console.log('componentDidUpdate', prevProps, prevState, snapshot)
    if (this.props.location !== prevProps.location) {
      this.initForm()
    }
  }
  initForm() {
    // import moment from "moment-timezone";
    this.setState({ formData: null })
    if (this.props.match.params.id === 'new') {
      this.setState({
        selectedAll: false
      })
      this.setState({
        total: 0
      })
      this.setForm({
        ChargePackagePercent: 0.1,
        ChargePercent: 0.1,
        OperationPackagePercent: 0.9,
        OperationPercent: 0.9,
        Details: [],
        Count: 0,
        EndAt: null,
        StartAt: moment().format(process.env.REACT_APP_DATE_FORMAT),
        Name: '',
        IsHealthCheck: false
      })
      this.setState({
        Results: []
      })
      var bonus = 1
      if ((0 % process.env.REACT_APP_PAGE_SIZE) === 0) {
        bonus = 0
      }
      // console.log(process.env.REACT_APP_PAGE_SIZE)
      this.setState({ pages: parseInt(0 / process.env.REACT_APP_PAGE_SIZE) + bonus });
    } else {
      this.getData()
    }
  }
  componentDidMount() {
    console.log('componentDidMount')
    this.initForm()
  }
  clearSelectedService() {
    console.log('err')
    this.setState({
      selectedServiceData: []
    })
    this.setState({
      selectedAll: false
    })
    var Datas = this.state.Results.map(e => {
      e.selected = false
      return e
    })
    this.setState({
      Results: Datas
    })
  }
  remove() {
    confirmAlert({
      title: 'Confirm to Remove',
      message: 'Are you sure to do this.',
      buttons: [
        {
          label: 'Yes',
          onClick: () => this.removeSelected()
        },
        {
          label: 'No'
        }
      ]
    });
  }
  removeGroupConfirmAlert() {
    confirmAlert({
      title: 'Confirm to Remove',
      message: 'Are you sure to do this.',
      buttons: [
        {
          label: 'Yes',
          onClick: () => this.removeGroup()
        },
        {
          label: 'No'
        }
      ]
    });
  }
  removeGroup() {
    new ConfigRevenuePercentService().update('delete/' + this.props.match.params.id)
      .then(() => {
        this.alertSuccess()
        this.props.history.push(`/config-revenue-percent`)
      })
  }
  removeSelected() {
    new ConfigRevenuePercentService().update('Delete',
      {
        Ids: this.state.selectedServiceData.map(e => e.Id),
        Id: this.props.match.params.id
      })
      .then(() => {
        this.getData()
        this.alertSuccess()
        this.clearSelectedService()
      }).catch(e => {
      })
  }
  setSelectedServiceData() {
    var selectedServiceData = this.state.selectedServiceData
    this.state.Results.forEach(e => {
      if (e.selected && !selectedServiceData.find(ser => ser.Id === e.Id)) {
        selectedServiceData.push(e)
      }
      if (!e.selected && selectedServiceData.find(ser => ser.Id === e.Id)) {
        selectedServiceData = selectedServiceData.filter(ser => ser.Id !== e.Id)
      }
    })
    var bonus = 1
    if ((selectedServiceData.length % 25) === 0) {
      bonus = 0
    }
    this.setState({ reviewPages: parseInt(selectedServiceData.length / 25) + bonus });
    this.setState({
      selectedServiceData: selectedServiceData
    })
  }
  selectedService(event, e) {
    const { name, value, checked } = event.target;
    var Datas = []
    if (name === 'select-all') {
      Datas = this.state.Results.map(e => {
        e.selected = checked
        return e
      })
      this.setState({
        selectedAll: checked
      })
    } else {
      Datas = this.state.Results.map(e => {
        if (value === e.Id) e.selected = checked
        return e
      })
    }
    this.setState({
      Results: Datas
    })
    this.setSelectedServiceData()
  }
  revenuePercentForm() {
    const {
      formData
    } = this.state;
    return (
      <CCard>
        <CCardHeader>
          {this.props.match.params.id !== 'new' ? formData.Name : 'Tạo mới phân bổ tỷ lệ doanh thu theo dịch vụ'}
        </CCardHeader>
        <CCardBody>
          <CFormGroup>
            <CLabel htmlFor="appendedInputButton">Tên</CLabel>
            <div className="controls">
              <CInput name="Name" value={formData.Name} placeholder="Type to search" size="16" type="text" onChange={this.handleChangeInputForm} />
              {this.validator.message('Name', formData.Name, 'required')}
            </div>
          </CFormGroup>
          <CFormGroup>
            <CLabel htmlFor="appendedInputButton">Tỷ lệ phân bổ theo gói (BS chỉ định/ BS thực thiện)</CLabel>
            <div className="controls">
              <VInputRange min={0} max={100} onChange={this.handleChangeInputForm} value={formData.ChargePackagePercent} name="ChargePackagePercent" />
            </div>
          </CFormGroup>
          <CFormGroup>
            <CLabel htmlFor="appendedInputButton">Tỷ lệ phân bổ theo DV lẻ (BS chỉ định/ BS thực thiện) </CLabel>
            <div className="controls">
              <VInputRange min={0} max={100} onChange={this.handleChangeInputForm} value={formData.ChargePercent} name="ChargePercent" />
            </div>
          </CFormGroup>
          <CFormGroup>
            <CLabel htmlFor="appendedInputButton">Thời gian hiệu lực </CLabel>
            <div className="controls">
              <DateRange
                // format={process.env.REACT_APP_DATE_FORMAT}
                // value={{
                //   start: formData.StartAt,
                //   end: formData.EndAt
                // }}
                // name="StartAtEndAt"
                // onChange={this.handleChangeInputForm}

                name="StartAtEndAt"
                onChange={this.handleChangeInputForm}
                value={{
                  start: formData.StartAt,
                  end: formData.EndAt
                }}
              />
              {this.validator.message('StartAt', formData.StartAt, 'required')}
            </div>
          </CFormGroup>
          <CFormGroup row>
            <CCol tag="label" sm="3" className="col-form-label">
              Gói khám sức khỏe
            </CCol>
            <CCol sm="9">
              <CSwitch
                className="mr-1"
                color="primary"
                name="IsHealthCheck"
                defaultChecked={formData.IsHealthCheck}
                onChange={this.handleChangeInputForm}
              />
            </CCol>
          </CFormGroup>
          {formData.IsHealthCheck ?
            <CFormGroup>
              <CLabel htmlFor="appendedInputButton">Danh sách Code dịch vụ chính</CLabel>
              <div className="controls">
                <CInput name="HealthCheckDoctorService" value={formData.HealthCheckDoctorService} placeholder="Danh sách Code, cách nhau dấu ," type="text" onChange={this.handleChangeInputForm} />
              </div>
            </CFormGroup>
            :
            ''
          }
        </CCardBody>
        <CCardFooter>
          <CButton type="button" color="primary" onClick={() => this.submit()}>
            Lưu
          </CButton>
        </CCardFooter>
      </CCard>
    )
  }
  filterForm() {
    const { query } = this.state
    return (
      <CRow>
        <CCol xs="4">
          <CFormGroup>
            <CLabel htmlFor="appendedInputButton">Tên</CLabel>
            <div className="controls">
              <InputText name="Name" value={query.Name} placeholder="Type to search" size="16" type="text" onChange={this.handleFilterChange} />
            </div>
          </CFormGroup>
        </CCol>
        <CCol xs="4">
          <CFormGroup>
            <CLabel htmlFor="appendedInputButton">Mã nội dung</CLabel>
            <div className="controls">
              <InputText name="Code" value={query.Code} placeholder="Type to search" size="16" type="text" onChange={this.handleFilterChange} />
            </div>
          </CFormGroup>
        </CCol>
        <CCol xs="4">
          <CFormGroup>
            <CLabel htmlFor="appendedInputButton" className="hidden-elm">xxx</CLabel>
            <div className="controls">
              <CButtonGroup>
                <CButton color="secondary" type="button" onClick={this.handleFilterSubmit.bind(this)}><VIcon size={'sm'} name='cilSearch' /> Tìm kiếm</CButton>
              </CButtonGroup>
            </div>
          </CFormGroup>
        </CCol>
      </CRow>
    )
  }
  render() {
    const {
      Results,
      query,
      pages,
      selectedAll,
      selectedServiceData,
      formData
    } = this.state;
    if (!formData) return (<Loading />)
    const Datas = Results || []
    return (
      <>
        <CRow className="justify-content-center">
          <CCol xl={5}>
            {this.revenuePercentForm()}
          </CCol>
          {this.props.match.params.id !== 'new' &&
            <CCol xl={7}>
              <CCard>
                <CCardHeader>
                  <h3>Danh sách dịch vụ được áp dụng</h3>
                </CCardHeader>
                <CCardBody>
                  {this.filterForm()}
                  <CDataTable
                    items={Datas}
                    fields={[
                      {
                        key: 'index',
                        label: '-/-',
                        _style: { width: '1%' },
                        sorter: false,
                        filter: false
                      },
                      {
                        key: 'checkbox',
                        html: '-/-',
                        _style: { width: '1%' },
                        sorter: false,
                        filter: false
                      },
                      { key: 'Code', label: 'Mã nội dung', _classes: 'font-weight-bold', style: { width: '1%' }, },
                      { key: 'ViName', label: 'Tên', _classes: 'font-weight-bold', style: { width: '1%' }, }
                    ]}
                    hover
                    // size="sm"
                    striped
                    // itemsPerPage={process.env.REACT_APP_PAGE_SIZE}
                    // activePage={page}
                    // clickableRows
                    // itemsPerPageSelect
                    // onPaginationChange={pageChange}
                    // sorter
                    bordered
                    // onRowClick={(item) => this.props.history.push(`/Services/${item.Id}`)}
                    columnHeaderSlot={{
                      'checkbox': (
                        <CFormGroup variant="custom-checkbox" inline>
                          <CInputCheckbox
                            custom
                            id={`select-all`}
                            name={`select-all`}
                            value='all'
                            checked={selectedAll}
                            onChange={this.selectedService}
                          />
                          <CLabel variant="custom-checkbox" htmlFor={`select-all`} ></CLabel>
                        </CFormGroup>
                      )
                    }}
                    scopedSlots={{
                      'index':
                        (item) => (
                          <td>
                            {item.Index}
                          </td>
                        ),
                      'checkbox':
                        (item) => (
                          <td>
                            <CFormGroup variant="custom-checkbox" inline>
                              <CInputCheckbox
                                custom
                                id={`inline-checkbox-${item.Id}`}
                                name={`inline-checkbox-${item.Id}`}
                                value={item.Id}
                                checked={item.selected}
                                onChange={this.selectedService}
                              />
                              <CLabel variant="custom-checkbox" htmlFor={`inline-checkbox-${item.Id}`}></CLabel>
                            </CFormGroup>
                          </td>
                        ),
                    }}
                  />
                  {(Datas && Datas.length) ?
                  <CPagination
                    activePage={query.pageNumber}
                    onActivePageChange={this.pageChange.bind(this)}
                    pages={pages}
                    doubleArrows={true}
                    align="start"
                  />
                  :
                  ""  
                  }
                </CCardBody>
              </CCard>
            </CCol>
          }
        </CRow>
        <BlockBtnForm>
          <CRow>
            <CCol>
              {this.props.match.params.id !== 'new' && <ServicesSelect onChange={this.addNewService} onSelectAll={this.addAllService} isCalculated={true} />}
            </CCol>
            <CCol className="right text-right">
              {
                selectedServiceData && selectedServiceData.length
                  ?
                  <CButtonGroup>
                    {/* <CButton
                      color="info"
                      size="vsm"
                      onClick={() => this.openRuleForm(true)}
                    >
                      Chỉnh sửa ({selectedServiceData.length}) dịch vụ đã chọn <VIcon size={'sm'} name='cilCheckAlt' />
                    </CButton> */}
                    <CButton
                      color="danger"
                      onClick={() => this.remove(true)}
                    >
                      Xóa ({selectedServiceData.length}) dịch vụ đã chọn <VIcon size={'sm'} name='cilCheckAlt' />
                    </CButton>
                    <CButton
                      color="warning"
                      size="vsm"
                      onClick={() => this.clearSelectedService()}
                    >
                      <VIcon size={'sm'} name='cilX' />
                    </CButton>
                  </CButtonGroup>
                  :
                  ''
              }
            </CCol>
            <CCol md="2" className="right text-right">
              {this.props.match.params.id !== 'new' &&
                <CButton
                  color="danger"
                  onClick={() => this.removeGroupConfirmAlert(true)}
                >
                  Xóa nhóm dịch vụ <VIcon size={'sm'} name='cilCheckAlt' />
                </CButton>
              }
            </CCol>
          </CRow>
        </BlockBtnForm>
      </>
    )
  }
}
export default ServiceRuleGroupDetail