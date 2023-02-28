import React from "react"
import { BlockBtnForm } from "src/_components"
import { RoleService, GroupActionService } from 'src/_services'
import Hotkeys from 'react-hot-keys'
import { dynamicSort } from 'src/_helpers'
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
  CLink,
  CInput, CInputCheckbox
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { Loading } from 'src/_components'
import SimpleReactValidator from 'simple-react-validator'

class Form extends BaseComponent {
  constructor(props) {
    super(props);
    this.selsectedActionHandleChange = this.selsectedActionHandleChange.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.state = {
      Id: props.match.params.id,
      Role: null,
      Actions: [
      ],
      selectedActions: []
    }
    this.selectedAction = this.selectedAction.bind(this)
    this.selectedIsMenuAction = this.selectedIsMenuAction.bind(this)
    
    this.validator = new SimpleReactValidator({ autoForceUpdate: this })
  }
  componentDidMount() {
    this.init()
  }
  async init() {
    await this.getActions()
    this.getData()
  }
  componentDidUpdate(prevProps, prevState, snapshot) {
    console.log('componentDidUpdate', prevProps, prevState, snapshot)
  }
  selectedAction(event) {
    const { value, checked } = event.target;
    var Datas = []
    Datas = this.state.Actions.map(e => {
      if (value === e.Id) e.checked = checked
      return e
    })
    this.setState({
      Actions: Datas
    })
  }
  selectedIsMenuAction(event) {
    const { value, checked } = event.target;
    var Datas = []
    Datas = this.state.Actions.map(e => {
      if (value === e.Id) e.IsMenu = checked
      return e
    })
    this.setState({
      Actions: Datas
    })
  }
  save(keyName, e, handle) {
    console.log(keyName, handle)
    e && e.preventDefault()
    if (this.state.Role.IsDeleted) {
      this.inActiveConfirm()
    } else {
      this.submit()
    }
  }
  submit(isDeleted) {
    if (!this.validator.allValid()) {
      this.validator.showMessages()
      return
    }
    new RoleService().update(this.state.Id === 'new' ? '' : this.state.Id, { ...this.state.Role, GroupActions: this.state.Actions.filter(e => e.checked).map(e => e.Id) })
      .then(response => {
        this.alertSuccess()
        if (response.Id && this.state.Id === 'new') {
          setTimeout(() => {
            this.props.history.push(`/roles/${response.Id}`)
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
  getActions() {
    return new GroupActionService({ pageNumber: 1, PageSize: 9999 }).all().then(response => {
      this.setState({
        Actions: response.map(e => {
          e.id = e.Id
          e.label = `${e.GroupActionName}`
          return e
        }).sort(dynamicSort("Code"))
      })
    })
  }
  setSelectedActions(GroupActions) {
    var {Actions} = this.state
    this.setState({Actions: Actions.map(e => {
      e.checked = GroupActions.find(g => g.GroupActionCode === e.GroupActionCode)
      return e
    })})
  }
  getData() {
    if (this.state.Id !== 'new') {
      new RoleService().find(this.state.Id)
        .then(response => {
          this.setState({
            Role: response
          })
          this.setSelectedActions(response.GroupActions)
        }).catch(e => {
        })
    } else {
      this.setState({
        Role: {
          ViName: '',
          EnName: ''
        }
      })
    }
  }
  selsectedActionHandleChange(selectedActions) {
    this.setState({ selectedActions });
  }
  handleChange(event) {
    this.validator.showMessages()
    const { name, value, type, checked } = event.target;
    this.updateStateQuery(name, type === 'checkbox' ? checked : value)
  }
  updateStateQuery(name, value) {
    var Role = { ...this.state.Role }
    Role[name] = value
    this.setState({ Role })
  }
  render() {
    const { Actions, Role } = this.state;
    if (!Role) return (<Loading />)
    var grouped = Actions.map((e, index) => {
      e.index = index + 1
      e.key = e.ModuleName
      return e
    }).reduce(function (r, a) {
        r[a.key] = r[a.key] || [];
        r[a.key].push(a);
        return r;
    }, Object.create(null));
    console.log(grouped)
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
            <CCol lg={4}>
              <CCard>
                <CCardHeader>
                  Thông tin quyền
                  </CCardHeader>
                <CCardBody>
                  <CFormGroup row>
                    <CCol md="3">
                      <CLabel>Tên nhóm quyền</CLabel>
                    </CCol>
                    <CCol xs="12" md="9">
                      <CInput type="text" autoComplete="off" name="ViName" value={Role.ViName} onChange={this.handleChange} placeholder="Tên nhóm quyền" />

                      {/**********   This is where the magic happens     ***********/}
                      {this.validator.message('RoleViName', this.state.Role.ViName, 'required')}
                    </CCol>
                  </CFormGroup>
                </CCardBody>
              </CCard>
            </CCol>
            <CCol lg={8}>
              <CCard>
                <CCardHeader>
                  Thông tin nhóm quyền
                </CCardHeader>
                <CCardBody>
                  <CFormGroup row>
                    <CCol md="12">
                    <table className="table cd-table cd-table-bordered cd-table-bordered">
                      <thead className="thead-dark">
                        <tr>
                          <th scope="col">Module</th>
                          <th scope="col">Nhóm chức năng</th>
                          <th scope="col" className="nowrap text-center">Phân quyền</th>
                        </tr>
                      </thead>
                      <tbody>
                      {Object.keys(grouped).map(e => {
                        return <>
                          {grouped[e].map((item, indexx) => {
                            return <tr>
                              {indexx === 0 && <th className="vertical-align-middle" rowSpan={grouped[e].length}>{e}</th>}
                              <td>
                                {item.IsMenu ? <>{item.GroupActionName} <i className="fa fa-fw fa-bars" aria-hidden="true"></i></> : <CLink to={`/groupaction/${item.Id}`}>{item.GroupActionName}</CLink>}
                              </td>
                              <td className="text-center">
                                <CFormGroup variant="custom-checkbox" inline>
                                  <CInputCheckbox
                                    custom
                                    id={`IsPackageDrugConsum` + item.Id}
                                    name={`IsPackageDrugConsum` + item.Id}
                                    value={item.Id}
                                    checked={item.checked}
                                    onChange={this.selectedAction}
                                  />
                                  <CLabel variant="custom-checkbox" htmlFor={`IsPackageDrugConsum` + item.Id} ></CLabel>
                                </CFormGroup>
                              </td>
                            </tr>
                          })}
                        </>
                        })}
                      </tbody>
                    </table>
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
                <CButton onClick={this.save.bind(this)} className="float-right btn-block" type="submit" color="warning"><CIcon name="cil-scrubber" /> Lưu</CButton>
              </CCol>
            </CRow>
          </BlockBtnForm>
        </Hotkeys>
      </>
    );
  }
}
export default Form
