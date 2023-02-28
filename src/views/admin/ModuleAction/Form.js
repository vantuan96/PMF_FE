import React from "react"
import MultiSelect from "@kenshooui/react-multi-select"
import { BlockBtnForm } from "src/_components"
import { GroupActionService, ActionService, GroupActionMappingService, ModuleService } from 'src/_services'
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
import { Loading, InputSelect } from 'src/_components'
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
      selectedActions: [],
      Modules: []
    }
    this.validator = new SimpleReactValidator({ autoForceUpdate: this })
  }
  componentDidMount() {
    this.init()
  }
  async init() {
    await this.getActions()
    await this.getModules()
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
    new GroupActionMappingService().update((this.state.Id === 'new' ? '00000000-0000-0000-0000-000000000000' : this.state.Id), { ...this.state.Role, Actions: this.state.selectedActions.map(e => e.Id)})
      .then(response => {
        this.alertSuccess()
        this.props.history.push(`/groupaction/`)
      })
  }
  getModules () {
    return new ModuleService({ pageNumber: 1, PageSize: 9999, IsDisplay: 1 }).all().then(response => {
      this.setState({
        Modules: response.map(e => {
          e.value = e.Id
          e.label = `${e.Name}`
          return e
        }).sort(dynamicSort("Code"))
      })
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
      new GroupActionService().find(this.state.Id)
        .then(response => {
          response.Name = response.GroupActionName
          response.ModuleId = response.Module.Id
          this.setState({
            Role: response
          })
          this.setSelectedActions(response.ListAction.map(e => e.ActionId))
        }).catch(e => {
        })
    } else {
      this.setState({
        Role: {
          Name: '',
          EnName: '',
          ModuleId: ''
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
    const { Actions, selectedActions, Role, Modules } = this.state;
    if (!Role) return (<Loading />)
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
                  Thông tin nhóm quyền
                  </CCardHeader>
                <CCardBody>
                  <CFormGroup row>
                    <CCol md="3">
                      <CLabel>Tên nhóm quyền</CLabel>
                    </CCol>
                    <CCol xs="12" md="9">
                      <CInput type="text" autoComplete="off" name="Name" value={Role.Name} onChange={this.handleChange} placeholder="Tên quyền" />

                      {/**********   This is where the magic happens     ***********/}
                      {this.validator.message('RoleName', this.state.Role.Name, 'required')}
                    </CCol>
                  </CFormGroup>
                  <CFormGroup row>
                    <CCol md="3">
                      <CLabel>Thuộc chức năng</CLabel>
                    </CCol>
                    <CCol xs="12" md="9">
                      <InputSelect
                        name="ModuleId"
                        options={Modules}
                        defaultValue={Role.ModuleId}
                        applyCallback={this.handleChange}
                      />

                      {/**********   This is where the magic happens     ***********/}
                      {this.validator.message('ModuleId', this.state.Role.ModuleId, 'required')}
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
                      <MultiSelect
                        showSelectedItems={false}
                        items={Actions}
                        selectedItems={selectedActions}
                        onChange={this.selsectedActionHandleChange}
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

      </>
    );
  }
}
export default Form
