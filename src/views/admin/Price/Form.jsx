import React from "react"
import { PricePolicy, Package } from "src/_services";
import Hotkeys from 'react-hot-keys'
import BaseComponent from 'src/_components/BaseComponent'
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CRow,
  CButtonGroup
} from '@coreui/react'
import { confirmAlert } from 'react-confirm-alert'
import { withRouter } from 'react-router'
import CIcon from '@coreui/icons-react'
import { Loading, BlockBtnForm } from 'src/_components'
import { PolicyForm } from './Policy'
import { Sites } from './Sites'
import { Calculated } from './Calculated'
import RouteLeavingGuard from "src/_components/RouteLeavingGuard";
import { store } from 'src/_helpers'
import { submenuActions } from 'src/_actions'
class PriceForm extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {
      Id: props.match.params.id,
      hasForm: false,
      formData: null,
      calculated: [],
      PackageInfo: {}
    }
    this.handleChangeInputForm = this.handleChangeInputForm.bind(this)
    this.applyCallbackDrugConsumOnchange = this.applyCallbackDrugConsumOnchange.bind(this)
    this.applyCallback = this.applyCallback.bind(this)
    this.save = this.save.bind(this)
    this.chil = React.createRef()
  }
  componentDidMount() {
    store.dispatch(submenuActions.newmenu([
      {name: 'Quản lý danh mục gói', path: '/admin/price-policy', exact: true},
      {name: 'Thiết lập giá', path: '/admin/price-policy/:id/form/:item'}
    ]))
    this.getData()
  }
  routerWillLeave(nextLocation) {
    // this.props.router.setRouteLeaveHook(this.props.route, () => {
    //   return 'You have unsaved information, are you sure you want to leave this page?'
    // })
  }
  componentDidUpdate(prevProps) {
    if (this.props.location !== prevProps.location) {
      this.getData()
    }
  }
  applyCallbackDrugConsumOnchange () {
    // this.chil.current.calculate()
  }
  applyCallback(key, index, value) {
    var { formData } = this.state
    if (index === 0 && value === null) {
      formData[key] = []
      this.setState({ formData })
      this.setState({submited: false})
      return
    }
    if (!formData[key]) formData[key] = []
    formData[key][index] = value
    if (key === 'Policy') {
      formData[key][1].StartAt = formData[key][0].StartAt
    }
    this.setState({ formData })
    this.setState({submited: false})
    if (key === 'Details') {
      this.setState({__raw: {
        IsLimitedDrugConsum: formData['Policy'][0].IsLimitedDrugConsum,
        LimitedDrugConsumAmount: formData['Policy'][0].LimitedDrugConsumAmount
      }})
    }
  }
  validatePolicy() {
    var { formData, __raw } = this.state
    var { Policy } = formData
    if (Policy[0].IsLimitedDrugConsum !== __raw.IsLimitedDrugConsum || Policy[0].LimitedDrugConsumAmount !== __raw.LimitedDrugConsumAmount) {
      confirmAlert({
        title: 'Lỗi',
        message: 'Thông tin Giới hạn tiền thuốc và VTTH đã thay đổi, vui lòng tính lại giá và thử lại',
        buttons: [
          {
            label: 'Đồng ý',
          }
        ]
      })
      return false
    }
    var err = Policy.find(e => !e.SiteBaseCode || !e.ChargeType || !e.Amount || !e.StartAt)
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
    var { ListSites } = formData
    err = ListSites.find(e => !e.SiteId && !e.IsDeleted)
    if (err || ListSites.length === 0) {
      confirmAlert({
        title: 'Lỗi',
        message: 'Vui lòng nhập đầy đủ thông tin.',
        buttons: [
          {
            label: 'Đồng ý',
          }
        ]
      })
      this.sendError()
      return false
    }
    var valueIdSite = ListSites.filter(e => !e.IsDeleted).map((item) => { return item.SiteId });
    var isDuplicate = valueIdSite.some((id, idx) => { 
        return valueIdSite.indexOf(id) !== idx 
    });
    if (isDuplicate) {
      confirmAlert({
        title: 'Lỗi',
        message: 'Vui lòng chọn các Phạm vi áp dụng không trùng nhau',
        buttons: [
          {
            label: 'Đồng ý',
          }
        ]
      })
      return false
    }
    if (!formData.Details || formData.Details.length === 0) {
      this.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin')
      this.sendError()
      return false
    }
    return true
  }
  sendError() {
    var { formData } = this.state
    var { Policy, ListSites } = formData
    Policy.forEach((item, index) => {
      item.error = true
      if (!item.SiteBaseCode || !item.ChargeType || !item.Amount || !item.StartAt) this.applyCallback('Policy', index, item)
    })
    ListSites.forEach((item, index) => {
      item.error = true
      if (!item.SiteId && !item.IsDeleted) this.applyCallback('ListSites', index, item)
    })
  }
  save(type) {
    if (!this.validatePolicy()) return false
    let { formData } = this.state
    new PricePolicy().createOrUpdate({...formData, ListSites: formData.ListSites.filter(e => !(e.IsDeleted && e.IsNew))})
      .then((res) => {
        this.setState({submited: true})
        this.alertSuccess()
        if (type === 2) {
          this.props.history.push('/admin/price-policy/' + this.props.match.params.id + '/form/new?v=' + (new Date().getTime()))
          this.reload()
        } else {
          this.props.history.push('/admin/package/' + this.props.match.params.id + '/price-policy/' + res.Code + '/view')
        }
      }).catch(e => {
      })
  }
  isNew() {
    return this.props.match.params.itemId === 'new'
  }
  async getPackage() {
    await new Package().find(this.props.match.params.id)
      .then(response => {
        this.setState({
          PackageInfo: response
        })
      }).catch(e => {

      })
  }
  async getData() {
    this.loading(true)
    await this.getPackage()
    if (this.isNew()) {
      var formData = {
        Policy: [{
          PersonalType: 1,
          SiteBaseCode: '',
          ChargeType: '',
          Amount: '',
          StartAt: null
        }, {
          PersonalType: 2,
          SiteBaseCode: '',
          ChargeType: '',
          Amount: '',
          StartAt: null
        }],
        Details: [],
        ListSites: [],
        PackageId: this.props.match.params.id
      }
      this.setState({ formData })
      this.setState({rawData: JSON.stringify(formData)})
      this.loading(true)
    } else {
      new Package({ policycode: this.props.match.params.itemId }).find('PricePolicy/' + this.props.match.params.id)
        .then(async response => {
          var formData = response.model
          await this.checkExistPatientReg(formData.PackageId)
          if (!formData.ListSites) formData.ListSites = []
          formData.ListSites.forEach(site => {
            site.ApiCode = site.Site ? site.Site.ApiCode : ''
            site.Name = site.Site ? site.Site.Name : ''
          })
          this.setState({formData})
          this.setState({rawData: JSON.stringify(formData)})
          this.setState({__raw: {
            IsLimitedDrugConsum: formData['Policy'][0].IsLimitedDrugConsum,
            LimitedDrugConsumAmount: formData['Policy'][0].LimitedDrugConsumAmount
          }})
          this.loading(false)
        })
    }
  }
  changedData() {
    const { formData, rawData, submited } = this.state
    return JSON.stringify(formData) !== rawData && !submited
  }
  render() {
    const { formData, PackageInfo, isLoading, existPatientReg } = this.state
    if (!formData || isLoading) return (<Loading />)
    return (
      <>
        <RouteLeavingGuard
          when={this.changedData()}
          navigate={path => {
            this.props.history.push(path);
          }}
          shouldBlockNavigation={location => {
            return true;
          }}
          yes="Yes"
          no="No"
          content="Bạn chưa lưu dữ liệu, bạn có chắc chắn muốn hủy không?"
        />
        {/* <Prompt
          when={true}
          message={"Bạn chưa lưu dữ liệu, bạn có chắc chắn muốn hủy không?"}
        /> */}
        <Hotkeys
          allowRepeat="true"
          keyName="ctrl+s"
          onKeyDown={this.save.bind(this)}
          filter={() => {
            return true
          }}
        >
          <CCard>
            <CCardBody>
              <div>
                <h3 className="text-center">{this.isNew() ? 'Thêm chính sách giá gói dịch vụ' : 'Sửa chính sách giá gói dịch vụ'}</h3>
                <div className="d-flex justify-content-between mb-3">
                  <span><b>Mã - Tên gói:</b> {PackageInfo.Code} - {PackageInfo.Name}</span>
                  {formData.Code && <span><b>Mã Chính sách:</b> {formData.Code}</span>}
                </div>
                <PolicyForm applyCallbackDrugConsumOnchange={this.applyCallbackDrugConsumOnchange} isNew={this.isNew()} readOnly={existPatientReg} applyCallback={this.applyCallback} Policy={formData.Policy} rootData={formData} PackageInfo={PackageInfo}/>
                <Sites existPatientReg={existPatientReg} applyCallback={this.applyCallback} ListSites={formData.ListSites} rootData={formData} />
                <Calculated ref={this.chil} readOnly={existPatientReg} applyCallback={this.applyCallback} PackageInfo={PackageInfo} formData={formData} rootData={formData}/>
              </div>
            </CCardBody>
          </CCard>
          <BlockBtnForm>
            <CRow>
              <CCol md="5">
              </CCol>
              <CCol md="7" className="right">
                <CButtonGroup className="float-right btn-gr-2">
                  {this.isNew() ? <CButton to={'/admin/Package'} color="secondary">Hủy</CButton> :
                  <CButton to={`/admin/Package/${PackageInfo.Id}/price-policy/${this.props.match.params.itemId}/view`} color="secondary">Hủy</CButton>}
                  {(formData.Details && formData.Details.length > 0) && <>
                  <CButton onClick={(e) => this.save(1)} type="button" color="warning"><CIcon name="cil-scrubber" /> Lưu</CButton>
                  {this.isNew() && <CButton onClick={(e) => this.save(2)} type="button" color="info"><CIcon name="cil-scrubber" /> Lưu và thêm mới</CButton>}
                  </>}
                </CButtonGroup>
              </CCol>
            </CRow>
          </BlockBtnForm>
        </Hotkeys>
      </>
    )
  }
}
export default withRouter(PriceForm)
