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
  CForm,
  CInputCheckbox,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CButtonGroup
} from '@coreui/react'
import { VIcon, InputText } from 'src/_components'
import { ServiceService, ServiceGroupService, ServiceCategoriesService } from 'src/_services'
import BaseComponent from 'src/_components/BaseComponent'
import Select from 'react-select'
import { BlockBtnForm, DateRange } from "src/_components"
import moment from "moment-timezone"
import SimpleReactValidator from 'simple-react-validator'
import { Loading } from 'src/_components'
import {
  hisConstants
} from 'src/_constants'

class Service extends BaseComponent {
  constructor(props) {
    super(props);
    this.defaultFilter = {
      Name: '',
      Code: ''
    }
    this.state = {
      Results: null,
      pages: 1,
      query: this.defaultFilter,
      selectedAll: false,
      total: 0,
      selectedServiceData: [],
      hasForm: false,
      rule: {
        start: moment(),
        end: moment(),
        ServiceId: props.match.params.id,
        GroupName: ''
      },
      rangerTime: '',
      forAll: true,
      reviewPage: 1,
      reviewPages: 1,
      groups: [],
      categories: []
    };

    this.handleChange = this.handleChange.bind(this)
    this.handleSelectInputChange = this.handleSelectInputChange.bind(this)
    this.selectedService = this.selectedService.bind(this)
    this.clearSelectedService = this.clearSelectedService.bind(this)
    this.openRuleForm = this.openRuleForm.bind(this)
    this.applyCallback = this.applyCallback.bind(this);
    this.handleChangeGroupName = this.handleChangeGroupName.bind(this);
    this.pageReviewChange = this.pageReviewChange.bind(this);
    this.handleChangeInputForm = this.handleChangeInputForm.bind(this)

    this.save = this.save.bind(this);
    this.validator = new SimpleReactValidator({ autoForceUpdate: this })
  }
  pageReviewChange(newPage) {
    this.setState({ reviewPage: newPage })
  }
  openRuleForm(status, forAll) {
    this.resetRuleForm()
    this.setState({ hasForm: status })
    this.setState({ forAll: forAll })
  }
  handleChangeInputForm(e) {
    const { value, name } = e.target;
    if (name === 'StartAtEndAt') {
      this.setState(prevState => {
        let rule = Object.assign({}, prevState.rule)
        rule.start = value.start
        rule.end = value.end
        return { rule }
      })
    }
  }
  resetRuleForm() {
    this.setState(prevState => {
      let rule = Object.assign({}, prevState.rule)
      rule.start = null
      rule.end = null
      delete rule.Id
      return { rule }
    })
    this.setState({
      reviewPage: 1
    })
  }
  save() {
    if (!this.validator.allValid()) {
      this.validator.showMessages()
      return
    }
    if (this.state.forAll) {
      new ServiceService().update('/all', {
        ...this.state.query,
        StartAt: this.state.rule.start,
        EndAt: this.state.rule.end,
        GroupName: this.state.rule.GroupName
      })
        .then(() => {
          this.getData()
          this.openRuleForm()
          this.alertSuccess()
          this.clearSelectedService()
        }).catch(e => {
        })
    } else {
      new ServiceService().create(
        {
          Services: this.state.selectedServiceData.map(e => e.Id),
          StartAt: this.state.rule.start,
          EndAt: this.state.rule.end,
          GroupName: this.state.rule.GroupName
        })
        .then(() => {
          this.getData()
          this.openRuleForm()
          this.alertSuccess()
          this.clearSelectedService()
        }).catch(e => {
        })
    }
  }
  async getCategories() {
    await new ServiceCategoriesService({ query: '' }).getAllFromStorage('_ServiceCategories')
      .then(response => {
        this.setState({
          categories: response.map(e => {
            e.value = e.Id
            e.label = e.ViName || 'N/A'
            return e
          }).filter(e => e.IsConfig)
        })
      })
  }
  async loadOptions() {
    await new ServiceGroupService({ query: '' }).getAllFromStorage('_ServiceGroup')
      .then(response => {
        var groups = response.map(e => {
          e.value = e.Id
          e.label = e.ViName + ' - ' + e.Code
          return e
        })
        this.setState({
          groups: groups
        })
      })
  }
  handleChangeGroupName(e) {
    const { value } = e.target;
    this.setState(prevState => {
      let rule = Object.assign({}, prevState.rule)
      rule.GroupName = value
      return { rule }
    })
  }
  applyCallback(start, end) {
    let startDate = start.format(process.env.REACT_APP_DATE_FORMAT)
    let endDate = end.format(process.env.REACT_APP_DATE_FORMAT)
    this.setState({ rangerTime: startDate + ' ~ ' + endDate });
    this.setState(prevState => {
      let rule = Object.assign({}, prevState.rule)
      rule.start = start
      rule.end = end
      return { rule }
    })
  }
  handleSelectInputChange(value, input) {
    this.setState(prevState => {
      let query = Object.assign({}, prevState.query)
      query[input.name] = (value || []).map(e => {
        return e.value
      }).join(",")
      return { query }
    })
  }
  getData() {
    // this.updateUrlSearch()
    this.queryToState()
    setTimeout(() => {
      new ServiceService(this.state.query).all()
        .then(response => {
          this.setState({
            selectedAll: false
          })
          this.setState({
            total: response.Count
          })
          this.setState({
            Results: response.Results.map((e, index) => {
              e.Index = ((this.state.query.pageNumber - 1) * this.state.query.PageSize) + (index + 1)
              e.Group = e.GroupViName ? `${e.GroupViName || 'N/A'} - ${e.GroupCode || 'N/A'}` : 'N/A'
              e.Category = e.CategoryViName || 'N/A'
              e.selected = this.state.selectedServiceData.filter(ser => ser.Id === e.Id).length !== 0
              return e
            })
          })
          var bonus = 1
          if ((response.Count % process.env.REACT_APP_PAGE_SIZE) === 0) {
            bonus = 0
          }
          this.setState({ pages: parseInt(response.Count / process.env.REACT_APP_PAGE_SIZE) + bonus });
        })
    }, 100)
  }
  componentDidUpdate(prevProps, prevState, snapshot) {
    console.log('componentDidUpdate', prevProps, prevState, snapshot)
    if (this.props.location !== prevProps.location) {
      this.queryToState()
      this.setState({
        Results: null
      })
      this.getData()
    }
  }
  async componentDidMount() {
    console.log('componentDidMount')
    await this.getCategories()
    await this.loadOptions()
    this.getData()
    this.resetRuleForm()
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
  removeFromSelectedServiceData(id) {
    var selectedServiceData = this.state.selectedServiceData.filter(e => {
      return e.Id !== id
    })
    this.setState({
      selectedServiceData: selectedServiceData
    })
    var Datas = this.state.Results.map(e => {
      if (id === e.Id) e.selected = false
      return e
    })
    this.setState({
      Results: Datas
    })
    if (!selectedServiceData.length) {
      this.openRuleForm()
      this.clearSelectedService()
    }
  }
  selectedService(event) {
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
  table() {
    const {
      Results,
      query,
      pages,
      selectedAll,
    } = this.state;
    if (!Results) return (<Loading />)
    const Datas = Results || []
    return (
      <>
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
            { key: 'ViName', label: 'Tên', _classes: 'font-weight-bold', style: { width: '1%' }, },
            { key: 'Group', label: 'Nhóm', _classes: 'font-weight-bold', style: { width: '1%' }, },
            { key: 'Category', label: 'Loại', _classes: 'font-weight-bold', style: { width: '1%' }, },
            {
              key: 'his',
              label: 'HIS',
              _style: { width: '1%' },
              sorter: false,
              filter: false
            },
            {
              key: 'show_details',
              label: '-/-',
              _style: { width: '1%' },
              sorter: false,
              filter: false
            }
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
            'his':
              (item) => (
                <td>
                  {['OH', 'EHOS'][item.HISCode]}
                </td>
              ),
            'show_details':
              (item) => (
                <td>
                  <CButton
                    color="primary"
                    size="vsm"
                    onClick={() => this.props.history.push(`/Services/${item.Id}`)}
                  >
                    Xem
                </CButton>
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
        <CPagination
          activePage={query.pageNumber}
          onActivePageChange={this.pageChange.bind(this)}
          pages={pages}
          doubleArrows={true}
          align="start"
        />
      </>
    )
  }
  render() {
    const {
      query,
      groups,
      total,
      selectedServiceData,
      hasForm,
      reviewPage,
      reviewPages,
      forAll,
      categories
    } = this.state;
    return (
      <>
        <CRow>
          <CCol xl={12}>
            <CCard>
              <CCardHeader>
                <CForm onSubmit={this.handleFilterSubmit.bind(this)}>
                  <CRow>
                    <CCol xs="2">
                      <CFormGroup>
                        <CLabel htmlFor="appendedInputButton">Tên nội dung</CLabel>
                        <div className="controls">
                          <InputText name="Name" value={query.Name} placeholder="Nhập tên nội dung" size="16" type="text" onChange={this.handleChange} />
                        </div>
                      </CFormGroup>
                    </CCol>
                    <CCol xs="2">
                      <CFormGroup>
                        <CLabel htmlFor="appendedInputButton">Mã nội dung</CLabel>
                        <div className="controls">
                          <InputText name="Code" value={query.Code} placeholder="Nhập Mã nội dung" size="16" type="text" onChange={this.handleChange} />
                        </div>
                      </CFormGroup>
                    </CCol>
                    <CCol xs="2">
                      <CFormGroup>
                        <CLabel htmlFor="appendedInputButton">Hệ thống</CLabel>
                        <div className="controls">
                          <Select
                            options={hisConstants}
                            value={hisConstants.filter(e => (query.HISCode && query.HISCode.includes(e.value)))}
                            isMulti
                            name="HISCode"
                            onChange={this.handleSelectInputChange}
                            placeholder="Chọn"
                          // defaultValue={hisConstants.filter(e => (query.HISCode && query.HISCode.includes(e.value)))}
                          />
                        </div>
                      </CFormGroup>
                    </CCol>
                    <CCol xs="2">
                      <CFormGroup>
                        <CLabel htmlFor="appendedInputButton">Loại dịch vụ</CLabel>
                        <div className="controls">
                          <Select
                            isMulti
                            options={categories}
                            placeholder="Chọn"
                            name="Categories"
                            onChange={this.handleSelectInputChange}
                            value={categories.filter(e => (query.Categories && query.Categories.includes(e.value)))}
                          />
                        </div>
                      </CFormGroup>
                    </CCol>
                    <CCol xs="2">
                      <CFormGroup>
                        <CLabel htmlFor="appendedInputButton">Nhóm dịch vụ</CLabel>
                        <div className="controls">
                          <Select
                            isMulti
                            options={groups}
                            className="select-inline-form"
                            onChange={this.handleSelectInputChange}
                            name="Groups"
                            placeholder="Chọn"
                            value={groups.filter(e => (query.Groups && query.Groups.includes(e.value)))}
                          />
                        </div>
                      </CFormGroup>
                    </CCol>
                    <CCol xs="2">
                      <CFormGroup>
                        <CLabel htmlFor="appendedInputButton" className="hidden-elm">xxx</CLabel>
                        <div className="controls">
                          <CButtonGroup>
                            <CButton color="secondary" type="submit"><VIcon size={'sm'} name='cilSearch' /> Tìm kiếm</CButton>
                            <CButton color="warning" to="/services">Xóa</CButton>
                          </CButtonGroup>
                        </div>
                      </CFormGroup>
                    </CCol>
                  </CRow>
                </CForm>
              </CCardHeader>
              <CCardBody>
                {this.table()}
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
        <BlockBtnForm>
          <CRow>
            {/* <CCol md="3" className="right">
            </CCol> */}
            <CCol md="6" className="right text-right">
              {
                selectedServiceData && selectedServiceData.length
                  ?
                  <div className="f-p15-cw">
                    <CButtonGroup>
                      <CButton
                        color="info"
                        size="vsm"
                        onClick={() => this.openRuleForm(true)}
                      >
                        Không tính doanh thu cho ({selectedServiceData.length}) dịch vụ đã chọn <VIcon size={'sm'} name='cilCheckAlt' />
                      </CButton>
                      <CButton
                        color="warning"
                        size="vsm"
                        onClick={() => this.clearSelectedService()}
                      >
                        <VIcon size={'sm'} name='cilX' />
                      </CButton>
                    </CButtonGroup>
                  </div>
                  :
                  ''
              }
            </CCol>
            <CCol md="6" className="right text-right">
              <div className="f-p15-cw">
                <CButton
                  color="primary"
                  size="vsm"
                  onClick={() => this.openRuleForm(true, true)}
                >
                  Không tính doanh thu cho tất cả ({total}) dịch vụ <VIcon size={'sm'} name='cilCheckAlt' />
                </CButton>
              </div>
            </CCol>
          </CRow>
        </BlockBtnForm>
        {hasForm &&
          <CModal
            show={hasForm}
            onClose={() => this.openRuleForm()}
            color="primary"
            size={'lg'}
          >
            <CModalHeader closeButton>
              <CModalTitle>
                {forAll ? `Không tính doanh thu cho tất cả (${total}) dịch vụ` : `Không tính doanh thu cho (${selectedServiceData.length}) dịch vụ đã chọn`}
              </CModalTitle>
            </CModalHeader>
            <CModalBody>
              <CFormGroup>
                <CLabel htmlFor="appendedInputButton">Tên</CLabel>
                <div className="controls">
                  <CInput name="GroupName" autoComplete="off" value={this.state.rule.GroupName} placeholder="Type to search" size="16" type="text" onChange={this.handleChangeGroupName} />
                  {this.validator.message('GroupName', this.state.rule.GroupName, 'required')}
                </div>
              </CFormGroup>
              <CFormGroup>
                <CLabel>Hiệu lực từ</CLabel>
                <div className="controls">
                  <DateRange
                    name="StartAtEndAt"
                    onChange={this.handleChangeInputForm}
                    value={{
                      start: this.state.rule.start,
                      end: this.state.rule.end
                    }}
                  />
                  {this.validator.message('start', this.state.rule.start, 'required')}
                </div>
              </CFormGroup>
              {!forAll && selectedServiceData && selectedServiceData.length &&
                <>
                  <CDataTable
                    items={selectedServiceData}
                    fields={[
                      { key: 'ViName', label: 'Tên nội dung', _classes: 'font-weight-bold'},
                      { key: 'Code', label: 'Mã nội dung', _classes: 'font-weight-bold'},
                      {
                        key: 'show_details',
                        label: '-/-',
                        _style: { width: '1%' },
                        sorter: false,
                        filter: false
                      }
                    ]}
                    hover
                    // size="sm"
                    striped
                    itemsPerPage={25}
                    activePage={reviewPage}
                    // itemsPerPageSelect
                    // onPaginationChange={pageChange}
                    // sorter
                    bordered
                    scopedSlots={{
                      'show_details':
                        (item) => (
                          <td>
                            <CButton
                              color="primary"
                              size="vsm"
                              onClick={() => this.removeFromSelectedServiceData(item.Id)}
                            >
                              Xóa
                          </CButton>
                          </td>
                        ),
                    }}
                  />
                  {(selectedServiceData && selectedServiceData.length) ?
                    <CPagination
                      activePage={reviewPage}
                      onActivePageChange={this.pageReviewChange.bind(this)}
                      pages={reviewPages}
                      doubleArrows={false}
                      align="start"
                    />
                  :
                    ""
                  }
                </>
              }
            </CModalBody>
            <CModalFooter>
              <CButton color="primary" onClick={() => this.save()}>
                Lưu
            </CButton>
            </CModalFooter>
          </CModal>
        }
      </>
    )
  }
}
export default Service