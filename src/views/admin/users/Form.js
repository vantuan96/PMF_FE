import React from "react"
import MultiSelect from "@kenshooui/react-multi-select"
import { BlockBtnForm } from "src/_components"
import Hotkeys from 'react-hot-keys'
import { SiteService, RoleService, UserService } from 'src/_services'

import BaseComponent from 'src/_components/BaseComponent'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CFormGroup,
  CLabel,
  CRow,
  CSwitch,
  CInput,
  CInputGroupAppend,
  CInputGroup,
  CForm
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { Loading, VUsername } from 'src/_components'
import { confirmAlert } from 'react-confirm-alert'
import Select from 'react-select'

class User extends BaseComponent {
  constructor(props) {
    super(props);
    this.selsectedRoleHandleChange = this.selsectedRoleHandleChange.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.findByAd = this.findByAd.bind(this)
    this.state = {
      Id: props.match.params.id,
      User: null,
      Roles: [
      ],
      selectedRoles: [],
      sites: []
    };
    this.handleSelectInputChange = this.handleSelectInputChange.bind(this)

  }
  componentDidMount() {
    this.init()
  }
  async init() {
    await this.getRoles()
    await this.getSite()
    this.getData()
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
    });
  }
  componentDidUpdate(prevProps, prevState, snapshot) {
    console.log('componentDidUpdate', prevProps, prevState, snapshot)
  }
  handleSelectInputChange(value, input) {
    this.setState(prevState => {
      let User = Object.assign({}, prevState.User)
      User[input.name] = value.map(e => e.Id)
      return { User }
    })
  }
  save(keyName, e, handle) {
    console.log(keyName, handle)
    e && e.preventDefault()
    if (this.state.User.IsDeleted) {
      this.inActiveConfirm()
    } else {
      this.submit()
    }
  }
  submit (isDeleted) {
    new UserService().update(this.state.Id === 'new' ? '' : this.state.Id, { ...this.state.User, Roles: this.state.selectedRoles.map(e => e.Id) })
      .then(response => {
        this.alertSuccess()
        if (response.Id && this.state.Id === 'new') {
          setTimeout(() => {
            this.props.history.push(`/users/${response.Id}`)
          }, 1500)
          this.setState({ Id: response.Id })
          this.getData()
        } else if (isDeleted) {
          setTimeout(() => {
            this.props.history.goBack()
          }, 1500)
        }
      })
  }
  getRoles() {
    return new RoleService({pageNumber: 1, PageSize: 9999}).all().then(response => {
      this.setState({
        Roles: response.Results.map(e => {
          e.id = e.Id
          e.label = e.ViName
          return e
        })
      })
    })
  }
  setSelectedRoles(roles) {
    var selectedRoles = this.state.Roles.filter(e => roles.includes(e.Id)).map(e => {
      e.id = e.Id
      e.label = e.ViName
      return e
    })
    this.setState({
      selectedRoles: selectedRoles
    })
  }
  getData() {
    if (this.state.Id !== 'new') {
      new UserService().find(this.state.Id)
        .then(response => {
          this.setState({
            User: response
          })
          this.setSelectedRoles(response.Roles)
        }).catch(e => {
        })
    } else {
      this.setState({
        User: {}
      })
    }
  }
  selsectedRoleHandleChange(selectedRoles) {
    this.setState({ selectedRoles });
  }
  handleChange(event) {
    const { name, value, type, checked } = event.target;
    this.updateStateQuery(name, type === 'checkbox' ? checked : value)
  }
  updateStateQuery(name, value) {
    var User = { ...this.state.User }
    User[name] = value
    this.setState({ User })
  }
  findByAd(e) {
    if (e) {
      e.preventDefault()
    }
    new UserService({ ad: this.state.User.Search }).find('ad')
      .then(response => {
        this.setState({
          User: {
            Username: this.state.User.Search,
            IsAdminUser: false,
            IsDeleted: false,
            Mobile: '',
            Department: '',
            Title: '',
            Positions: [],
            Roles: [],
            ...response
          }
        })
      })
  }
  inActiveConfirm() {
    confirmAlert({
      message: 'Bạn có chắc chắn muốn khóa tài này không?',
      buttons: [
        {
          label: 'Không'
        },
        {
          label: 'Có',
          onClick: () => this.submit(true)
        }
      ]
    });
  }
  inActive() {
    new UserService().destroy(this.state.Id)
      .then((response) => {
        this.alertSuccess(response.ViMessage)
        setTimeout(() => {
          this.props.history.goBack()
        }, 1500)
      })
  }
  render() {
    const { Roles, selectedRoles, User, sites } = this.state;
    if (!User) return (<Loading />)
    return (
      <>
        {(User.Username)
          ?
          <Hotkeys
            allowRepeat="true"
            keyName="ctrl+s"
            onKeyDown={this.save.bind(this)}
            filter={() => {
              return true
            }}
          >
            <CRow>
              <CCol lg={4}>
                <CCard>
                  <CCardHeader>
                    Thông tin người dùng
                  </CCardHeader>
                  <CCardBody>
                    <CFormGroup row>
                      <CCol md="3">
                        <CLabel>Username(AD)</CLabel>
                      </CCol>
                      <CCol xs="12" md="9">
                        <div className="form-control-static">{User.Id ? <VUsername>{User.Username}</VUsername> : User.Username}</div>
                      </CCol>
                    </CFormGroup>
                    <CFormGroup row>
                      <CCol md="3">
                        <CLabel>Họ tên</CLabel>
                      </CCol>
                      <CCol xs="12" md="9">
                        <p className="form-control-static">{User.Fullname}</p>
                      </CCol>
                    </CFormGroup>
                    <CFormGroup row>
                      <CCol md="3">
                        <CLabel>Chức vụ</CLabel>
                      </CCol>
                      <CCol xs="12" md="9">
                        <p className="form-control-static">{User.Title}</p>
                      </CCol>
                    </CFormGroup>
                    <CFormGroup row>
                      <CCol md="3">
                        <CLabel>Điện thoại</CLabel>
                      </CCol>
                      <CCol xs="12" md="9">
                        <p className="form-control-static">{User.Mobile}</p>
                      </CCol>
                    </CFormGroup>
                    
                    <CFormGroup row>
                      <CCol md="3">
                        <CLabel>Khoa phòng</CLabel>
                      </CCol>
                      <CCol xs="12" md="9">
                        <p className="form-control-static">{User.Department}</p>
                      </CCol>
                    </CFormGroup>
                  </CCardBody>
                </CCard>
              </CCol>
              <CCol lg={8}>
                <CCard>
                  <CCardHeader>
                    Quyền hạn
                  </CCardHeader>
                  <CCardBody>
                    {/* <CFormGroup row>
                      <CCol tag="label" md="2" className="col-form-label">
                        Admin
                      </CCol>
                      <CCol md="10">
                        <CSwitch
                          className="mr-1"
                          color="primary"
                          checked={User.IsAdminUser}
                          name="IsAdminUser"
                          onChange={this.handleChange}
                        />
                      </CCol>
                    </CFormGroup> */}
                    <CFormGroup row>
                      <CCol tag="label" className="col-form-label" md="12">
                        Phân quyền
                      </CCol>
                      <CCol md="12">
                        <MultiSelect
                          items={Roles}
                          selectedItems={selectedRoles}
                          onChange={this.selsectedRoleHandleChange}
                        />
                      </CCol>
                    </CFormGroup>
                    <CFormGroup row>
                      <CCol tag="label" md="2" className="col-form-label">
                        Khóa tài khoản
                      </CCol>
                      <CCol md="10">
                        <CSwitch
                          name="IsDeleted"
                          checked={User.IsDeleted}
                          className="mr-1"
                          color="danger"
                          onChange={this.handleChange}
                        />
                      </CCol>
                    </CFormGroup>
                  </CCardBody>
                </CCard>
              </CCol>
            </CRow>
            <BlockBtnForm>
              <CRow>
                <CCol md="2">
                  {/* <CButton onClick={this.inActiveConfirm.bind(this)} className="float-right btn-block" type="submit" color="danger"><CIcon name="cil-scrubber" /> Delete</CButton> */}
                </CCol>
                <CCol md="7" className="right">
                </CCol>
                <CCol md="3" className="right">
                  <CButton onClick={this.save.bind(this)} className="float-right btn-block" type="submit" color="warning"><CIcon name="cil-scrubber" /> Save</CButton>
                </CCol>
              </CRow>
            </BlockBtnForm>
          </Hotkeys>
          :
          <CRow>
            <CCol lg={4}></CCol>
            <CCol lg={4}>
              <CCard accentColor="primary">
                <CCardHeader>
                  Tạo mới người dùng
                </CCardHeader>
                <CCardBody>
                  <CForm className="form-horizontal" onSubmit={this.findByAd}>
                    <CFormGroup>
                      <CInputGroup>
                        <CInput type="text" name="Search" onChange={this.handleChange} placeholder="AD" />
                        <CInputGroupAppend>
                          <CButton type="button" color="primary" onClick={this.findByAd}>Search</CButton>
                        </CInputGroupAppend>
                      </CInputGroup>
                    </CFormGroup>
                  </CForm>
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        }
      </>
    );
  }
}
export default User
