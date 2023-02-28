import React from "react"
import {
  CCard,
  CCardBody,
  CFormGroup, CInputCheckbox, CLabel
} from '@coreui/react'
import { CurrencyInputText } from 'src/_components'
import { PolicyItem } from './PolicyItem'
export class PolicyForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      DrugConsum: {}
    }
    this.applyCallback = this.applyCallback.bind(this)
    this.drugConsumOnchange = this.drugConsumOnchange.bind(this)
  }
  componentDidMount() {
  }
  drugConsumOnchange (e) {
    const { value, name, checked } = e.target;
    var datas = this.props.Policy
    datas.forEach((item, index) => {
      if (name === 'IsLimitedDrugConsum') item.IsLimitedDrugConsum = checked
      if (name === 'LimitedDrugConsumAmount') item.LimitedDrugConsumAmount = value
      if (this.props.applyCallback) this.props.applyCallback('Policy', index, item)
    })
    setTimeout(() => {
      if (this.props.applyCallbackDrugConsumOnchange) this.props.applyCallbackDrugConsumOnchange()
    }, 200)
  }
  applyCallback (index, item) {
    if (this.props.applyCallback) this.props.applyCallback('Policy', index, item)
  }
  render() {
    var datas = this.props.Policy
    var {PackageInfo} = this.props
    console.log(this.props.rootData)
    // var isox = (this.props.rootData && this.props.rootData.Details.find(e => e.ServiceType === 2))
    return (
      <>
        <CCard>
          <CCardBody>
          <table className="table cd-table cd-table-bordered cd-table-bordered">
            <thead className="thead-dark">
              <tr>
                <th scope="col">Đối tượng</th>
                <th scope="col">Site cơ sở</th>
                <th scope="col">Mức giá cơ sở</th>
                <th scope="col">Giá gói (VNĐ)</th>
                <th scope="col" className="w1 nowrap">Thời gian áp dụng</th>
              </tr>
            </thead>
            <tbody>
              {datas.map((item, index) => {
                return <PolicyItem readOnly={this.props.readOnly} Policy={item} key={index} index={index} applyCallback={this.applyCallback}/>
              })}
            </tbody>
          </table>
          </CCardBody>
        </CCard>
        {(!PackageInfo.IsVaccinePackage && !PackageInfo.IsHaveServiceDrugConsum && PackageInfo.IsHaveInventory) &&
        <div className="d-flex align-items-center mb-3">
          <div>
          {this.props.readOnly ? <div>{datas[0].IsLimitedDrugConsum ? <i className="far fa-check-square" aria-hidden="true"></i> : <i className="far fa-square" aria-hidden="true"></i>} Giới hạn tiền thuốc và VTTH</div> :
            <CFormGroup variant="custom-checkbox">
                  <CInputCheckbox
                    custom
                    id={`IsLimitedDrugConsum`}
                    name={`IsLimitedDrugConsum`}
                    value={datas[0].IsLimitedDrugConsum}
                    checked={datas[0].IsLimitedDrugConsum}
                    onChange={this.drugConsumOnchange}
                  />
                <CLabel variant="custom-checkbox" htmlFor={`IsLimitedDrugConsum`}>Giới hạn tiền thuốc và VTTH</CLabel>
              </CFormGroup>
            }     
            </div>
            {datas[0].IsLimitedDrugConsum &&
            <div className="d-flex ml-4 align-items-center ">
              <b className="nowrap mr-2">Số tiền <i className="requ">*</i>: </b>
              <CurrencyInputText readonly={this.props.readOnly} name="LimitedDrugConsumAmount" value={datas[0].LimitedDrugConsumAmount} onChange={this.drugConsumOnchange} />
              <span className="nowrap ml-2">VNĐ</span>
            </div>
            }
        </div>
        }
      </>
    )
  }
}