import React from 'react'
import {
  Pl01Service,
  SiteService,
  ServiceCategoriesService
} from 'src/_services'
import ReactTable from "react-table"
import withFixedColumns from "react-table-hoc-fixed-columns";
import {
  cloneObj,
  saveByteArray,
  getCurrentUserData
} from 'src/_helpers'
import Select from 'react-select'
import clsx from 'clsx'
import qs from "query-string"
import {
  CCardBody,
  CCol,
  CRow,
  CButton,
  CInput,
  CAlert
} from '@coreui/react'
import BaseComponent from 'src/_components/BaseComponent'
import {
  VIcon,
  MonthPicker,
  Loading,
  CurrencyText
} from 'src/_components'
import moment from "moment-timezone"
import { confirmAlert } from 'react-confirm-alert'

const ReactTableFixedColumns = withFixedColumns(ReactTable);

class PL01 extends BaseComponent {
  constructor(props) {
    super(props)
    this.defaultFilter = {
      StartAt: moment().format('YYYY-MM'),
      EndAt: moment().format('YYYY-MM'),
      PID: ''
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
      totalRow: {},
      rawQuery: null
    };
    this.changeView = this.changeView.bind(this);
    this.handleSelectInputChange = this.handleSelectInputChange.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.fullscreen = this.fullscreen.bind(this)
    this.applyCallback = this.applyCallback.bind(this)
    this.goToPl05 = this.goToPl05.bind(this)
  }
  fullscreen() {
    this.setState({
      isfullscreen: !this.state.isfullscreen
    })
  }
  async componentDidMount() {
    this.queryToState()
    await this.getSite()
    await this.getCategories()
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
  goToPl05(ad) {
    const { query } = this.state
    var pl05Query = {
      AdAccount: ad,
      StartAt: query.StartAt,
      EndAt: query.EndAt,
      serviceType: '1,2',
      Sites: query.Sites
    }
    const stringified = qs.stringify(pl05Query);
    this.props.history.push({
      pathname: '/report/pl05',
      search: `?${stringified}`
    });
  }
  async getSite() {
    var userData = getCurrentUserData()
    await new SiteService().getAllFromStorage('_Sites').then(res => {
      this.setState({
        sites: res.map(e => {
          e.value = e.Id
          e.label = e.Name
          return e
        }).filter(e => userData.UserSites.includes(e.Id))
      });
      this.setState({ loading: false })
    });
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
    if (!(query.Sites && query.StartAt && query.EndAt)) {
      this.setState({ loading: false })
    } else {
      this.getDataForReport(false, this.state.query)
    }
    // this.dataBySpecialty()
  }
  getViewHeight() {
    const { isfullscreen } = this.state
    return isfullscreen ? window.innerHeight - 54 : (window.innerHeight - 87 - 10 - 54 - 40)
  }
  async getCategories() {
    await new ServiceCategoriesService({ query: '' }).getAllFromStorage('_ServiceCategories')
      .then(response => {
        this.setState({
          categories: response.map(e => {
            e.value = e.Id
            e.label = e.ViName || 'N/A'
            return e
          }).filter(e => e.Code !== 'NO_REVENUE' && e.IsShow)
        })
      })
  }
  getDataForReport(isExport, objQuery) {
    var query = {
      ...objQuery,
      DataFMType: isExport ? 'EXP_EXCEL' : null,
      StartAt: objQuery.StartAt.replace("-", ""),
      EndAt: objQuery.EndAt.replace("-", "")
    }
    if (!isExport) this.setState({ rawQuery: query })
    new Pl01Service(query).find('view')
      .then(response => {
        if (isExport) {
          saveByteArray(response.Data.FileName, response.Data.FileData)
        } else {
          let totalRow = response[0]
          this.setState({ totalRow })
          response.shift()
          let all = [...response]
          this.setState({
            data: [...all].map((e, index) => {
              e.Name = e.Name || 'Không xác định'
              // e.Doctor = e.Doctor || 'Không xác định'
              var doctorName = e.Doctor
              if (e.IsTotal) {
                e.Doctor = e.Doctor || 'Không xác định'
              } else {
                e.Doctor = e.Doctor && e.Doctor !== 'Bác sĩ không xác định' ? <span onDoubleClick={() => this.goToPl05(doctorName, objQuery)} className="link">{e.Doctor}</span> : 'Không xác định'
              }
              cloneObj(this.state.categories).forEach(category => {
                e[`Package_${category.Code}`] = <CurrencyText value={e[`Package_${category.Code}`]} />
                e[`Single_${category.Code}`] = <CurrencyText value={e[`Single_${category.Code}`]} />
              });
              e.NotCalculate = <CurrencyText value={e.NotCalculate} />
              e.Calculate = <CurrencyText value={e.Calculate} />
              e.Total = <CurrencyText value={e.Total} />
              return e
            })
          });
          this.setState({ loading: false })
        }
      })
  }
  handleSelectInputChange(value, input) {
    this.setState(prevState => {
      let query = Object.assign({}, prevState.query)
      query[input.name] = value.Id
      return { query }
    })
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
  handleFilterSubmit() {
    this.handleChange({
      target: {
        name: 'DataFMType',
        value: null
      }
    })
    this.updateStateQuery('v', new Date().getTime())
    if (this.isNotvalidator()) {
      return false
    }
    setTimeout(() => {
      this.updateUrlSearch()
    }, 10)
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
  table() {
    const { data, categories, totalRow } = this.state;
    let packageColums = cloneObj(categories).map(cat => {
      cat.accessor = `Package_${cat.Code}`
      cat.Header = cat.ViName
      cat.minWidth = 130
      return cat
    })
    let singleColums = cloneObj(categories).map(cat => {
      cat.accessor = `Single_${cat.Code}`
      cat.Header = cat.ViName
      cat.minWidth = 130
      return cat
    })
    return (
      <>
        {data && data.length ?
          <ReactTableFixedColumns
            getTrProps={this.getTrProps}
            data={data}
            columns={[
              {
                Header: "-",
                fixed: "left",
                columns: [
                  {
                    Header: "Bác sĩ",
                    accessor: "Doctor",
                    width: 150,
                    Footer: () => {
                      return <div><b>Tổng:</b></div>
                    }
                  }
                ]
              },
              {
                Header: "Doanh thu đăng ký lẻ",
                headerClassName: "first-header",
                columns: singleColums
              },
              {
                Header: "Doanh thu đăng ký theo gói",
                headerClassName: "first-header",
                columns: packageColums
              },
              {
                Header: "",
                columns: [
                  {
                    Header: "Chuyên khoa",
                    accessor: "Specialty",
                    width: 150
                  }
                ]
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
                  }
                ]
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
    const { query, data, isfullscreen } = this.state;
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
              ((query.Sites && query.StartAt && query.EndAt && data)) ? this.table() : ''
            }
          </div>
        </CCol>
      </CRow>
    )
  }
  mainFilter() {
    const { sites, query, isfullscreen, data } = this.state
    if (sites && sites.length === 0) return (<CAlert color="light" className="text-center">
      Bạn chưa được phân quyền xem dữ liệu các bệnh viện
  </CAlert>)
    return (

      <CRow className="zindex-100">
        <CCol xs="2">
          <Select
            options={sites}
            // isMulti
            noOptionsMessage={() => ''}
            placeholder="Chọn bệnh viện"
            name="Sites"
            onChange={this.handleSelectInputChange}
            defaultValue={sites.filter(e => (query.Sites && query.Sites === e.value))}
          />
        </CCol>
        <CCol xs="2">
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
          <CInput name="PID" value={query.PID} placeholder="Pid" size="16" type="text" onChange={this.handleChange} />
          <CInput name="VisitCode" value={query.VisitCode} placeholder="VisitCode" size="16" type="text" onChange={this.handleChange} />
          <CInput name="ServiceCode" value={query.ServiceCode} placeholder="ServiceCode" size="16" type="text" onChange={this.handleChange} />
          <CButton className="nowrap" color="warning" type="button" onClick={this.handleFilterSubmit.bind(this)}><VIcon size={'sm'} name='cilSearch' /> Xem báo cáo</CButton>
        </CCol>
        <CCol xs="2" className="text-right">
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
        {this.tableData()}
        {/* {this.withSpecialty()} */}
      </>
    )
  }
}
export default PL01