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
  CButtonGroup
} from '@coreui/react'
import { VIcon } from 'src/_components'
import { ConfigRevenuePercentService } from 'src/_services'
import BaseComponent from 'src/_components/BaseComponent'
import moment from "moment-timezone"
import { Loading } from 'src/_components'
class ConfigRevenuePercent extends BaseComponent {
  constructor(props) {
    super(props);
    this.defaultFilter = {
      Search: '',
      ServiceCode: ''
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
      rule: {
        start: moment(),
        end: moment(),
        ServiceId: props.match.params.id
      },
      rangerTime: '',
      forAll: true,
      reviewPage: 1,
      reviewPages: 1
    };

    this.handleChange = this.handleChange.bind(this)
  }
  getData() {
    this.queryToState()
    setTimeout(() => {
      new ConfigRevenuePercentService(this.state.query).all()
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
              e.Group = `${e.GroupViName} - ${e.GroupCode}`
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
      this.getData()
    }
  }
  componentDidMount() {
    console.log('componentDidMount')
    this.getData()
  }
  render() {
    const {
      Results,
      query,
      pages
    } = this.state
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
                        <CLabel htmlFor="appendedInputButton">Tên</CLabel>
                        <div className="controls">
                          <CInput name="Search" value={query.Search} placeholder="Type to search" size="16" type="text" onChange={this.handleChange} />
                        </div>
                      </CFormGroup>
                    </CCol>
                    <CCol xs="2">
                      <CFormGroup>
                        <CLabel htmlFor="appendedInputButton">Mã nội dung</CLabel>
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
                            <CButton color="warning" to="/config-revenue-percent">Xóa</CButton>
                          </CButtonGroup>
                        </div>
                      </CFormGroup>
                    </CCol>
                    <CCol>
                      <CFormGroup className="text-right">
                        <CLabel htmlFor="appendedInputButton" className="hidden-elm">xxx</CLabel>
                        <div className="controls">
                          <CButton color="info" to="/config-revenue-percent/new">Tạo mới</CButton>
                        </div>
                      </CFormGroup>
                    </CCol>
                  </CRow>
                </CForm>
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
                    { key: 'Name', label: 'Tên', _classes: 'font-weight-bold', },
                    // { key: 'StartAt', label: 'Ngày bắt đầu', _classes: 'font-weight-bold', },
                    // { key: 'EndAt', label: 'Ngày hết hạn', _classes: 'font-weight-bold', },
                    {
                      key: 'time',
                      label: 'Hiệu lực',
                      sorter: false,
                      filter: false
                    },
                    {
                      key: 'detailsx',
                      label: 'Tỷ lệ phân bổ  (BS chỉ định/ BS thực thiện)',
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
                  striped
                  bordered
                  columnHeaderSlot={{
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
                          {item.StartAt || 'N/A'} - {item.EndAt || 'N/A'}
                        </td>
                      ),
                    'show_details':
                      (item) => (
                        <td>
                          <CButton
                            color="primary"
                            size="vsm"
                            onClick={() => this.props.history.push(`/config-revenue-percent/${item.Id}`)}
                          >
                            Xem
                          </CButton>
                        </td>
                      ),
                    'detailsx':
                      (item) => (
                        <td>
                          <div>Theo gói {item.ChargePackagePercent * 100} / {item.OperationPackagePercent * 100}</div>
                          <div>DV lẻ {item.ChargePercent * 100} / {item.OperationPercent * 100}</div>
                          <div className="text-warning">{item.IsHealthCheck && 'Là gói HealthCheck'}</div>
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
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </>
    )
  }
}
export default ConfigRevenuePercent