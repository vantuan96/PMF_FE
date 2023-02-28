import React from "react";
import { Loading, InputText, VIcon } from "src/_components";
import { ServiceService, ServiceGroupService, ServiceCategoriesService } from "src/_services";
import {
  CCol,
  CDataTable,
  CRow,
  CPagination,
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
import Select from 'react-select'
import { confirmAlert } from 'react-confirm-alert'

export class ServicesSelect extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      Results: null,
      isOpen: false,
      loading: true,
      query: {
        Name: '',
        Code: '',
        pageNumber: 1,
        PageSize: 10
      },
      groups: [],
      categories: [],
      selectedAll: false,
      total: 0,
      selectedServiceData: []
    }

    this.setModal = this.setModal.bind(this);
    this.selectedItem = this.selectedItem.bind(this);
    this.selectedItems = this.selectedItems.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.selectedService = this.selectedService.bind(this)
    this.clearSelectedService = this.clearSelectedService.bind(this)
    this.handleSelectInputChange = this.handleSelectInputChange.bind(this)
  }
  pageChange(newPage, oldpage) {
    if (this.state.query.pageNumber !== newPage && !oldpage) {
      this.updateStateQuery('pageNumber', newPage)
      setTimeout(() => {
        this.getService()
      })
    }
  }
  handleFilterSubmit() {
    this.updateStateQuery('pageNumber', 1)
    setTimeout(() => {
      this.getService()
    }, 200);
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
  selectedItems() {
    this.setModal()
    if (this.props.onChange) {
      const { datas } = this.state
      this.props.onChange({
        target: {
          name: this.props.name,
          value: (datas || []).filter(e => e.selected)
        }
      });
    }
  }
  selectedItem(item) {
    let datas = this.state.datas
    this.setState({
      datas: datas.map(e => {
        if (e.id === item.id) e.selected = !item.selected
        return e
      })
    });
  }
  setModal(status) {
    this.clearSelectedService()
    this.setState({ isOpen: status })
    this.setState({ query: {
      Name: '',
      Code: '',
      pageNumber: 1,
      PageSize: 10
    }})
    if (status) this.initData()
  }
  clearSelectedService() {
    this.setState({
      selectedServiceData: []
    })
    this.setState({
      selectedAll: false
    })
    if (this.state.Results) {
      var Datas = this.state.Results.map(e => {
        e.selected = false
        return e
      })
      this.setState({
        Results: Datas
      })
    }
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
    if (name === 'select-allx') {
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
  async initData() {
    await this.getCategories()
    await this.loadOptions()
    this.getService()
  }
  getService() {
    new ServiceService({ ...this.state.query, ...this.props.query, isCalculated: this.props.isCalculated, IsActived: true }).all()
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
        if ((response.Count % this.state.query.PageSize) === 0) {
          bonus = 0
        }
        this.setState({ pages: parseInt(response.Count / this.state.query.PageSize) + bonus });
      })
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
  handleSelectInputChange(value, input) {
    this.setState(prevState => {
      let query = Object.assign({}, prevState.query)
      query[input.name] = (value || []).map(e => {
        return e.value
      }).join(",")
      return { query }
    })
  }
  commit() {
    if (this.props.onChange) this.props.onChange(this.state.selectedServiceData)
    this.setModal()
  }
  commitAll() {
    confirmAlert({
      title: 'Xác nhận',
      message: `Bạn có chắc thêm tất cả ${this.state.total} dịch vụ`,
      buttons: [
        {
          label: 'Đồng ý',
          onClick: () => this.submitCommitAll()
        },
        {
          label: 'Quay lại'
        }
      ]
    });
  }
  submitCommitAll () {
    if (this.props.onSelectAll) this.props.onSelectAll(this.state.query)
    this.setModal()
  }
  button() {
    return (<div className="btn btn-warning" onClick={() => this.setModal(true)}>{this.props.btnText || 'Thêm dịch vụ'}</div>)
  }
  filterForm() {
    const {
      query,
      selectedServiceData,
      groups,
      total
    } = this.state
    return (
      <CForm>
        <CRow>
          <CCol>
            <CFormGroup>
              <CLabel htmlFor="appendedInputButton">Tên nội dung</CLabel>
              <div className="controls">
                <InputText name="Name" value={query.Name} placeholder="Tên nội dung" size="16" type="text" onChange={this.handleChange} />
              </div>
            </CFormGroup>
          </CCol>
          <CCol>
            <CFormGroup>
              <CLabel htmlFor="appendedInputButton">Mã nội dung</CLabel>
              <div className="controls">
                <InputText name="Code" value={query.Code} placeholder="Mã nội dung" size="16" type="text" onChange={this.handleChange} />
              </div>
            </CFormGroup>
          </CCol>
          {/* <CCol>
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
          </CCol> */}
          <CCol>
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
          <CCol>
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
        <CRow>
          <CCol>
            <CFormGroup>
              <CLabel htmlFor="appendedInputButton" className="hidden-elm">xxx</CLabel>
              <div className="controls">
                <CButtonGroup>
                  {
                    selectedServiceData && selectedServiceData.length
                      ?
                      <>
                        <CButton
                          color="info"
                          onClick={() => this.commit(true)}
                        >
                          Thêm ({selectedServiceData.length}) dịch vụ đã chọn <VIcon size={'sm'} name='cilCheckAlt' />
                        </CButton>
                        <CButton
                          color="warning"
                          onClick={() => this.clearSelectedService()}
                        >
                          <VIcon size={'sm'} name='cilX' />
                        </CButton>
                      </>
                      :
                      ''
                  }
                </CButtonGroup>
                <CButtonGroup className="float-right">
                  {
                    (total && this.props.onSelectAll)
                      ?
                      <>
                        <CButton
                          color="info"
                          onClick={() => this.commitAll()}
                        >
                          Thêm tất cả ({total}) dịch vụ <VIcon size={'sm'} name='cilCheckAlt' />
                        </CButton>
                      </>
                      :
                      ''
                  }
                </CButtonGroup>
              </div>
            </CFormGroup>
          </CCol>
        </CRow>
      </CForm>
    )
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
            { key: 'Code', label: 'Mã', _classes: 'font-weight-bold', style: { width: '1%' }, },
            { key: 'ViName', label: 'Tên', _classes: 'font-weight-bold', style: { width: '1%' }, },
            { key: 'Group', label: 'Nhóm', _classes: 'font-weight-bold', style: { width: '1%' }, },
          ]}
          hover
          // size="sm"
          striped
          // itemsPerPage={this.state.query.PageSize}
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
                  id={`select-allx`}
                  name={`select-allx`}
                  value='all'
                  checked={selectedAll}
                  onChange={this.selectedService}
                />
                <CLabel variant="custom-checkbox" htmlFor={`select-allx`} ></CLabel>
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
      isOpen,
    } = this.state
    return (
      <>
        {this.button()}
        <CModal
          show={isOpen}
          onClose={() => this.setModal()}
          size="xl"
          color="primary"
          closeOnBackdrop={false}
        >
          <CModalHeader closeButton>
            <CModalTitle>{this.props.modalTitle || 'Chọn dịch vụ'}</CModalTitle>
          </CModalHeader>
          <CModalBody>
            {this.filterForm()}
            {isOpen && this.table()}
          </CModalBody>
          <CModalFooter>
            <CButton
              color="secondary"
              onClick={() => this.setModal()}
            >Hủy</CButton>
          </CModalFooter>
        </CModal>
      </>
    )
  }
}
