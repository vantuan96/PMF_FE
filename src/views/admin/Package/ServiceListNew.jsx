import React from "react"
import BaseComponent from 'src/_components/BaseComponent'
import {
  CButton
} from '@coreui/react'
import {
  Loading,
} from 'src/_components'
import {ServiceItem} from './ServiceItem'
class ServiceList extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {
      Services: []
    }
    this.addNewService = this.addNewService.bind(this)
  }
  componentDidMount() {
  }
  applyCallback(name, value) {
  }
  addNewService() {
    const { Services } = this.state
    Services.push({})
    this.setState({Services})
  }
  btnNew() {
    if (this.props.readOnly) return ''
    return (
      <CButton type="button" color="primary" onClick={() => this.addNewService()}>
        Thêm
      </CButton>
    )
  }
  render() {
    const { isloading, Services } = this.state
    if (isloading) return (<Loading />)
    return (
      <>
      <table className="table cd-table cd-table-bordered cd-table-bordered">
        <thead className="thead-dark">
          <tr>
            <th width="1" scope="col">STT</th>
            <th scope="col">Mã - Tên dịch vụ</th>
            <th scope="col" width="1">Gói thuốc/ VTTH</th>
            <th scope="col" width="1" className="nowrap">Định mức</th>
            <th scope="col" width="1" className="nowrap">Dịch vụ thay thế</th>
            {this.props.readOnly ? null : <th width="1">-/-</th>}
          </tr>
        </thead>
        <tbody>
          {Services.length === 0 ? this.btnNew() :
            <>
              {Services.map((item, index) => {
                return <ServiceItem readOnly={this.props.readOnly} item={item} key={index} index={index} applyCallback={this.applyCallback}/>
              })}
              {this.btnNew()}
            </>
          }
        </tbody>
      </table>
      </>
    )
  }
}
export default ServiceList
