import React from 'react'
import {
  Pl08Service,
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
  CForm,
  CPagination
} from '@coreui/react'
import { confirmAlert } from 'react-confirm-alert'

import BaseComponent from 'src/_components/BaseComponent'
import { VIcon, MonthPicker, Loading, CurrencyText, UserSelect } from 'src/_components'

import moment from "moment-timezone"

const ReactTableFixedColumns = withFixedColumns(ReactTable);

class PL08 extends BaseComponent {
  constructor(props) {
    super(props)
    this.defaultFilter = {
      StartAt: moment().format('YYYY-MM'),
      EndAt: moment().format('YYYY-MM'),
      PID: '',
      serviceType: '1,2'
    }
    this.state = {
      pages: 1,
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
    // query['ServiceCat'] = ''
    query['serviceType'] = '1,2'
    query['AdDoctorOperation'] = ''
    query['AdDoctorCharge'] = ''
    this.setState({ query })
  }
  fullscreen() {
    this.setState({
      isfullscreen: !this.state.isfullscreen
    })
  }
  async componentDidMount() {
    this.queryToState()
    // var currentQuery = this.getQuery()
    // await this.loadUser(currentQuery.AdAccount || "a")
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
      // this.setState({ loading: false })
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
    // const { users, query } = this.state
    // var currentUserSelected = users.find(e => e.value === query.AdAccount)
    // if (currentUserSelected) {
    //   this.setState({ currentUserSelected })
    // }
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
    // if (!query.AdAccount) {
    //   return false
    // }
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
    return isfullscreen ? window.innerHeight - 54 - 55 - 35 : (window.innerHeight - 87 - 10 - 54 - 55 - 55 - 20)
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
    new Pl08Service(query).find('view')
      .then(response => {
        if (isExport) {
          saveByteArray(response.Data.FileName, response.Data.FileData)
        } else {
          var results = response.Results
          this.setState({noData: results.length <= 1})
          if (results.length > 1) {
            let totalRow = results[results.length - 1]
            this.setState({ totalRow })
            results.pop()
            let all = [...results]
            this.setState({
              data: [...all].map((e, index) => {
                e.ServiceDetail = e.ServiceName + ' - ' + e.ServiceCode
                e.Index = ((this.state.query.pageNumber - 1) * this.state.query.PageSize) + (index + 1)
                // var total = e.NotCalculate + e.Calculate
                // e.Total = <CurrencyText value={total} />
                // e.NotCalculate = <CurrencyText value={e.NotCalculate} />
                // e.Calculate = <CurrencyText value={e.Calculate} />
                // e.NetAmount = <CurrencyText value={e.NetAmount} />
                // e.RevenueDate = e.RevenueDate ? moment(e.RevenueDate).format('DD/MM/YYYY HH:mm') : ''
                e.ChargeDate = e.ChargeDate ? moment(e.ChargeDate).format('DD/MM/YYYY HH:mm') : ''
                e.OperationDate = e.OperationDate ? moment(e.OperationDate).format('DD/MM/YYYY HH:mm') : ''
                e.NetAmount = <CurrencyText value={e.NetAmount} />
                e.ChargeAmount = <CurrencyText value={e.ChargeAmount} />
                e.OperationAmount = <CurrencyText value={e.OperationAmount} />
                // e.Type = e.IsPackage === null ? '-' : (e.IsPackage ? 'Gói' : 'Lẻ')
                return e
              })
            });
            var bonus = 1
            if ((response.Count % process.env.REACT_APP_PAGE_SIZE) === 0) {
              bonus = 0
            }
            this.setState({ pages: parseInt(response.Count / process.env.REACT_APP_PAGE_SIZE) + bonus });
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
    console.log(value)
    this.setState(prevState => {
      let query = Object.assign({}, prevState.query)
      query[input.name] = value ? (input.name === 'serviceType' ? value.map(e => e.value) : value.Id) : null
      console.log(query)
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
    const { data, totalRow, noData, isOptionFilter, query, pages } = this.state;
    return (
      <>
        {(!noData || isOptionFilter) && this.optionFilter()}
        {!noData && data && data.length ?
          <>
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
                  {
                    Header: "Tên và mã nội dung",
                    accessor: "ServiceDetail",
                    width: 200
                  }
                ]
              },
              {
                Header: "Nhóm dịch vụ",
                accessor: "CatName"
              },
              {
                Header: "Giá sau triết khấu",
                accessor: "NetAmount",
                Footer: () => {
                  return <b><CurrencyText value={totalRow.NetAmount} /></b>;
                }
              },
              {
                Header: "Bác sĩ chỉ định",
                accessor: "ChargeDoctor"
              },
              {
                Header: "Ngày chỉ định",
                accessor: "ChargeDate",
                width: 150
              },
              {
                Header: "Doanh thu chỉ định",
                accessor: "ChargeAmount",
                width: 150,
                Footer: () => {
                  return <b><CurrencyText value={totalRow.ChargeAmount} /></b>;
                }
              },
              {
                Header: "Bác sĩ thực hiện",
                accessor: "OperationDoctor"
              },
              {
                Header: "Ngày thực hiện",
                accessor: "OperationDate",
                width: 150,
              },
              {
                Header: "Doanh thu thực hiện",
                accessor: "OperationAmount",
                width: 150,
                Footer: () => {
                  return <b><CurrencyText value={totalRow.OperationAmount} /></b>;
                }
              },
              {
                Header: "Số bảng kê",
                accessor: "BillingNumber"
              }
            ]}
            defaultPageSize={data.length}
            style={{ maxHeight: this.getViewHeight() }}
            showPaginationBottom={false}
            sortable={false}
            className="-striped"
          />
          <CPagination
            activePage={query.pageNumber}
            onActivePageChange={this.pageChange.bind(this)}
            pages={pages}
            doubleArrows={true}
            align="start"
          />
          </>
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
    const { query } = this.state
    return (
      <CCardBody>
        <CRow className="zindex-100">
          <CCol>
            <b>PID</b>
            <CInput name="PID" value={query.PID} placeholder="Pid" size="16" type="text" onChange={this.handleChange} />
          </CCol>
          <CCol>
            <b>Mã nội dung</b>
            <CInput name="ServiceCode" value={query.ServiceCode} placeholder="ServiceCode" size="16" type="text" onChange={this.handleChange} />
          </CCol>
          <CCol>
          <b>Bác sĩ chỉ định</b>
          <UserSelect
            defaultValue={query.AdDoctorCharge}
            applyCallback={this.handleSelectInputChange}
            name="AdDoctorCharge"
          />
          </CCol>
          <CCol>
          <b>Bác sĩ thực hiện</b>
          <UserSelect
            defaultValue={query.AdDoctorOperation}
            applyCallback={this.handleSelectInputChange}
            name="AdDoctorOperation"
          />
          </CCol>
          <CCol>
            <div className="hidden-elm">x</div>
            <CButton className="nowrap" color="warning" type="button" onClick={this.optionFilterSubmit.bind(this)}><VIcon size={'sm'} name='cilSearch' /> Lọc</CButton>
          </CCol>
        </CRow>
      </CCardBody>
    )
  }
  mainFilter() {
    const { sites, query, isfullscreen, data, ServiceGroup } = this.state
    return (
      <CRow className="zindex-101">
        <CCol>
          {/* AdDoctorCharge và AdDoctorOperation */}
          <Select
            classNamePrefix="reactjs-select"
            options={sites}
            // isMulti
            isClearable={true}
            placeholder="Chọn bệnh viện"
            noOptionsMessage={() => 'Không tìm thấy kết quả phù hợp'}
            name="Sites"
            onChange={this.handleSelectInputChange}
            value={sites.filter(e => (query.Sites && query.Sites === e.value))}
          />
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
        {/* <CCol>
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
        </CCol> */}
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
export default PL08