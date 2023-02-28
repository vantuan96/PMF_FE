import React from "react"
import MultiSelect from "@kenshooui/react-multi-select"
import { BlockBtnForm } from "src/_components"
import { RoleService, ActionService, GroupActionService } from 'src/_services'
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
  CInput,
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
    this.validator = new SimpleReactValidator({ autoForceUpdate: this })
  }
  componentDidMount() {
    this.init()
  }
  async init() {
    await this.getGroupActions()
    this.getData()
  }
  componentDidUpdate(prevProps, prevState, snapshot) {
    console.log('componentDidUpdate', prevProps, prevState, snapshot)
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
    new RoleService().update(this.state.Id === 'new' ? '' : this.state.Id, { ...this.state.Role, Actions: this.state.selectedActions.map(e => e.Id) })
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
    return new ActionService({ pageNumber: 1, PageSize: 9999 }).all().then(response => {
      this.setState({
        Actions: response.map(e => {
          e.id = e.Id
          e.label = `${e.Name}`
          return e
        }).sort(dynamicSort("Code"))
      })
    })
  }
  getGroupActions() {
    return new GroupActionService({ pageNumber: 1, PageSize: 9999}).all().then(response => {
      this.setState({
        Actions: response.map(e => {
          e.id = e.Id
          e.label = `${e.Name}`
          return e
        }).sort(dynamicSort("Code"))
      })
    })
  }
  setSelectedActions(actions) {
    var selectedActions = this.state.Actions.filter(e => actions.includes(e.Id)).map(e => {
      e.id = e.Id
      e.label = `${e.Name}`
      return e
    }).sort(dynamicSort("Code"))
    this.setState({
      selectedActions: selectedActions
    })
  }
  getData() {
    if (this.state.Id !== 'new') {
      new RoleService().find(this.state.Id)
        .then(response => {
          this.setState({
            Role: response
          })
          this.setSelectedActions(response.Actions)
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
    const { Actions, selectedActions, Role } = this.state;
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
                      <CLabel>Tên quyền</CLabel>
                    </CCol>
                    <CCol xs="12" md="9">
                      <CInput type="text" autoComplete="off" name="ViName" value={Role.ViName} onChange={this.handleChange} placeholder="Tên quyền" />

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
                  Quyền hạn
                </CCardHeader>
                <CCardBody>
                  <CFormGroup row>
                    <CCol md="12">
                      <table>

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
                <CButton onClick={this.save.bind(this)} className="float-right btn-block" type="submit" color="warning"><CIcon name="cil-scrubber" /> Save</CButton>
              </CCol>
            </CRow>
          </BlockBtnForm>
        </Hotkeys>

      </>
    );
  }
}
export default Form
