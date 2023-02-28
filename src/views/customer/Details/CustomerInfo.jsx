import React from 'react';
import BaseComponent from 'src/_components/BaseComponent'
import {
  CCard,
  CCardBody,
  CCardHeader
} from '@coreui/react'
import {
  Loading, CurrencyText
} from 'src/_components'
import { Gender, PersonalType } from 'src/_constants'
import { dateToString } from 'src/_helpers'

import { PatientService } from 'src/_services'
class CustomerInfo extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {
      customer: null,
      fullData: null
    };
  }
  componentDidMount() {
    this.getData()
  }
  getData () {
  	new PatientService().find('Package/' + this.props.match.params.id)
      .then(({model}) => {
        this.setState({customer: model.PatientModel})
        this.setState({fullData: model})
        if (this.props.onChange) this.props.onChange(model)
      })
  }
  render() {
  	const {customer, fullData} = this.state
    if (customer === null || fullData === null) return <Loading/>
  	return (<>
  		<CCard>
        <CCardHeader>
          <b>Thông tin khách hàng</b>
        </CCardHeader>
        <CCardBody>
          <table className="table table-noborder">
            <tbody>
              <tr>
                <th className="nowrap" width="40%">Họ và tên:</th>
                <td className="pl-2">{customer.FullName}</td>
              </tr>
              <tr>
                <th>PID:</th>
                <td className="pl-2">{customer.PID}</td>
              </tr>
              <tr>
                <th className="nowrap">Ngày sinh:</th>
                <td className="pl-2">{dateToString(customer.DateOfBirth)}</td>
              </tr>
              <tr>
                <th>Giới tính:</th>
                <td className="pl-2">{Gender[customer.Gender]}</td>
              </tr>
              <tr>
                <th>SĐT:</th>
                <td className="pl-2">{customer.Mobile}</td>
              </tr>
              <tr>
                <th>Địa chỉ:</th>
                <td className="pl-2">{customer.Address}</td>
              </tr>
            </tbody>
          </table>
        </CCardBody>
      </CCard>
      <CCard>
        <CCardHeader>
          <b>Thông tin gói</b>
        </CCardHeader>
        <CCardBody>
          <table className="table table-noborder">
            <tbody>
              <tr>
                <th className="nowrap" width="40%">Đối tượng:</th>
                <td className="pl-2">{(PersonalType.find(e => e.value === ("" + fullData.PersonalType)) || {}).label}</td>
              </tr>
              <tr>
                <th>Nơi kích hoạt gói:</th>
                <td className="pl-2">{fullData.SiteCode} - {fullData.SiteName}</td>
              </tr>
              <tr>
                <th className="">Thời gian áp dụng:</th>
                <td className="pl-2">{fullData.StartAt} ~ {fullData.EndAt}</td>
              </tr>
              <tr>
                <th>Giá gói:</th>
                <td className="pl-2"><div className="float-left nowrap"><CurrencyText value={fullData.Amount} unit="VNĐ"/> </div></td>
              </tr>
              {fullData.IsMaternityPackage &&
                <tr>
                  <th>Ngày dự sinh:</th><td className="pl-2"> {fullData.EstimateBornDate}</td>
                </tr>
              }
              {/* <tr>
                <th>Thuốc & VTTH:</th>
                <td className="pl-2">
                  {fullData.IsLimitedDrugConsum ? 'Theo định mức' : 'Không theo định mức'}
                </td>
              </tr> */}
              {fullData.IsDiscount &&
                <>
                  <tr>
                    <th>Mức giảm giá, chiết khấu:</th>
                    <td className="pl-2">
                      {fullData.DiscountType === 1 ?
                        <>{fullData.DiscountAmount} %</>
                        :
                        <><div className="float-left nowrap"><CurrencyText value={fullData.DiscountAmount} unit="VNĐ"/></div></>
                      }
                    </td>
                  </tr>
                  <tr>
                    <th>Giá gói sau giảm:</th>
                    <td className="pl-2">
                      <div className="float-left nowrap"><CurrencyText noValue={'0'} value={fullData.NetAmount} unit="VNĐ"/></div>
                    </td>
                  </tr>
                  <tr>
                    <th>Lý do giảm giá:</th>
                    <td className="pl-2">
                      {fullData.DiscountNote}
                    </td>
                  </tr>
                </>
              }
            </tbody>
          </table>
        </CCardBody>
      </CCard>
  	</>)
  }
}
export default CustomerInfo