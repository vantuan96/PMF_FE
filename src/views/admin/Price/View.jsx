import React from "react"
import { Package } from "src/_services";
import BaseComponent from 'src/_components/BaseComponent'
import {
  CButton,
  CCol,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { Loading, BlockBtnForm } from 'src/_components'
import { PolicyForm } from './Policy'
import { Sites } from './Sites'
import { Calculated } from './Calculated'
import { store, hasPermissions } from 'src/_helpers'
import { submenuActions } from 'src/_actions'
class ViewDetail extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {
      Id: props.match.params.id,
      hasForm: false,
      formData: null,
      calculated: [],
      PackageInfo: null
    }
  }
  componentDidMount() {
    store.dispatch(submenuActions.newmenu([
      {name: 'Quản lý danh mục gói', path: '/admin/Package', exact: true},
      {name: 'Chi tiết danh mục gói', path: '/admin/Package/:id/view', exact: true},
      {name: 'Chi tiết gói', path: '/admin/package/:id/price-policy/:itemId/view'}
    ]))
    this.getData()
  }
  componentDidUpdate(prevProps) {
    if (this.props.location !== prevProps.location) {
      this.getData()
    }
  }
  async getPackage () {
    if (this.state.PackageInfo) return true
    await new Package().find(this.props.match.params.id)
        .then(response => {
          this.setState({
            PackageInfo: response
          })
        }).catch(e => {
          
        })
  }
  async getData() {
    await this.getPackage()
    this.loading(true)
    new Package({ policycode: this.props.match.params.itemId }).find('PricePolicy/' + this.props.match.params.id)
      .then(response => {
        var formData = response.model
        if (!formData.ListSites) formData.ListSites = []
        formData.ListSites.forEach(site => {
          site.ApiCode = site.Site ? site.Site.ApiCode : ''
          site.Name = site.Site ? site.Site.Name : ''
        })
        this.setState({
          formData: response.model
        })
        this.loading(false)
      })
  }
  render() {
    const { formData, PackageInfo, isloading } = this.state
    if (!formData || isloading || !PackageInfo) return (<Loading />)
    return (
      <>
        <div>
          <div>
            <h5 className="text-center font-bold mb-1">CHI TIẾT GIÁ GÓI DỊCH VỤ</h5>
            <div className="d-flex justify-content-between mb-3">
              <span><b>Mã - Tên gói:</b> {PackageInfo.Code} - {PackageInfo.Name}</span>
              {formData.Code && <span><b>Mã Chính sách:</b> {formData.Code}</span>}
            </div>
            <PolicyForm readOnly={true} Policy={formData.Policy} rootData={formData} PackageInfo={PackageInfo}/>
            <Sites readOnly={true} ListSites={formData.ListSites} rootData={formData}/>
            <Calculated readOnly={true} formData={formData} rootData={formData} PackageInfo={PackageInfo} />
          </div>
          <br/><br/><br/>
          <BlockBtnForm hasBack={true}>
            <CRow>
              <CCol md="3">
                {this.props.Expand && <CButton to={`/admin/price-policy/${this.props.match.params.id}/form/new`} className="" type="button" color="warning">Thêm chính sách giá</CButton>}
              </CCol>
              <CCol md="6" className="right">
              </CCol>
              <CCol md="3" className="right">
              {hasPermissions(['ADMINPACKAGE_CREATEORUPDATEPRICEPOLICYAPI']) && <CButton to={`/admin/price-policy/${this.props.match.params.id}/form/${this.props.match.params.itemId}`} className="float-right btn-block" type="button" color="warning"><CIcon name="cil-scrubber" /> Sửa</CButton>}
              </CCol>
            </CRow>
          </BlockBtnForm>
        </div>
      </>
    )
  }
}
export default ViewDetail
