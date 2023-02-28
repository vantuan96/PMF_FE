import React from "react"
import { ServiceService } from 'src/_services'
import Hotkeys from 'react-hot-keys'
import BaseComponent from 'src/_components/BaseComponent'
import {
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CFormGroup,
  CLabel,
  CRow,
  CInput,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CDataTable
} from '@coreui/react'
// import CIcon from '@coreui/icons-react'
import { Loading } from 'src/_components'
import moment from "moment-timezone"
import DateTimeRangeContainer from "react-advanced-datetimerange-picker"
import EditCategory from "./EditCategory"
let local = {
  format: process.env.REACT_APP_DATE_FORMAT,
  sundayFirst: false,
  fromDate: 'Từ ngày',
  toDate: 'Đến ngày',
  customRange: 'Tùy chọn'
}
class Form extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {
      Id: props.match.params.id,
      hasForm: false,
      rule: {
        start: moment(),
        end: moment(),
        ServiceId: props.match.params.id
      },
      rangerTime: '',
      allowEdit: false
    }
    this.applyCallback = this.applyCallback.bind(this);
  }
  openForm(status, item) {
    this.resetRuleForm()
    this.setState({ hasForm: status });
    if (item) {
      this.setState({ rangerTime: item.StartAt + ' ~ ' + item.EndAt });
      this.setState(prevState => {
        let rule = Object.assign(prevState.rule, item)
        rule.start = moment(rule.StartAt, process.env.REACT_APP_DATE_FORMAT)
        rule.end = moment(rule.EndAt, process.env.REACT_APP_DATE_FORMAT)
        return { rule }
      })
    }
  }
  resetRuleForm() {
    let now = new Date();
    let start = moment(
      new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
    );
    let end = moment(start).add(1, "days").subtract(1, "seconds");

    this.ranges = {
      "Ngày hôm nay": [start, end],
      "3 ngày": [start, moment(end).add(3, "days").subtract(1, "seconds")],
      "5 ngày": [start, moment(end).add(5, "days").subtract(1, "seconds")],
      "1 tuần": [start, moment(end).add(7, "days").subtract(1, "seconds")],
      "2 tuần": [start, moment(end).add(14, "days").subtract(1, "seconds")],
      "1 tháng": [start, moment(end).add(1, "months").subtract(1, "seconds")]
    }

    this.setState({ rangerTime: start.format(process.env.REACT_APP_DATE_FORMAT) + ' ~ ' + end.format(process.env.REACT_APP_DATE_FORMAT) });
    this.setState(prevState => {
      let rule = Object.assign({}, prevState.rule)
      rule.start = start
      rule.end = end
      delete rule.Id
      return { rule }
    })
  }
  componentDidMount() {
    this.init()
    this.resetRuleForm()
  }
  init() {
    this.getData()
  }
  // componentDidUpdate(prevProps, prevState, snapshot) {
  //   console.log('componentDidUpdate', prevProps, prevState, snapshot)
  // }
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
  save() {
    new ServiceService().update('Rule' + (this.state.rule.Id ? '/' + this.state.rule.Id : ''),
      {
        ...this.state.rule,
        StartAt: this.state.rule.start.format(process.env.REACT_APP_DATE_FORMAT),
        EndAt: this.state.rule.end.format(process.env.REACT_APP_DATE_FORMAT)
      })
      .then(() => {
        this.getData()
        this.openForm(false)
      }).catch(e => {
      })
  }
  enableEdit() {
    this.setState({ allowEdit: true });
  }
  getData() {
    new ServiceService().find(this.state.Id)
      .then(response => {
        this.setState({
          ServiceData: response
        })
      }).catch(e => {
      })
  }
  render() {
    const { ServiceData, hasForm, rangerTime } = this.state;
    if (!ServiceData) return (<Loading />)
    return (
      <>
        <Hotkeys
          allowRepeat="true"
          keyName="ctrl+s"
          onKeyDown={this.save.bind(this)}
          filter={() => {
            return true
          }}
        >
          <CRow>
            <CCol lg={5}>
              <CCard>
                <CCardHeader>
                  Thông dịch vụ
                  </CCardHeader>
                <CCardBody>
                  <CFormGroup row>
                    <CCol md="3">
                      <CLabel>Tên</CLabel>
                    </CCol>
                    <CCol xs="12" md="9">
                      {ServiceData.ViName}
                    </CCol>
                  </CFormGroup>
                  <CFormGroup row>
                    <CCol md="3">
                      <CLabel>Mã nội dung</CLabel>
                    </CCol>
                    <CCol xs="12" md="9">
                      {ServiceData.Code}
                    </CCol>
                  </CFormGroup>
                  <CFormGroup row>
                    <CCol md="3">
                      <CLabel>Nhóm</CLabel>
                    </CCol>
                    <CCol xs="12" md="9">
                      {ServiceData.Group.Code ? `${ServiceData.Group.ViName} - ${ServiceData.Group.Code}` : <CBadge color="warning">Chưa phân nhóm dịch vụ</CBadge>}
                    </CCol>
                  </CFormGroup>
                  <CFormGroup row>
                    <CCol md="3">
                      <CLabel>Loại dịch vụ</CLabel>
                    </CCol>
                    <CCol xs="12" md="9">
                      <EditCategory data={ServiceData} />
                    </CCol>
                  </CFormGroup>
                </CCardBody>
              </CCard>
            </CCol>
            <CCol lg={7}>
              <CCard>
                <CCardHeader>
                  Không tính doanh thu
                  </CCardHeader>
                <CCardBody>
                  <CFormGroup row>
                    <CCol md="12">
                      <CDataTable
                        items={ServiceData.Rules}
                        fields={[
                          {
                            key: 'Name',
                            label: 'Tên',
                          },
                          {
                            key: 'StartAt',
                            label: 'Bắt đầu ngày',
                          },
                          {
                            key: 'EndAt',
                            label: 'Kết thúc ngày',
                          },
                          {
                            key: 'show_details',
                            label: '',
                            _style: { width: '1%' },
                            sorter: false,
                            filter: false
                          }
                        ]}
                        hover
                        striped
                        bordered
                        scopedSlots={{
                          'show_details':
                            (item) => (
                              <td>
                                <CButton
                                  color="primary"
                                  shape="square"
                                  size="sm"
                                  onClick={() => this.openForm(true, item)}
                                >
                                  Sửa
                                </CButton>
                              </td>
                            )
                        }}
                      />
                    </CCol>
                  </CFormGroup>
                  {/* <CFormGroup row>
                      <CCol md="12">
                        <CButton onClick={() => this.openForm(true)} color="warning"><VIcon size={'sm'} name='cilUserPlus' /> Tạo mới</CButton>
                      </CCol>
                    </CFormGroup> */}
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
          <CModal
            show={hasForm}
            onClose={() => this.openForm(false)}
            color="primary"
          >
            <CModalHeader closeButton>
              <CModalTitle>Chọn thời gian không tính doanh thu cho dịch vụ</CModalTitle>
            </CModalHeader>
            <CModalBody>
              <div className="only-date">
                <DateTimeRangeContainer
                  ranges={this.ranges}
                  start={this.state.rule.start}
                  end={this.state.rule.end}
                  local={local}
                  applyCallback={this.applyCallback}
                  smartMode
                >
                  <CInput type="text" disabled name="rangerTime" value={rangerTime} placeholder="Chọn thời gian" />
                </DateTimeRangeContainer>
              </div>
            </CModalBody>
            <CModalFooter>
              <CButton color="primary" onClick={() => this.save()}>
                Lưu
                </CButton>
            </CModalFooter>
          </CModal>
        </Hotkeys>

      </>
    );
  }
}
export default Form
