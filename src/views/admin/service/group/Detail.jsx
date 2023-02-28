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
  CForm,
  CFormGroup,
  CLabel,
  CButton,
  CInputCheckbox,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CButtonGroup
} from '@coreui/react'
import { ServiceService, ServiceGroupService } from 'src/_services'
import BaseComponent from 'src/_components/BaseComponent'
import SimpleReactValidator from 'simple-react-validator'
import { Loading, ServicesSelect, BlockBtnForm, VIcon, DateRange } from 'src/_components'
import RuleGroupService from 'src/_services/ruleGroup.service'
import { confirmAlert } from 'react-confirm-alert'

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
      query: this.defaultFilter,
      groups: [],
      selectedAll: false,
      total: 0,
      selectedServiceData: [],
      hasForm: false,
      GroupId: props.match.params.id,
      rule: {
        start: null,
        end: null,
        GroupName: ''
      },
      rangerTime: '',
      forAll: true,
      reviewPage: 1,
      reviewPages: 1,
      GroupName: ''
    };

    this.handleChange = this.handleChange.bind(this)
    this.handleSelectInputChange = this.handleSelectInputChange.bind(this)
    this.selectedService = this.selectedService.bind(this)
    this.clearSelectedService = this.clearSelectedService.bind(this)
    this.openRuleForm = this.openRuleForm.bind(this)
    this.applyCallback = this.applyCallback.bind(this);
    this.handleChangeGroupName = this.handleChangeGroupName.bind(this);
    this.pageReviewChange = this.pageReviewChange.bind(this);
    this.addNewService = this.addNewService.bind(this)
    this.addAllService = this.addAllService.bind(this)
    this.handleChangeInputForm = this.handleChangeInputForm.bind(this)
    
    this.submit = this.submit.bind(this);
    this.remove = this.remove.bind(this);
    this.validator = new SimpleReactValidator({ autoForceUpdate: this })
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
  addAllService(query) {
    new RuleGroupService().update('all', {
      ...query,
      Id: this.props.match.params.id
    })
      .then(() => {
        this.getData()
      }).catch(e => {
      })
  }
  addNewService(items) {
    new RuleGroupService().update('Add', {
      Id: this.state.GroupId,
      Details: items,
      StartAt: this.state.rule.start,
      EndAt: this.state.rule.end
    })
      .then(() => {
        this.getData()
        this.alertSuccess()
        this.clearSelectedService()
      }).catch(e => {
      })
  }
  pageReviewChange(newPage) {
    this.setState({ reviewPage: newPage })
  }
  openRuleForm(status, forAll) {
    this.resetRuleForm()
    this.setState({ hasForm: status })
    this.setState({ forAll: forAll })
  }
  resetRuleForm() {
  }
  submit() {
    if (!this.validator.allValid()) {
      this.validator.showMessages()
      return
    }
    new RuleGroupService().update(this.state.GroupId,
      {
        Services: this.state.selectedServiceData.map(e => e.Id),
        StartAt: this.state.rule.start,
        EndAt: this.state.rule.end,
        Name: this.state.rule.GroupName,
        Id: this.state.GroupId
      })
      .then(() => {
        this.getData()
        this.openRuleForm()
        this.alertSuccess()
        this.clearSelectedService()
      }).catch(e => {
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
    let startDate = start
    let endDate = end
    this.setState({ rangerTime: startDate + ' ~ ' + endDate });
    this.setState(prevState => {
      let rule = Object.assign({}, prevState.rule)
      rule.start = start
      rule.end = end
      return { rule }
    })
  }
  loadOptions(inputValue, callback) {
    new ServiceGroupService({ query: inputValue }).all()
      .then(response => {
        var groups = response.map(e => {
          e.value = e.Id
          e.label = e.ViName + ' - ' + e.Code
          return e
        })
        this.setState({
          groups: groups
        })
        callback(groups)
      })
  }
  handleSelectInputChange(value, input) {
    this.setState(prevState => {
      let query = Object.assign({}, prevState.query)
      query[input.name] = value.map(e => {
        return e.value
      })
      return { query }
    })
  }
  getData() {
    // this.updateUrlSearch()
    this.queryToState()
    setTimeout(() => {
      new RuleGroupService(this.state.query).find(this.state.GroupId)
        .then(response => {
          this.setState({
            selectedAll: false
          })
          this.setState({
            GroupName: response.Name
          })

          var first = response.Rules.Results && response.Rules.Results.length ? response.Rules.Results[0] : {
            EndAt: null,
            StartAt: null
          }
          this.setState({
            rule: {
              GroupName: response.Name,
              start: response.StartAt || first.StartAt,
              end: response.EndAt || first.EndAt
            }
          })
          this.setState({
            total: response.Rules.Count
          })
          this.setState({
            Results: response.Rules.Results.map((e, index) => {
              e.Index = ((this.state.query.pageNumber - 1) * this.state.query.PageSize) + (index + 1)
              e.Group = `${e.GroupViName} - ${e.GroupCode}`
              e.selected = this.state.selectedServiceData.filter(ser => ser.Id === e.Id).length !== 0
              return e
            })
          })
          var bonus = 1
          if ((response.Rules.Count % process.env.REACT_APP_PAGE_SIZE) === 0) {
            bonus = 0
          }
          this.setState({ pages: parseInt(response.Rules.Count / process.env.REACT_APP_PAGE_SIZE) + bonus });
        })
    }, 100)
  }
  componentDidUpdate(prevProps, prevState, snapshot) {
    console.log('componentDidUpdate', prevProps, prevState, snapshot)
    if (this.props.location !== prevProps.location) {
      this.getData()
    }
  }
  componentDidMount() {
    console.log('componentDidMount')
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
    new RuleGroupService().update('delete/' + this.state.GroupId)
      .then(() => {
        this.alertSuccess()
        this.props.history.push(`/service-rule`)
      })
  }
  removeSelected() {
    new ServiceService().update('Rule/Delete',
      {
        Ids: this.state.selectedServiceData.map(e => e.Id),
        Id: this.state.GroupId
      })
      .then(() => {
        this.getData()
        this.openRuleForm()
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
  render() {
    const {
      Results,
      query,
      pages,
      selectedAll,
      total,
      selectedServiceData,
      hasForm,
      reviewPage,
      reviewPages,
      forAll,
      GroupName
    } = this.state;
    if (!Results) return (<Loading />)
    const Datas = Results || []
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
                        <CLabel htmlFor="appendedInputButton">Mã dịch vụ</CLabel>
                        <div className="controls">
                          <CInput name="ServiceCode" value={query.ServiceCode} placeholder="Type to search" size="16" type="text" onChange={this.handleChange} />
                        </div>
                      </CFormGroup>
                    </CCol>
                    <CCol xs="2">
                      <CFormGroup>
                        <CLabel htmlFor="appendedInputButton" className="hidden-elm">xxx</CLabel>
                        <div className="controls">
                          <CButtonGroup>
                            <CButton color="secondary" type="submit"><VIcon size={'sm'} name='cilSearch' /> Tìm kiếm</CButton>
                            <CButton color="warning" to={`/service-rule/${this.state.GroupId}`}>Xóa</CButton>
                          </CButtonGroup>
                        </div>
                      </CFormGroup>
                    </CCol>
                    <CCol>
                      <CFormGroup className="text-right">
                        <CLabel htmlFor="appendedInputButton" className="hidden-elm">xxx</CLabel>
                        <div className="controls">
                          <CButton
                            color="info"
                            onClick={() => this.openRuleForm(true, true)}
                          >
                            Chỉnh sửa <VIcon size={'sm'} name='cilCheckAlt' />
                          </CButton>
                        </div>
                      </CFormGroup>
                    </CCol>
                  </CRow>
                </CForm>
                <h3>{GroupName}</h3>
              </CCardHeader>
              <CCardBody>
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
                    { key: 'Code', label: 'Mã', _classes: 'font-weight-bold', style: { width: '1%' }, },
                    { key: 'ViName', label: 'Tên', _classes: 'font-weight-bold', style: { width: '1%' }, },
                    {
                      key: 'time',
                      label: 'Hiệu lực',
                      sorter: false,
                      filter: false
                    },
                    {
                      key: 'his',
                      label: 'HIS',
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
                    'time':
                      (item) => (
                        <td>
                          {item.StartAt || '~'} - {item.EndAt || '~'}
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
                            onClick={() => this.props.history.push(`/Services/${item.ServiceId}`)}
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
                {Datas && Datas.length ?
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
        </CRow>
        <BlockBtnForm>
          <CRow>
            <CCol>
              <ServicesSelect onChange={this.addNewService} onSelectAll={this.addAllService} />
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
              <CButton
                color="danger"
                onClick={() => this.removeGroupConfirmAlert(true)}
              >
                Xóa nhóm dịch vụ <VIcon size={'sm'} name='cilCheckAlt' />
              </CButton>
            </CCol>
          </CRow>
        </BlockBtnForm>
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
                <CInput name="GroupName" value={this.state.rule.GroupName} placeholder="Type to search" size="16" type="text" onChange={this.handleChangeGroupName} />
                {this.validator.message('GroupName', this.state.rule.GroupName, 'required')}
              </div>
            </CFormGroup>
            <div className="only-date">
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
            {!forAll && selectedServiceData && selectedServiceData.length &&
              <>
                <CDataTable
                  items={selectedServiceData}
                  fields={[
                    'Code', 'ViName'
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
                />
                <CPagination
                  activePage={reviewPage}
                  onActivePageChange={this.pageReviewChange.bind(this)}
                  pages={reviewPages}
                  doubleArrows={false}
                  align="start"
                />
              </>
            }
          </CModalBody>
          <CModalFooter>
            <CButton type="button" color="primary" onClick={() => this.submit()}>
              Lưu
            </CButton>
          </CModalFooter>
        </CModal>
      </>
    )
  }
}
export default ServiceRuleGroupDetail