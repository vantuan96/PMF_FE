import React from 'react'
import { Pl01Service, SiteService } from 'src/_services'
import i18n from 'src/i18n'
import {
  CChartBar,
} from '@coreui/react-chartjs'
// import {
//   randomIntFromInterval
// } from 'src/_helpers'
import Select from 'react-select'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CCol,
  CRow,
  CSwitch,
  CFormGroup,
  CLabel,
  CButtonGroup,
  CButton
} from '@coreui/react'
import clsx from 'clsx'
import BaseComponent from 'src/_components/BaseComponent'
import { VIcon, MonthPicker, Loading } from 'src/_components'
import moment from "moment-timezone"
// const fakeData = [
//   {
//     Name: 'Nhà thuốc',
//     Single: 0,
//     Package: 0,
//     NotCalculate: 0,
//     Calculate: 0,
//     total: randomIntFromInterval(100000000, 900000000)
//   },
//   {
//     Name: 'Khám bệnh',
//     Single: randomIntFromInterval(100000000, 900000000),
//     Package: randomIntFromInterval(100000000, 900000000),
//     NotCalculate: randomIntFromInterval(100000000, 900000000),
//     Calculate: randomIntFromInterval(100000000, 900000000)
//   }
//   ,
//   {
//     Name: 'Xét nghiệm',
//     Single: randomIntFromInterval(100000000, 900000000),
//     Package: randomIntFromInterval(100000000, 900000000),
//     NotCalculate: randomIntFromInterval(100000000, 900000000),
//     Calculate: randomIntFromInterval(100000000, 900000000)
//   },
//   {
//     Name: 'CĐHA',
//     Single: randomIntFromInterval(100000000, 900000000),
//     Package: randomIntFromInterval(100000000, 900000000),
//     NotCalculate: randomIntFromInterval(100000000, 900000000),
//     Calculate: randomIntFromInterval(100000000, 900000000)
//   },
//   {
//     Name: 'TDCN',
//     Single: randomIntFromInterval(100000000, 900000000),
//     Package: randomIntFromInterval(100000000, 900000000),
//     NotCalculate: randomIntFromInterval(100000000, 900000000),
//     Calculate: randomIntFromInterval(100000000, 900000000)
//   },
//   {
//     Name: 'PTTM',
//     Single: randomIntFromInterval(100000000, 900000000),
//     Package: randomIntFromInterval(100000000, 900000000),
//     NotCalculate: randomIntFromInterval(100000000, 900000000),
//     Calculate: randomIntFromInterval(100000000, 900000000)
//   }
// ]

class PL01 extends BaseComponent {
  constructor(props) {
    super(props)
    this.defaultFilter = {
      StartAt: moment().subtract(1, 'months').format('YYYY-MM'),
      EndAt: moment().format('YYYY-MM')
    }
    this.state = {
      loading: true,
      sites: [],
      data: null,
      dataSpecialty: null,
      viewType: 0,
      query: {}
    };
    this.changeView = this.changeView.bind(this);
    this.handleSelectInputChange = this.handleSelectInputChange.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.applyCallback = this.applyCallback.bind(this)
  }
  getCurrentMonth() {
  }
  componentDidMount() {
    this.queryToState()
    this.getSite()
    setTimeout(() => {
      this.getData()
    }, 100)
  }
  componentDidUpdate(prevProps, prevState, snapshot) {
    console.log('componentDidUpdate', prevProps, prevState, snapshot)
    if (this.props.location !== prevProps.location) {
      this.getData()
    }
  }
  getSite() {
    new SiteService().all().then(res => {
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
  getData() {
    const { query } = this.state;
    if (!(query.Sites && query.StartAt && query.EndAt)) return ''
    this.dataByCategory()
    this.dataBySpecialty()
  }
  dataBySpecialty () {
    // Specialty
    new Pl01Service({...this.state.query, StartAt: '202001', EndAt: '202103'}).find('Specialty')
      .then(response => {
        let all = [...response]
        let sumedData = [
          {
            Name: 'Toàn viện',
            Single: all.map(item => item.Single).reduce((prev, next) => prev + next),
            Package: all.map(item => item.Package).reduce((prev, next) => prev + next),
            NotCalculate: all.map(item => item.NotCalculate).reduce((prev, next) => prev + next),
            Calculate: all.map(item => item.Calculate).reduce((prev, next) => prev + next),
            className: 'bold'
          }
        ]
        this.setState({
          dataSpecialty: [...sumedData, ...all].map(e => {
            var total = e.NotCalculate + e.Calculate
            e.total = total
            e.Name = e.Name || 'Không xác định'
            e.AllStr = (total).toLocaleString()
            return e
          })
        });
      })
  }
  dataByCategory () {
    // Specialty
    new Pl01Service({...this.state.query, StartAt: '202001', EndAt: '202103'}).find('Category')
      .then(response => {
        let all = [...response]
        let sumedData = [
          {
            Name: 'Toàn viện',
            Single: all.map(item => item.Single).reduce((prev, next) => prev + next),
            Package: all.map(item => item.Package).reduce((prev, next) => prev + next),
            NotCalculate: all.map(item => item.NotCalculate).reduce((prev, next) => prev + next),
            Calculate: all.map(item => item.Calculate).reduce((prev, next) => prev + next),
            className: 'bold'
          }
        ]
        this.setState({
          data: [...sumedData, ...all].map(e => {
            var total = e.NotCalculate + e.Calculate
            e.total = total
            e.Name = e.Name || 'Không xác định'
            e.AllStr = (total).toLocaleString()
            return e
          })
        });
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
    this.updateStateQuery('v', new Date().getTime())
    setTimeout(() => {
      this.updateUrlSearch()
    }, 100)
  }
  table() {
    const { data } = this.state;
    return (
      <>
        <table className="table table-bordered table-hover" size="sm">
          <thead>
            <tr className="thead-bg">
              <th>-/-</th>
              <th>Dịch vụ</th>
              <th>Nhóm lẻ</th>
              <th>Nhóm gói</th>
              <th>DT không xét thưởng EBITDA(13)</th>
              <th>DT xét thưởng EBITDA(14)</th>
              <th>Tổng doanh (13) + (14) + NT</th>
            </tr>
          </thead>
          <tbody>
            {data.map((e, index) => {
              return (
                <tr key={index} className={clsx({
                  fontBold: !index
                })}>
                  <td className="w1">{index + 1}</td>
                  <td>{e.Name || 'Không xác định'}</td>
                  <td>{e.Single ? e.Single.toLocaleString() : 0}</td>
                  <td>{e.Package ? e.Package.toLocaleString() : 0}</td>
                  <td>{e.NotCalculate ? e.NotCalculate.toLocaleString() : 0}</td>
                  <td>{e.Calculate ? e.Calculate.toLocaleString() : 0}</td>
                  <td>{e.total ? e.total.toLocaleString() : 0}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </>
    )
  }
  chart() {
    const { data } = this.state;
    let chartData = [...data]
    chartData.shift()
    const label = chartData.map(e => {
      return e.Name
    })
    // const value1 = chartData.map(e => {
    //   return e.Single
    // })
    // const value = chartData.map(e => {
    //   return e.Package
    // })
    const total = data[0].total ? data[0].total.toLocaleString() : 0
    const totalData = chartData.map(e => {
      return e.total
    })
    return (
      <>
        <CChartBar
          datasets={[
            {
              label: 'Tổng doanh thu: ' + total,
              backgroundColor: 'rgba(255,99,132,0.2)',
              borderColor: 'rgba(255,99,132,1)',
              borderWidth: 1,
              hoverBackgroundColor: 'rgba(255,99,132,0.4)',
              hoverBorderColor: 'rgba(255,99,132,1)',
              data: totalData,
            }
          ]}
          labels={label}
          options={{
            tooltips: {
              enabled: true,
              // custom: (tooltipModel) => {

              // },
              callbacks: {
                label: (tooltipItem) => {
                  return tooltipItem.yLabel ? tooltipItem.yLabel.toLocaleString() : 0;
                }
              }
            },
            // scales: {
            //   xAxes: [{
            //     stacked: true
            //   }],
            //   yAxes: [{
            //     stacked: true
            //   }]
            // }

          }}
        />
      </>
    )
  }
  withCategory() {
    const { viewType, query, data } = this.state;
    if (!(query.Sites && query.StartAt && query.EndAt && data)) return ''
    return (
      <CRow>
        <CCol xl={12}>
          <CCard>
            <CCardHeader>
              <h2 className="text-center">{i18n.t('TỔNG HỢP DOANH THU BỆNH VIỆN')}</h2>
            </CCardHeader>
            <CCardBody>
              <p>Tổng doanh thu theo nhóm dịch vụ chính</p>
              <p className="div-inline">Xem dạng biểu đồ: <CSwitch size='sm' variant={'opposite'} labelOn={'\u2713'} labelOff={'\u2715'} color={'primary'} onChange={this.changeView} /></p>
              {
                viewType ? this.chart() : this.table()
              }
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    )
  }
  withSpecialty() {
    const { dataSpecialty } = this.state;
    if (!dataSpecialty) return (<Loading />)
    return (
      <>
        <table className="table table-bordered table-hover" size="sm">
          <thead>
            <tr className="thead-bg">
              <th>-/-</th>
              <th>Khoa</th>
              <th>DT không xét thưởng EBITDA(13)</th>
              <th>DT xét thưởng EBITDA(14)</th>
              <th>Tổng doanh (13) + (14) + NT</th>
              <th>-/-</th>
            </tr>
          </thead>
          <tbody>
            {dataSpecialty.map((e, index) => {
              return (
                <tr key={index} className={clsx({
                  fontBold: !index
                })}>
                  <td className="w1">{index + 1}</td>
                  <td>{e.Name || 'Không xác định'}</td>
                  <td>{e.NotCalculate ? e.NotCalculate.toLocaleString() : 0}</td>
                  <td>{e.Calculate ? e.Calculate.toLocaleString() : 0}</td>
                  <td>{e.total ? e.total.toLocaleString() : 0}</td>
                  <td>Xem</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </>
    )
  }
  mainFilter() {
    const { sites, query } = this.state
    return (
      <CRow>
        <CCol xl={12}>
          <CCard>
            <CCardHeader>
              <CRow>
                <CCol xs="2">
                  <CFormGroup>
                    <CLabel htmlFor="appendedInputButton">Bệnh viện</CLabel>
                    <div className="controls">
                      <Select
                        options={sites}
                        // isMulti
                        name="Sites"
                        onChange={this.handleSelectInputChange}
                        defaultValue={sites.filter(e => (query.Sites && query.Sites === e.value))}
                      />
                    </div>
                  </CFormGroup>
                </CCol>
                <CCol xs="2">
                  <CFormGroup>
                    <CLabel htmlFor="appendedInputButton">Khoảng thời gian</CLabel>
                    <div className="controls">
                      <MonthPicker
                        applyCallback={this.applyCallback}
                        name="time"
                        defaultValue={{
                          start: query.StartAt,
                          end: query.EndAt,
                        }}
                      />
                    </div>
                  </CFormGroup>
                </CCol>
                <CCol xs="2">
                  <CFormGroup>
                    <CLabel htmlFor="appendedInputButton" className="hidden-elm">xxx</CLabel>
                    <div className="controls">
                      <CButtonGroup>
                        <CButton color="secondary" type="button" onClick={this.handleFilterSubmit.bind(this)}><VIcon size={'sm'} name='cilSearch' /> Lọc</CButton>
                      </CButtonGroup>
                    </div>
                  </CFormGroup>
                </CCol>
              </CRow>
            </CCardHeader>
          </CCard>
        </CCol>
      </CRow>
    )
  }
  render() {
    const { loading } = this.state;
    if (loading) return (<Loading />)
    return (
      <>
        {this.mainFilter()}
        {this.withCategory()}
        {this.withSpecialty()}
      </>
    )
  }
}
export default PL01