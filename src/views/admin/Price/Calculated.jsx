import React from "react"
import {
  CCard,
  CCardBody,
  CCardHeader,
  CButton,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
} from '@coreui/react'
import { PricePolicy } from "src/_services";
import { confirmAlert } from 'react-confirm-alert'
import {
  CurrencyText3,
  CurrencyInputText
} from 'src/_components'
import {
  cloneObj
} from 'src/_helpers'

export class Calculated extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      datas: [],
      editItem: null,
      loading: true,
      totalRow: {},
      priceNull: []
    }
    this.applyCallback = this.applyCallback.bind(this)
    this.handleEditForm = this.handleEditForm.bind(this)

    this.calculate = this.calculate.bind(this)
  }
  componentDidMount() {
    this.buildValue()
  }
  componentDidUpdate(prevProps) {
  }
  buildValue() {
    this.setState({ datas: (this.props.formData.Details || []).filter(e => e.ServiceType) })
    this.setState({ totalRow: (this.props.formData.Details || []).find(e => !e.ServiceType) })
    this.reloadElm()
  }
  applyCallback(index, item) {
    if (this.props.applyCallback) this.props.applyCallback('Details', index, item)
  }
  handleEditForm(e) {
    const { value, name, type, checked } = e.target;
    let valueUpdate = {}
    valueUpdate[name] = type === 'checkbox' ? checked : value
    this.setState(prevState => {
      let editItem = Object.assign({}, prevState.editItem)
      editItem.item = { ...editItem.item, ...valueUpdate }
      return { editItem }
    })
  }
  sendError() {
    var { formData } = this.props
    var { Policy } = formData
    Policy.forEach((item, index) => {
      item.error = true
      if (!item.SiteBaseCode || !item.ChargeType || !item.Amount) this.props.applyCallback('Policy', index, item)
    })
  }
  validatePolicy() {
    var { formData } = this.props
    var { Policy } = formData
    var err = Policy.find(e => !e.SiteBaseCode || !e.ChargeType || !e.Amount)
    if (err) {
      confirmAlert({
        title: 'Lỗi',
        message: 'Vui lòng nhập đầy đủ thông tin',
        buttons: [
          {
            label: 'Đồng ý',
          }
        ]
      })
      this.sendError()
      return false
    }
    return true
  }
  validatePrice (data) {
    console.log(data)
    var priceNull = data.filter(e => {
      return !(e.ServiceType === 2 && !e.IsPackageDrugConsum) && e.Service && e.BasePrice === null
    })
    console.log(priceNull)
    if (priceNull.length > 0) {
      var code = priceNull.map(e => {
        return e.Service.Code
      }).join(', ')
      confirmAlert({
        title: 'Lỗi',
        message: `Không thể thiết lập giá cho gói này do có dịch vụ chưa được thiết lập giá trên OH (${code})`,
        buttons: [
          {
            label: 'Đóng',
          }
        ]
      })
    }
    
    return priceNull.length > 0
  }
  calculate() {
    if (!this.validatePolicy()) return false
    var { formData } = this.props
    var { Policy } = formData

    var data = {
      chargetypecode: Policy[0].ChargeType,
      pkgAmount: Policy[0].Amount,
      chargetypecode_fn: Policy[1].ChargeType,
      pkgAmount_fn: Policy[1].Amount,
      packageId: formData.PackageId,
      isLimitedDrugConsum: Policy[0].IsLimitedDrugConsum,
      limitedDrugConsumAmount: Policy[0].LimitedDrugConsumAmount
    }
    new PricePolicy().calculate(data).then(calculated => {
      if (calculated.entities) {
        var isError = this.validatePrice(calculated.entities)
        if (!isError) {
          this.setState({ datas: calculated.entities.filter(e => e.ServiceType) })
            this.applyCallback(0, null)
            calculated.entities.forEach((item, index) => {
              this.applyCallback(index, item)
              if (item.ServiceType) {
              } else {
                this.setState({totalRow: item})
              }
            })
        }
      }
    }).catch(e => {
      console.log(e)
    })
  }
  calculateDetail (index, item) {
    var { formData } = this.props
    var dataSubmit = {...formData}
    item.PkgPrice = Number(item.PkgPrice || '0')
    item.PkgPriceForeign = Number(item.PkgPriceForeign || '0')
    dataSubmit.Details[index] = item
    new PricePolicy().calculateDetail(dataSubmit).then(calculated => {
      if (calculated.entities) {
        this.setState({ datas: calculated.entities.filter(e => e.ServiceType) })
        this.applyCallback(0, null)
        calculated.entities.forEach((item ,index) => {
          this.applyCallback(index, item)
          if (item.ServiceType) {
          } else {
            this.setState({totalRow: item})
          }
        })
      }
      setTimeout(() => {
        this.editMode()
        // this.buildValue()
        this.reloadElm()
      }, 100);
    }).catch(e => {
      console.log(e)
    })
  }
  apply () {
    var { editItem } = this.state
    this.calculateDetail(editItem.index, editItem.item)
  }
  editMode(item, index) {
    if (item) {
      var it = cloneObj(item)
      var editItem = {
        item: it, index
      }
      this.setState({ editItem })
    } else {
      this.setState({ editItem: null })
    }
  }
  reloadElm () {
    this.setState({loading: true})
    setTimeout(() => {
      this.setState({loading: false})
    }, 200)
  }
  errorModal () {
    var { priceNull } = this.state
    if (!priceNull) return ''
    return (<>
      <CModal
        show={priceNull.length > 0}
        onClose={() => this.hideErrorModal()}
        color="primary"
        size={'xl'}
      >
        <CModalHeader closeButton>
          <CModalTitle className="text-center">
            Không thể thiết lập giá cho gói này do có dịch vụ chưa được thiết lập giá trên OH
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          {/* {priceNull.map(e => {
            <p>{e.Service.Code} - </p>
          })} */}
        </CModalBody>
        <CModalFooter>
          <CButton type="button" color="secondary" onClick={() => this.hideErrorModal()}>
            Đóng
          </CButton>
        </CModalFooter>
      </CModal>
    </>)
  }
  hideErrorModal () {
    this.setState({priceNull: []})
  }
  modal() {
    var { editItem } = this.state
    if (!editItem) return ''
    return (<>
      <CModal
        show={editItem != null}
        onClose={() => this.editMode()}
        color="primary"
        size={'xl'}
      >
        <CModalHeader closeButton>
          <CModalTitle className="text-center">
            SỬA GIÁ DỊCH VỤ TRONG GÓI
            </CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p className="text-right"><i>(<b>Đơn vị tính giá:</b> VNĐ)</i></p>
          <table className="table table-hover">
            <thead className="thead-dark">
              <tr>
                <th rowSpan="2">Mã - Tên dịch vụ</th>
                <th rowSpan="2">Định mức</th>
                <th colSpan="4" className="text-center">Người Việt Nam</th>
                <th colSpan="4" className="text-center">Người nước ngoài</th>
              </tr>
              <tr>
                <th>Đơn giá cơ sở</th>
                <th>Thành tiền cơ sở</th>
                <th>Đơn giá trong gói</th>
                <th>Thành tiền trong gói</th>
                <th>Đơn giá cơ sở</th>
                <th>Thành tiền cơ sở</th>
                <th>Đơn giá trong gói</th>
                <th>Thành tiền trong gói</th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover-tr">
                <td>{editItem.item.Service.Code} - {editItem.item.Service.ViName}</td>
                <td>{editItem.item.Qty}</td>
                <td><CurrencyText3 value={editItem.item.BasePrice} /></td>
                <td><CurrencyText3 value={editItem.item.BaseAmount} /></td>
                <td><CurrencyInputText name="PkgPrice" value={editItem.item.PkgPrice} onChange={this.handleEditForm} /></td>
                <td><CurrencyText3 value={editItem.item.PkgAmount} /></td>
                <td><CurrencyText3 value={editItem.item.BasePriceForeign} /></td>
                <td><CurrencyText3 value={editItem.item.BaseAmountForeign} /></td>
                <td><CurrencyInputText name="PkgPriceForeign" value={editItem.item.PkgPriceForeign} onChange={this.handleEditForm} /></td>
                <td><CurrencyText3 value={editItem.item.PkgAmountForeign} /></td>
              </tr>
            </tbody>
          </table>
        </CModalBody>
        <CModalFooter>
          <CButton type="button" color="secondary" onClick={() => this.editMode()}>
            Hủy
          </CButton>
          <CButton type="button" color="primary" onClick={() => this.apply()}>
            Đồng ý
          </CButton>
        </CModalFooter>
      </CModal>
    </>)
  }
  total (key) {
    var { totalRow } = this.state
    if (!totalRow) return ''
    return <CurrencyText3 value={totalRow[key] || 0} />
  }
  render() {
    var { datas, loading } = this.state
    var { PackageInfo } = this.props
    if (loading) return ''
    return (
      <CCard>
        <CCardHeader>
          <div className="d-flex justify-content-between align-items-center"><b>Chi tiết giá gói:</b>
          {!this.props.readOnly &&
            <CButton onClick={this.calculate.bind(this)} className="float-right" type="button" color="info">Tính giá</CButton>
          }
          </div>
        </CCardHeader>
        <CCardBody>
          <p className="text-right"><i>(<b>Đơn vị tính giá:</b> VNĐ)</i></p>
          <table className="table table-hover">
            <thead className="thead-dark">
              <tr>
                <th rowSpan="2">STT</th>
                <th rowSpan="2">Mã - Tên dịch vụ</th>
                <th rowSpan="2">Định mức</th>
                <th colSpan="4" className="text-center">Người Việt Nam</th>
                <th colSpan="4" className="text-center">Người nước ngoài</th>
              </tr>
              <tr>
                <th>Đơn giá cơ sở</th>
                <th>Thành tiền cơ sở</th>
                <th>Đơn giá trong gói</th>
                <th>Thành tiền trong gói</th>
                <th>Đơn giá cơ sở</th>
                <th>Thành tiền cơ sở</th>
                <th>Đơn giá trong gói</th>
                <th>Thành tiền trong gói</th>
              </tr>
            </thead>
            {(datas && datas.length) ?
              <tbody>
                <tr>
                  <td colSpan="2" className="text-center text-danger">
                    <b>Tổng</b>
                  </td>
                  <td></td>
                  <td></td>
                  <td className="text-danger">{this.total('BaseAmount')}</td>
                  <td></td>
                  <td className="text-danger">{this.total('PkgAmount')}</td>
                  <td></td>
                  <td className="text-danger">{this.total('BaseAmountForeign')}</td>
                  <td></td>
                  <td className="text-danger">{this.total('PkgAmountForeign')}</td>
                </tr>
                {datas.filter(e => PackageInfo.IsLimitedDrugConsum || !(e.ServiceType === 2 && !e.IsPackageDrugConsum)).map((item, index) => {
                  return (
                    <tr className="hover-tr" key={index}>
                      <td className="vertical-align-middle text-right" >{index + 1}</td>
                      <td><span className="pointer" title={(item.IsPackageDrugConsum || item.ServiceType === 2) ? 'Thuốc & VTTH' : ''}>{item.Service.Code} - {item.Service.ViName}</span></td>
                      <td className="vertical-align-middle text-right">{item.Qty}</td>
                      <td className="vertical-align-middle"><CurrencyText3 value={item.BasePrice} /></td>
                      <td className="vertical-align-middle"><CurrencyText3 value={item.BaseAmount} /></td>
                      <td className="vertical-align-middle"><CurrencyText3 value={item.PkgPrice} /></td>
                      <td className="vertical-align-middle"><CurrencyText3 value={item.PkgAmount} /></td>
                      <td className="vertical-align-middle"><CurrencyText3 value={item.BasePriceForeign} /></td>
                      <td className="vertical-align-middle"><CurrencyText3 value={item.BaseAmountForeign} /></td>
                      <td className="vertical-align-middle"><CurrencyText3 value={item.PkgPriceForeign} /></td>
                      <td className="vertical-align-middle">
                        <span onClick={(e) => this.editMode(item, index)} className="pointer hover-icon"><i className="fa fa-edit"></i></span>
                        <CurrencyText3 value={item.PkgAmountForeign} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              :
              <tbody>
                <tr><td colSpan="11" className="text-center">Chưa có dữ liệu</td></tr>
              </tbody>
            }
          </table>
          {this.modal()}
          {/* {this.errorModal()} */}
        </CCardBody>
      </CCard>
    )
  }
}