import React from "react"
import {
  CCard,
  CCardBody,
  CButton
} from '@coreui/react'
import { SiteItem } from './SiteItem'
export class Sites extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ListSites: []
    }
    this.applyCallback = this.applyCallback.bind(this)
  }
  componentDidMount() {
    this.setValue()
  }
  applyCallback (index, item) {
    if (this.props.applyCallback) this.props.applyCallback('ListSites', index, item)
  }
  setValue() {
    this.setState({ ListSites: this.props.ListSites || [] })
  }
  create() {
    var { ListSites } = this.state
    ListSites.push({IsNew: true})
    this.setState({ ListSites })
  }
  btnNew() {
    if (this.props.readOnly) return ''
    return (
      <tr>
        <td colSpan="4">
          <CButton type="button" color="primary" onClick={() => this.create()}>
            Thêm
          </CButton>
        </td>
      </tr>
    )
  }
  render() {
    var { ListSites } = this.state
    var sitess = ListSites
    return (
      <CCard>
        <CCardBody>
          <div className="mb-3"><b>Phạm vi áp dụng:</b></div>
          <table className="table cd-table cd-table-bordered cd-table-bordered autoindex">
            <thead className="thead-dark">
              <tr>
                <th width="1" scope="col">STT</th>
                <th scope="col">Bệnh viện</th>
                <th scope="col" width="1" className="nowrap">Ngày hết hiệu lực</th>
                {this.props.readOnly ? <th scope="col">Ghi chú</th> : <th width="1">-/-</th>}
              </tr>
            </thead>
            <tbody>
              {sitess.length === 0 ? this.btnNew() :
                <>
                  {sitess.map((item, index) => {
                    return <SiteItem  existPatientReg={this.props.existPatientReg} rootData={this.props.rootData} readOnly={this.props.readOnly} site={item} key={index} index={index} applyCallback={this.applyCallback}/>
                  })}
                  {this.btnNew()}
                </>
              }
            </tbody>
          </table>
        </CCardBody>
      </CCard>
    )
  }
}