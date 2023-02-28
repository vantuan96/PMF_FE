import React from "react"
import { Package } from "src/_services";
import BaseComponent from 'src/_components/BaseComponent'
import {
  CCard,
  CCardBody,
  CCardHeader,
} from '@coreui/react'
import { Loading } from 'src/_components'
import ServiceList from './ServiceList'
import PriceDetailList from './PriceDetailList'
import { store } from 'src/_helpers'
import { submenuActions } from 'src/_actions'
class PackageView extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {
      Id: props.match.params.id,
      hasForm: false,
      formData: null
    }
  }
  componentDidMount() {
    this.getData()
  }
  componentDidUpdate(prevProps) {
    store.dispatch(submenuActions.newmenu([
      {name: 'Quản lý danh mục gói', path: '/admin/Package', exact: true},
      {name: 'Chi tiết danh mục gói', path: '/admin/Package/:id/view'}
    ]))
    if (this.props.match.params.id !== prevProps.match.params.id) {
      this.getData()
    }
  }
  getData() {
    this.loading(true)
    new Package().find(this.props.match.params.id)
      .then(response => {
        this.setState({
          formData: response
        })
        this.loading(false)
      }).catch(e => {
        this.loading(false)
      })
  }
  render() {
    const { formData, isloading } = this.state
    if (isloading || !formData) return (<Loading />)
    return (
      <>
      <h5 className="text-center font-bold mb-1text-center">{formData.Name}</h5>
      <h5 className="text-center font-bold mb-1">Mã gói: {formData.Code}</h5>
      <CCard>
        <CCardHeader>
          <h3>Thông tin chung</h3>
        </CCardHeader>
        <CCardBody>
          <table className="table table-noborder">
            <tbody>
              <tr>
                <th className="nowrap w1">Mã - Tên gói:</th>
                <td className="pl-2 pr-2"><p className="fake-input m-0">{formData.Code + '-' + formData.Name}</p></td>
                <th className="nowrap w1 pr-2">Nhóm gói:</th>
                <td><p className="fake-input m-0">{formData.PackageGroup ? (formData.PackageGroup.Code + '-' + formData.PackageGroup.Name) : ''}</p></td>
              </tr>
              <tr>
                {/* <th className="nowrap w1">Thuốc & VTTH:</th>
                <td className="pl-2 pr-2"><p className="fake-input m-0">{formData.IsLimitedDrugConsum ? 'Theo định mức' : 'Không theo định mức'}</p></td> */}
                <th className="nowrap w1 pr-2">Trạng thái:</th>
                <td colSpan="3">{formData.IsActived ? 'Đang sử dụng' : 'Đã khóa'}</td>
              </tr>
            </tbody>
          </table>
        </CCardBody>
      </CCard>
      <CCard>
        <CCardBody>
          <h3>Phạm vi áp dụng và giá</h3>
          <PriceDetailList PackageId={formData.Id}/>
        </CCardBody>
      </CCard>
      <CCard>
        <CCardBody>
          <h3>Danh sách dịch vụ</h3>
          <ServiceList readOnly={true} PackageId={formData.Id} ServiceType={1} title={""}/>
        </CCardBody>
      </CCard>
      <CCard>
        <CCardBody>
          <h3>Danh sách Thuốc & VTTH</h3>
          <ServiceList readOnly={true} PackageId={formData.Id} ServiceType={2} title={"Danh sách thuốc và VTTH"}/>
        </CCardBody>
      </CCard>
      </>
    )
  }
}
export default PackageView
