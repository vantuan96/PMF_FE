import React from "react";
import {
  CInputGroup,
  CButton,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CInput,
  CFormGroup,
  CLabel
} from "@coreui/react";
import { InputSelect } from "src/_components";
import { PackageGroup } from "src/_services";
import { Table } from "./Table";
import { dataToTree2 } from "src/_helpers/common"
export class PackageGroupSelect extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      datas: null,
      isOpen: false,
      selected: null,
      query: {
        Search: ''
      },
      flatData: [],
      reseting: false,

    };
    this.open = this.open.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
    this.handleSearchChange = this.handleSearchChange.bind(this);
    this.handleChangeInputForm = this.handleChangeInputForm.bind(this);
    this.firstCallback = this.firstCallback.bind(this);

  }
  async componentDidMount() {
    await this.getData()
    this.buildValue()
  }
  firstCallback () {
  }
  handleSearchChange(e) {
    const { name, value } = e.target;
    var query = { ...this.state.query }
    query[name] = value
    this.setState({ query })
  }
  handleSelect(selected) {
    if (!selected.value) selected.value = selected.Id
    this.setState({ selected })
    this.setModal()
    this.emitValue()
    this.reset()
  }
  open() {
    this.getDatas()
  }
  componentDidUpdate(prevProps) {
    if (prevProps.defaultValue !== this.props.defaultValue) {
      setTimeout(() => {
        // this.buildValue()
      }, 600)
    }
  }
  handleChangeInputForm(e) {
    const { flatData } = this.state
    this.setState({ selected: flatData.find(item => item.value === e.target.value)})
    this.emitValue()
  }
  emitValue() {
    setTimeout(() => {
      const { selected } = this.state
      if (this.props.onChange)
        this.props.onChange({
          target: {
            name: this.props.name,
            value: selected ? selected.Id : null
          }
        });
    }, 300)
  }
  buildValue() {
    const { defaultValue } = this.props
    if (defaultValue) {
      new PackageGroup().find(defaultValue)
        .then(response => {
          var selected = response
          selected.label = selected.Name + ' - ' + selected.Code
          selected.value = selected.Id
          this.setState({ selected })
        }).catch(e => {
        })
    }
  }
  setModal(isOpen) {
    this.setState({ isOpen })
  }
  getDatas() {
    new PackageGroup({ PageSize: 2000, Status: 1 }).all().then(resp => {
      this.setState({ datas: dataToTree2(resp.Results, this.props.currentNodeId) })
      setTimeout(() => {
        this.setModal(true)
      }, 200);
    })
  }
  async getData() {
    await new PackageGroup({ PageSize: 2000, Status: 1 }).all().then(resp => {
      this.setState({ flatData: resp.Results.map(e => {
        e.label = e.Code + ' - ' +  e.Name
        e.value = e.Id
        return e
      }) })
    })
  }
  reset () {
    this.setState({reseting: true})
    setTimeout(() => {
      this.setState({reseting: false})
    }, 100)
    
  }
  modal() {
    const { datas, isOpen, query, selected } = this.state
    return (<>
      <CModal
        show={isOpen}
        onClose={() => this.setModal()}
        size="xl"
        color="primary"
        closeOnBackdrop={false}
      >
        <CModalHeader closeButton>
          <CModalTitle>Chọn nhóm dịch vụ</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CFormGroup>
            <CLabel htmlFor="appendedInputButton"></CLabel>
            <div className="controls">
              <CInputGroup>
                <CInput autoComplete="off" name="Search" value={query.Search} placeholder="Nhập mã/ tên nhóm" size="16" type="text" onChange={this.handleSearchChange} />
              </CInputGroup>
            </div>
          </CFormGroup>
          {(datas && datas.length && isOpen) ? <Table allowSelectChil={this.props.allowSelectChil} selected={selected} type='select' query={query || {}} onChange={this.handleSelect} nodes={datas} /> : 'Không tìm thấy dữ liệu'}
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            onClick={() => this.setModal()}
          >Hủy</CButton>
        </CModalFooter>
      </CModal>
    </>)
  }
  render() {
    const { selected, flatData, reseting } = this.state
    if (!flatData) return ''
    return (<>
      <CInputGroup>
        <div className="flex-grow-1">
          {!reseting &&
            <InputSelect
              options={flatData}
              placeholder="Nhập mã/ tên nhóm hoặc nhấn ... để tìm kiếm"
              name="servicesSelected"
              defaultValue={selected ? selected.value : ''}
              onChange={this.handleChangeInputForm.bind(this)}
              isClearable={true}
            />
          }
        </div>
        <CButton onClick={() => this.open()} type="button" color="primary">...</CButton>
      </CInputGroup>
      {this.modal()}
    </>)
  }
}