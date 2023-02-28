import React from "react"
import { confirmAlert } from 'react-confirm-alert'
import { NumerInput, ServiceInputSelect } from 'src/_components'
import {
  CFormGroup, CInputCheckbox, CLabel
} from '@coreui/react'
export class ServiceItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      item: {}
    }
    this.handleChange = this.handleChange.bind(this)

  }
  componentDidMount() {
    this.setValue()
  }
  setValue() {
    this.setState({ item: this.props.item || {} })
  }
  emitValue() {
    var { item } = this.state
    if (this.props.applyCallback) this.props.applyCallback(this.props.index, item)
  }
  confirm() {
    confirmAlert({
      title: '',
      message: 'Bạn có chắc chắn xóa dịch vụ này?',
      buttons: [
        {
          label: 'Có',
          onClick: () => this.remove()
        },
        {
          label: 'Không'
        }
      ]
    });
  }
  remove() {
    var { site } = this.state
    site.IsDeleted = true
    this.setState({ site })
    this.emitValue()
  }
  handleChange(e) {
    const { value, name, type, checked } = e.target;
    let valueUpdate = {}
    valueUpdate[name] = type === 'checkbox' ? checked : value
    this.setState(prevState => {
      let item = Object.assign({}, prevState.item)
      item = { ...item, ...valueUpdate }
      return { item }
    })
    setTimeout(() => {
      this.emitValue()
    }, 100);
  }
  render() {
    var { item } = this.props
    if (item.IsDeleted) return ''
    return (
      <tr className="tr-center">
        <th scope="row">{this.props.index + 1}</th>
        <td>
          <ServiceInputSelect
            name="ServiceId"
            onChange={this.handleChangeInputForm}
          />
        </td>
        <td>
          <CFormGroup variant="custom-checkbox" className="form-group mb-0">
            <CInputCheckbox custom id={this.props.index + '-chjeck'} />
            <CLabel variant="custom-checkbox" htmlFor={this.props.index + '-chjeck'}></CLabel>
          </CFormGroup>
        </td>
        <td>
          <NumerInput
            name="LimitQty"
            onChange={this.handleChangeInputForm}
            min={1}
            max={9999}
          />
        </td>
        <td>
          <ServiceInputSelect
            name="ReplaceService"
            isMulti={true}
            onChange={this.handleChangeInputForm}
          />
        </td>
        <td></td>
      </tr>
    )
  }
}
