import React from "react";
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CInput,
  CFormGroup,
  CLabel,
  CButton,
  CInputGroup,
  CForm,
  CSwitch
} from "@coreui/react";
import { VIcon } from "src/_components";
import { PackageGroup } from "src/_services";
import {dataToTree2} from "src/_helpers/common"
import BaseComponent from "src/_components/BaseComponent";
import { Table } from "./Table";
import { confirmAlert } from 'react-confirm-alert'
import {
  hasPermissions
} from 'src/_helpers'
class Roles extends BaseComponent {
  constructor(props) {
    super(props);
    this.defaultFilter = {
      Search: "",
      PageSize: 200,
      Status: false
    };
    this.state = {
      datas: [],
      pages: 1,
      query: this.defaultFilter
    };
    this.handleChange = this.handleChange.bind(this);
    this.applyCallbackAction = this.applyCallbackAction.bind(this);
  }
  applyCallbackAction (item, action) {
    console.log(action, item)
    if (action === 'delete') {
      this.removeConfirm(item)
    }
  }
  removeConfirm (item) {
    confirmAlert({
      title: 'Xác nhận xóa?',
      message: 'Bạn có chắc xóa nhóm dịch vụ ' + item.Name,
      buttons: [
        {
          label: 'Đồng ý',
          onClick: () => {
            new PackageGroup().update('/Delete/', {Ids: [item.Id]})
              .then(() => {
                this.alertSuccess()
                this.props.history.push(`/admin/PackageGroup/`)
              }).catch(e => {
              })
          }
        },
        {
          label: 'Hủy'
        }
      ]
    });
  }
  handleChange(e) {
    const { name, value, checked } = e.target;
    var query = { ...this.state.query }
    query[name] = name === 'Status' ? checked : value
    this.setState({ query })
    if (name === 'Status') {
      this.getData()
    }
  }
  updateStateQuery(name, value) {
  }
  componentDidMount() {
    this.getData();
  }
  getData() {
    setTimeout(() => {
      new PackageGroup({PageSize: 2000, Status: this.state.query.Status ? -1 : 1}).all().then(response => {
        this.setState({ datas: dataToTree2(response.Results) })
      });
    }, 100);
  }
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.location !== prevProps.location) {
      this.getData();
    }
  }
  render() {
    const { query, datas } = this.state;
    return (
      <CRow>
        <CCol xl={12}>
          <CCard>
            <CCardHeader>
              <CForm onSubmit={this.handleFilterSubmit.bind(this)}>
                <CRow>
                  <CCol xs="4">
                    <CFormGroup>
                      <CLabel htmlFor="appendedInputButton">Mã - Tên nhóm</CLabel>
                      <div className="controls">
                        <CInputGroup>
                          <CInput
                            maxLength="250"
                            autoComplete="off"
                            name="Search"
                            value={query.Search}
                            placeholder="Nhập mã - tên nhóm"
                            type="text"
                            onChange={this.handleChange}
                          />
                        </CInputGroup>
                      </div>
                    </CFormGroup>
                  </CCol>
                  <CCol xs="5">
                    <CFormGroup>
                      <CLabel htmlFor="appendedInputButton">Xem tất cả trạng thái</CLabel>
                      <div className="controls">
                        <CSwitch
                          name="Status"
                          checked={query.Status}
                          className="mr-1"
                          color="primary"
                          onChange={this.handleChange}
                          size={'sm'}
                        />
                      </div>
                    </CFormGroup>
                  </CCol>
                  <CCol xs="3">
                    {hasPermissions(['ADMINPACKAGEGROUP_CREATEPACKAGEGROUPAPI']) && 
                      <CFormGroup>
                        <CLabel htmlFor="appendedInputButton" className="hidden-elm">xxx</CLabel>
                        <div className="controls text-right">
                          <CButton color="warning" to="/admin/PackageGroup/new">
                            <VIcon size={"sm"} name="cilUserPlus" /> Tạo mới
                          </CButton>
                        </div>
                      </CFormGroup>
                    }
                  </CCol>
                </CRow>
              </CForm>
            </CCardHeader>
            <CCardBody>
            {(datas && datas.length) ? <Table applyCallbackAction={this.applyCallbackAction} query={query || {}} nodes={datas} /> : 'Không tìm thấy dữ liệu'}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    );
  }
}
export default Roles;
