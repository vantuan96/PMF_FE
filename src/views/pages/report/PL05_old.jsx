import React from 'react'
import {
  Pl05Service,
  SiteService,
  ServiceCategoriesService,
  UserService
} from 'src/_services'
import ReactTable from "react-table"

import withFixedColumns from "react-table-hoc-fixed-columns";
import { saveByteArray } from 'src/_helpers'
import Select from 'react-select'
import clsx from 'clsx'
import {
  CCardBody,
  CCol,
  CRow,
  CButton,
  CInput,
  CAlert,
  CForm
} from '@coreui/react'
import { confirmAlert } from 'react-confirm-alert'

import BaseComponent from 'src/_components/BaseComponent'
import { VIcon, MonthPicker, Loading, CurrencyText } from 'src/_components'

import moment from "moment-timezone"
import AsyncSelect from 'react-select/async'
import { serviceTypes } from 'src/_constants'
// const allUser = {
//   value: '',
//   Id: '',
//   label: 'Tất cả bác sĩ'
// }
const ReactTableFixedColumns = withFixedColumns(ReactTable);

class PL05 extends BaseComponent {
  constructor(props) {
    super(props)
    this.defaultFilter = {
      StartAt: moment().format('YYYY-MM'),
      EndAt: moment().format('YYYY-MM'),
      PID: '',
      serviceType: '1,2'
    }
    this.state = {
      loading: true,
      sites: [],
      data: null,
      dataSpecialty: null,
      viewType: 0,
      query: {},
      categories: [],
      tableColums: [],
      isfullscreen: false,
      users: [],
      ServiceGroup: [],
      totalRow: {},
      rawQuery: null,
      currentUserSelected: null,
      noData: false,
      isOptionFilter: false
    };
    this.changeView = this.changeView.bind(this);
    this.handleSelectInputChange = this.handleSelectInputChange.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.fullscreen = this.fullscreen.bind(this)
    this.applyCallback = this.applyCallback.bind(this)
    this.loadUser = this.loadUser.bind(this)
    this.loadServiceCat = this.loadServiceCat.bind(this)
    this.mainFilterSubmit = this.mainFilterSubmit.bind(this)
  }
  mainFilterSubmit (e) {
    e.preventDefault()
    this.resetOptionFilter()
    setTimeout(() => {
      this.handleFilterSubmit()
    }, 100)
  }
  optionFilterSubmit (e) {
    e.preventDefault()
    this.setState({isOptionFilter: true})
    setTimeout(() => {
      this.handleFilterSubmit()
    }, 100)
  }
  resetOptionFilter () {
    var query = { ...this.state.query }
    this.setState({isOptionFilter: false})
    query['PID'] = ''
    query['ServiceCode'] = ''
    query['ServiceCat'] = ''
    query['serviceType'] = '1,2'
    this.setState({ query })
  }
  fullscreen() {
    this.setState({
      isfullscreen: !this.state.isfullscreen
    })
  }
  async componentDidMount() {
    this.queryToState()
    var currentQuery = this.getQuery()
    await this.loadUser(currentQuery.AdAccount || "a")
    await this.getSite()
    this.intFilter()
    this.getServiceCat()
    setTimeout(() => {
      this.getData()
    }, 100)
  }
  componentDidUpdate(prevProps) {
    if (this.props.location !== prevProps.location) {
      this.queryToState()
      setTimeout(() => {
        this.getData()
      }, 100)
    }
  }
  getServiceCat() {
    this.loadServiceCat("")
  }
  loadServiceCat(inputValue, callback) {
    new ServiceCategoriesService({ query: inputValue }).getAllFromStorage('_ServiceCategories')
    .then(response => {
      var ServiceGroup = response.map(e => {
        e.value = e.Id
        e.label = e.ViName || 'N/A'
        return e
      }).filter(e => e.Code !== 'NO_REVENUE')
      this.setState({
        ServiceGroup
      })
      // storage.set('_ServiceCategories', ServiceGroup)
      if (callback) callback(ServiceGroup)
    })
  }
  async getSite() {
    await new SiteService().getAllFromStorage('_Sites').then(res => {
      this.setState({
        sites: res.map(e => {
          e.value = e.Id
          e.label = e.Name
          return e
        })
      });
      this.setState({ loading: false })
    });
  }
  async loadUser(inputValue, callback) {
    await new UserService({ Search: inputValue }).all()
      .then(response => {
        var users = [].concat(response.Results.map(e => {
          e.value = e.Username
          e.Id = e.Username
          e.label = e.Fullname + ' - ' + e.Username
          return e
        }))
        this.setState({ users })
        if (callback) callback(users)
      })
    // this.setState({ currentUserSelected: value })
  }
  intFilter() {
    const { users, query } = this.state
    var currentUserSelected = users.find(e => e.value === query.AdAccount)
    if (currentUserSelected) {
      this.setState({ currentUserSelected })
    }
  }
  export() {
    // this.alert('Thông báo', 'Coming soon')
    // this.handleChange({
    //   target: {
    //     name: 'DataFMType',
    //     value: 'EXP_EXCEL'
    //   }
    // })
    setTimeout(() => {
      this.getDataForReport(true, this.state.rawQuery)
    }, 100)
  }
  getData() {
    this.setState({ loading: true })
    const { query } = this.state;
    if (!this.isFilteValidate()) {
      this.setState({ loading: false })
      return false
    }
    this.getDataForReport(false, query)
    // this.dataBySpecialty()
  }
  isFilteValidate() {
    const { query } = this.state;
    if (!query.AdAccount) {
      return false
    }
    if (!query.Sites) {
      return false
    }
    if (!query.StartAt || !query.EndAt) {
      return false
    }
    return true
  }
  getViewHeight() {
    const { isfullscreen } = this.state
    return isfullscreen ? window.innerHeight - 54 - 55 : (window.innerHeight - 87 - 10 - 54 - 55 - 55)
  }
  isNotvalidator() {
    const { query } = this.state
    if (!query.Sites) {
      confirmAlert({
        title: 'Lỗi',
        message: 'Vui lòng chọn Bệnh viện để xem báo cáo',
        buttons: [
          {
            label: 'Đồng ý',
          }
        ]
      })
      return true
    }
    return false
  }
  async getCategories() {
    await new ServiceCategoriesService({ query: '' }).getAllFromStorage('_ServiceCategories')
      .then(response => {
        this.setState({
          categories: response.map(e => {
            e.value = e.Id
            e.label = e.ViName || 'N/A'
            return e
          })
        })
      })
  }
  getDataForReport(isExport, objQuery) {
    var { serviceType } = objQuery
    var query = {
      ...objQuery,
      DataFMType: isExport ? 'EXP_EXCEL' : null,
      StartAt: objQuery.StartAt.replace("-", ""),
      EndAt: objQuery.EndAt.replace("-", "")
    }
    if (serviceType && serviceType.includes('1')) query.IsSingle = true
    if (serviceType && serviceType.includes('2')) query.IsPackage = true
    if (!isExport) this.setState({ rawQuery: query })
    new Pl05Service(query).find('view')
      .then(response => {
        if (isExport) {
          saveByteArray(response.Data.FileName, response.Data.FileData)
        } else {
          this.setState({noData: response.length <= 1})
          if (response.length > 1) {
            let totalRow = response[response.length - 1]
            this.setState({ totalRow })
            response.pop()
            let all = [...response]
            this.setState({
              data: [...all].map((e, index) => {
                e.Index = index + 1
                var total = e.NotCalculate + e.Calculate
                e.Total = <CurrencyText value={total} />
                e.NotCalculate = <CurrencyText value={e.NotCalculate} />
                e.Calculate = <CurrencyText value={e.Calculate} />
                e.NetAmount = <CurrencyText value={e.NetAmount} />
                e.RevenueDate = e.RevenueDate ? moment(e.RevenueDate).format('DD/MM/YYYY HH:mm') : ''
                e.ChargeDate = e.ChargeDate ? moment(e.ChargeDate).format('DD/MM/YYYY HH:mm') : ''
                e.Type = e.IsPackage === null ? '-' : (e.IsPackage ? 'Gói' : 'Lẻ')
                return e
              })
            });
          } else {
            this.setState({data: []})
          }
          this.setState({ loading: false })
        }
      }).catch(e => {
        this.setState({ loading: false })
      })
  }
  handleSelectInputChange(value, input) {
    this.setState(prevState => {
      let query = Object.assign({}, prevState.query)
      query[input.name] = value ? (input.name === 'serviceType' ? value.map(e => e.value) : value.Id) : null
      return { query }
    })
    if (input.name === 'AdAccount') {
      this.setState({ currentUserSelected: value })
      this.setState(prevState => {
        let query = Object.assign({}, prevState.query)
        query['Sites'] = null
        return { query }
      })
    }
  }
  applyCallback(e) {
    this.handleChange({
      target: {
        name: 'StartAt',
        value: e.value.from.fomarted
      }
    })
    this.handleChange({
      target: {
        name: 'EndAt',
        value: e.value.to.fomarted
      }
    })
  }
  changeView(e) {
    this.setState({ viewType: e.target.checked ? 1 : 0 });
  }
  handleFilterSubmit(e) {
    if (e) e.preventDefault()
    this.handleChange({
      target: {
        name: 'DataFMType',
        value: null
      }
    })
    this.updateStateQuery('v', new Date().getTime())
    if (!this.isFilteValidate()) {
      confirmAlert({
        title: 'Lỗi',
        message: 'Vui lòng chọn bác sĩ và bệnh viện để xem báo cáo',
        buttons: [
          {
            label: 'Đồng ý',
          }
        ]
      })
    } else {
      setTimeout(() => {
        this.updateUrlSearch()
      }, 10)
    }
  }
  getTrProps = (state, rowInfo, instance) => {
    if (rowInfo) {
      return {
        className: rowInfo.original.IsTotal ? 'total-row' : ''
      }
    }
    return {
      className: ''
    }
  }
  table() {
    const { data, totalRow, noData, isOptionFilter } = this.state;
    return (
      <>
        {(!noData || isOptionFilter) && this.optionFilter()}
        {!noData && data && data.length ?
          <ReactTableFixedColumns
            getTrProps={this.getTrProps}
            data={data}
            columns={[
              {
                Header: "-",
                fixed: "left",
                columns: [
                  {
                    Header: "Stt",
                    accessor: "Index",
                    width: 60,
                    Footer: () => {
                      return <div><b>Tổng:</b></div>
                    }
                  },
                  {
                    Header: "PID",
                    accessor: "CustomerPID",
                    width: 100
                  },
                ]
              },
              {
                Header: "Tên KH",
                accessor: "CustomerName",
                width: 200
              },
              {
                Header: "Mã nội dung",
                accessor: "ServiceCode"
              },
              {
                Header: "Chi tiết",
                accessor: "ServiceName"
              },
              {
                Header: "Ngày doanh thu",
                accessor: "RevenueDate",
                width: 150,
              },
              {
                Header: "Ngày chỉ định",
                accessor: "ChargeDate",
                width: 150
              },
              {
                Header: "Số bảng kê",
                accessor: "BillingNumber"
              },
              {
                Header: "Nhóm dịch vụ",
                accessor: "CatName"
              },
              // {
              //   Header: "Doanh thu",
              //   accessor: "NetAmount",
              //   width: 130
              // },
              {
                Header: "Loại",
                accessor: "Type",
                width: 50,
              },
              {
                Header: "Tổng doanh thu",
                fixed: "right",
                columns: [
                  {
                    Header: "Không xét thưởng",
                    accessor: "NotCalculate",
                    width: 130,
                    style: { overflow: "visible" },
                    Footer: () => {
                      return <b><CurrencyText value={totalRow.NotCalculate} /></b>;
                    }
                  },
                  {
                    Header: "Xét thưởng",
                    accessor: "Calculate",
                    width: 130,
                    Footer: () => {
                      return <b><CurrencyText value={totalRow.Calculate} /></b>;
                    }
                  },
                  {
                    Header: "Tổng doanh thu",
                    accessor: "Total",
                    width: 130,
                    Footer: () => {
                      return <b><CurrencyText value={(totalRow.Calculate + totalRow.NotCalculate)} /></b>;
                    }
                  }]
              }
            ]}
            defaultPageSize={data.length}
            style={{ maxHeight: this.getViewHeight() }}
            showPaginationBottom={false}
            sortable={false}
            className="-striped"
          />
          :
          <CAlert color="light" className="text-center">
            Không có dữ liệu
          </CAlert>
        }
      </>
    )
  }
  tableData() {
    const { data, isfullscreen } = this.state;
    return (
      <CRow>
        <CCol xl={12}>
          <div className={clsx({
            'card-fullscreen': isfullscreen,
            'card-mini': true
          })}>
            <CCardBody>
              {this.mainFilter()}
            </CCardBody>
            {
              ((data)) ? this.table() : ''
            }
          </div>
        </CCol>
      </CRow>
    )
  }
  optionFilter() {
    const { query, ServiceGroup } = this.state
    return (
      <CCardBody>
        <CRow className="zindex-100">
          <CCol>
            <CInput name="PID" value={query.PID} placeholder="Pid" size="16" type="text" onChange={this.handleChange} />
          </CCol>
          <CCol>
            <CInput name="ServiceCode" value={query.ServiceCode} placeholder="ServiceCode" size="16" type="text" onChange={this.handleChange} />
          </CCol>
          <CCol>
            <Select
              options={ServiceGroup}
              className="select-inline-form"
              onChange={this.handleSelectInputChange}
              name="ServiceCat"
              placeholder="Nhóm dịch vụ..."
              defaultValue={ServiceGroup.filter(e => (query.ServiceCat && query.ServiceCat === e.value))}
              isClearable={true}
              id="ServiceCat"
              classNamePrefix="reactjs-select"
            />
          </CCol>
          <CCol>
            <Select
              classNamePrefix="reactjs-select"
              isClearable={false}
              isSearchable={false}
              options={serviceTypes}
              value={serviceTypes.filter(e => (query.serviceType && query.serviceType.includes(e.value)))}
              isMulti
              name="serviceType"
              onChange={this.handleSelectInputChange}
            // defaultValue={hisConstants.filter(e => (query.HISCode && query.HISCode.includes(e.value)))}
            />
          </CCol>
          <CCol>
            <CButton className="nowrap" color="warning" type="button" onClick={this.optionFilterSubmit.bind(this)}><VIcon size={'sm'} name='cilSearch' /> Lọc</CButton>
          </CCol>
        </CRow>
      </CCardBody>
    )
  }
  mainFilter() {
    const { sites, query, isfullscreen, users, data, currentUserSelected } = this.state
    var siteByUser = currentUserSelected && currentUserSelected.Sites ? sites.filter(e => currentUserSelected.Sites.includes(e.Id)) : []
    return (
      <CRow className="zindex-101">
        <CCol>
          <AsyncSelect
            classNamePrefix="reactjs-select"
            loadOptions={this.loadUser.bind(this)}
            defaultOptions={users}
            className="select-inline-form"
            onChange={this.handleSelectInputChange}
            name="AdAccount"
            placeholder="Gõ để tìm kiếm BS..."
            isClearable={true}
            defaultValue={users.find(e => (query.AdAccount && query.AdAccount === e.value)) || null}
          />
        </CCol>
        <CCol>
          <Select
            classNamePrefix="reactjs-select"
            options={siteByUser}
            // isMulti
            isClearable={true}
            placeholder="Chọn bệnh viện"
            noOptionsMessage={() => 'Không tìm thấy kết quả phù hợp'}
            name="Sites"
            onChange={this.handleSelectInputChange}
            value={siteByUser.filter(e => (query.Sites && query.Sites === e.value))}
          />
        </CCol>
        <CCol>
          <MonthPicker
            applyCallback={this.applyCallback}
            name="time"
            defaultValue={{
              start: query.StartAt,
              end: query.EndAt,
            }}
          />
        </CCol>
        <CCol className="d-flex">
          {/* <CInput name="PID" value={query.PID} placeholder="Pid" size="16" type="text" onChange={this.handleChange} />
          <CInput name="VisitCode" value={query.VisitCode} placeholder="VisitCode" size="16" type="text" onChange={this.handleChange} />
          <CInput name="ServiceCode" value={query.ServiceCode} placeholder="ServiceCode" size="16" type="text" onChange={this.handleChange} /> */}
          <CButton className="nowrap" color="warning" type="submit" onClick={this.mainFilterSubmit.bind(this)}><VIcon size={'sm'} name='cilSearch' /> Xem báo cáo</CButton>
        </CCol>
        <CCol className="text-right">
          {data && data.length ? <CButton color="default" type="button" onClick={this.export.bind(this)}><VIcon size={'sm'} name='cilCloudDownload' /> Xuất báo cáo</CButton> : ''} {" "}
          <CButton color="info" type="button" onClick={this.fullscreen.bind(this)}>
            {isfullscreen ? <VIcon size={'sm'} name='cilFullscreenExit' /> : <VIcon size={'sm'} name='cilFullscreen' />}
          </CButton>
        </CCol>
      </CRow>
    )
  }
  render() {
    const { loading } = this.state;
    if (loading) return (<Loading />)
    return (
      <>
        <CForm onSubmit={this.mainFilterSubmit.bind(this)}>
          {this.tableData()}
        </CForm>
      </>
    )
  }
}
export default PL05