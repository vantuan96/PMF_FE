import BaseComponent from 'src/_components/BaseComponent'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CInputCheckbox, CFormGroup, CLabel,
  CRow, CCol,
  CButton
} from '@coreui/react'
import {
  Loading, CurrencyText, CurrencyText2,
  SiteSelect, InputSelect,
  PackageInputSelect,
  VDatePicker,
  InputText, AdInput, DepartmentSelect,
  NumerInput, CurrencyInputText, InputTextarea,
  BlockBtnForm
} from 'src/_components'
import {Printer} from '../Register/Print'
import { confirmAlert } from 'react-confirm-alert'
import clsx from 'clsx'
import { PersonalType, DiscountTypeOption } from 'src/_constants'
import { PatientService, Package, SiteInfoService } from 'src/_services'
import RouteLeavingGuard from "src/_components/RouteLeavingGuard";
class CustomerUpgrade extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {
      data: null,
      reseter: false,
      reseter2: false,
      customer: null,
      formData: {},
      error: {},
      step: 1,
      siteInfo: {},
      rawData: '',
      submited: false
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleSiteIdChange = this.handleSiteIdChange.bind(this);
  }
  componentDidMount() {
    this.getData()
  }
  handleSiteIdChange(e) {
    setTimeout(() => {
      this.resetDataWhenSiteSelect(e)
    }, 10);
  }
  resetDataWhenPackageSelect() {
    // this.updateFormData('StartAt', null)
    this.setState({ reseter2: true })
    const { formData } = this.state
    this.updateFormData('NetAmount', null)
    this.updateFormData('PolicyId', null)
    this.updateFormData('Policy', null)
    this.updateFormData('IsMaternityPackage', false)
    this.updateFormData('EstimateBornDate', null)
    this.updateFormData('IsDiscount', formData._IsDiscount)
    this.updateFormData('DiscountType', formData._DiscountType)
    this.updateFormData('DiscountNote', formData._DiscountNote)
    this.updateFormData('DiscountAmount', formData._DiscountAmount)
    this.updateFormData('GroupPackageCode', null)
    this.updateFormData('GroupPackageName', null)
    setTimeout(() => {
      this.setState({ reseter2: false })
    }, 100);
  }
  resetDataWhenSiteSelect(site) {
    this.setState({ reseter: true })
    this.updateFormData('SiteCode', site.ApiCode)
    this.updateFormData('DepartmentId', null)
    this.updateFormData('PackageId', null)
    
    this.resetDataWhenPackageSelect()
    setTimeout(() => {
      this.setState({ reseter: false })
    }, 100);
  }
  handleChange(e) {
    const { value, name, type, checked, _obj } = e.target;
    var { _DiscountAmount } = this.state.formData
    this.updateFormData(name, type === 'checkbox' ? checked : (value || ''))
    if (name === 'PersonalType') {
    }
    if (name === 'PackageId') {
      this.resetDataWhenPackageSelect()
      setTimeout(() => {
        this.getPolicy()
      }, 100);
      if (_obj) {
        this.updateFormData('GroupPackageCode', _obj.PackageGroup.Code)
        this.updateFormData('GroupPackageName', _obj.PackageGroup.Name)
        this.updateFormData('PackageName', _obj.Name)
        this.updateFormData('IsMaternityPackage', _obj.IsMaternityPackage)
      }
    }
    if (name === 'IsDiscount') {
      if (!checked) {
        this.updateFormData('NetAmount', 0)
        this.updateFormData('DiscountAmount', 0)
        this.updateFormData('DiscountType', '0')
      } else {
        this.updateFormData('DiscountType', '1')
      }
    }
    if (name === 'DiscountType') {
      if (value === '1') {
        this.updateFormData('DiscountAmount', null)
      } else {
        this.updateFormData('DiscountAmount', _DiscountAmount)
      }
    }
    this.removeError(value, name)
    setTimeout(() => {
      if (name === 'PackageId') {
        this.discountCalculated()
      }
      
      if (name === 'IsDiscount' || name === 'DiscountAmount' || name === 'DiscountType') {
        this.discountAmountCalculated()
      }
    }, 100);
  }
  discountAmountCalculated() {
    var { DiscountType, DiscountAmount, Policy, IsDiscount} = this.state.formData
    console.log(DiscountType)
    var NetAmount = 0
    if (!Policy || !IsDiscount) {
      NetAmount = 0
    } else {
      if (DiscountType === '1') NetAmount = Policy.Amount - Policy.Amount * DiscountAmount / 100
      if (DiscountType === '2') NetAmount = Policy.Amount - DiscountAmount
    }
    this.updateFormData('NetAmount', NetAmount)
  }
  discountCalculated() {
    var { DiscountType, DiscountAmount, Policy, IsDiscount, Amount, _DiscountAmount } = this.state.formData
    var __DiscountAmount = DiscountAmount * 1
    if (_DiscountAmount > Amount) {
      this.updateFormData('DiscountAmount', Amount)
      __DiscountAmount = Amount
    } else {
      this.updateFormData('DiscountAmount', _DiscountAmount)
      __DiscountAmount = _DiscountAmount
    }
    var NetAmount = 0
    if (!Policy || !IsDiscount) {
      NetAmount = 0
    } else {
      if (DiscountType === '1') NetAmount = Policy.Amount - Policy.Amount * __DiscountAmount / 100
      if (DiscountType === '2') NetAmount = Policy.Amount - __DiscountAmount
    }
    this.updateFormData('NetAmount', NetAmount)
  }
  getPolicy() {
    if (!this.state.formData.PackageId) return false
    new Package({ sitecode: this.state.formData.SiteCode, personaltype: this.state.formData.PersonalType, applydate: '' }).find('PricePolicyAvailable/' + this.state.formData.PackageId)
      .then(response => {
        if (response.model && response.model.length) {
          this.updateFormData('Policy', response.model[0])
          this.updateFormData('PolicyId', response.model[0].PolicyId)
          this.updateFormData('Amount', response.model[0].Amount)
          setTimeout(() => {
            this.discountCalculated()
          }, 100);
        } else {
          this.alert('L???i', 'Kh??ng t??m th???y th??ng tin gi?? t????ng ???ng');
        }
      })
  }
  getData () {
    new PatientService().find('Package/' + this.props.match.params.id)
      .then(({model}) => {
        this.updateFormData('SiteId', model.SiteId)
        this.updateFormData('PatientModel', model.PatientModel)
        this.updateFormData('PersonalType', model.PersonalType + "")
        this.updateFormData('StartAt', model.StartAt)
        this.updateFormData('IsMaternityPackage', model.IsMaternityPackage)
        this.updateFormData('EstimateBornDate', model.EstimateBornDate)
        this.updateFormData('DoctorConsultAd', model.DoctorConsultAd)
        this.updateFormData('DoctorConsultFullName', model.DoctorConsultFullName)
        this.updateFormData('DoctorConsult', {
          Username: model.DoctorConsultAd,
          Fullname: model.DoctorConsultFullName
        })
        this.updateFormData('DepartmentId', model.DepartmentId)
        this.updateFormData('DepartmentName', model.DepartmentName)
        this.updateFormData('SiteCode', model.SiteCode)

        this.updateFormData('_IsDiscount', model.IsDiscount)
        this.updateFormData('IsDiscount', model.IsDiscount)

        this.updateFormData('DiscountNote', model.DiscountNote)
        this.updateFormData('_DiscountNote', model.DiscountNote)

        if (model.DiscountType === 1 || model.DiscountType === '1') {
          this.updateFormData('_DiscountType', '2')
          this.updateFormData('DiscountType', '2')

          var DiscountAmount = model.Amount * model.DiscountAmount / 100
          this.updateFormData('_DiscountAmount', DiscountAmount)
          this.updateFormData('DiscountAmount', DiscountAmount)

        } else {
          this.updateFormData('_DiscountAmount', model.DiscountAmount)
          this.updateFormData('DiscountAmount', model.DiscountAmount)

          this.updateFormData('_DiscountType', model.DiscountType + "")
          this.updateFormData('DiscountType', model.DiscountType + "")
        }
        
        this.updateFormData('OldPatientInPackageId', this.props.match.params.id)
        this.setState({customer: model.PatientModel})
        setTimeout(() => {
          this.setState({data: model})
          var {formData} = this.state
          console.log(formData)
          this.setState({rawData: JSON.stringify(formData)})
        }, 200)
      })
  }
  updateFormData(name, value) {
    let valueUpdate = {}
    valueUpdate[name] = value
    this.setState(prevState => {
      let formData = Object.assign({}, prevState.formData)
      formData = { ...formData, ...valueUpdate }
      return { formData }
    })
  }
  componentDidUpdate(prevProps) {
    if (this.props.location !== prevProps.location) {
    }
  }
  removeError (value, name) {
    const { error } = this.state
    if (value) error[name] = null
    this.setState({ error })
  }
  isValidateData () {
    var error = {}
    const { formData } = this.state
    if (!formData.SiteId) error['SiteId'] = 'N??i k??ch ho???t g??i l?? b???t bu???c'
    if (!formData.PackageId) error['PackageId'] = 'G??i l?? b???t bu???c'
    if (!formData.StartAt) error['StartAt'] = 'Ng??y b???t ?????u l?? b???t bu???c'
    if (!formData.EndAt) error['EndAt'] = 'Ng??y k???t th??c l?? b???t bu???c'
    if (formData.IsDiscount) {
      if (!formData.DiscountAmount) error['DiscountAmount'] = 'M???c gi???m l?? b???t bu???c'
      if (!formData.DiscountNote) error['DiscountNote'] = 'L?? do gi???m l?? b???t bu???c'
    }
    this.setState({ error })
    return Object.keys(error).length === 0
  }
  errorText (key) {
    const { error } = this.state;
    if (error[key]) return <div className="srv-validation-message">{error[key]}</div>
  }
  nextToStep2 () {
    if (this.isValidateData()) {
      const { formData } = this.state;
      new PatientService().update('Package/Transferred_ViewPaymentInPackage', {
        ...formData,
        PersonalType: parseInt(formData.PersonalType),
        DiscountType: formData.IsDiscount ? parseInt(formData.DiscountType) : '0',
        NetAmount: formData.IsDiscount ? formData.NetAmount : formData.Amount
      })
        .then((response) => {
          this.setState({newModel: response.request})
          this.setState({step: 2})
        })
    }
  }
  transferredPackage () {
    const { newModel } = this.state;
    new PatientService().update('Package/transferredPackage', {...newModel })
        .then((response) => {
          this.print("/Customer/Detail/" + response.PatientInPackageId + "/" + newModel.PatientModel.PID)
        }).catch(e => {
          if (e.data && e.data.MessageCode === 'CONFIRM_BELONG_PACKAGE_CURRENTPATIENT_INPACKAGE_ISOTHER') {
            this.nextToStep2()
          }
        });
  }
  print (url) {
    const { formData } = this.state;
    new SiteInfoService().find(formData.SiteCode).then((rep) => {
      this.setState({ siteInfo: rep[0] });
      setTimeout(() => {
        this.htmlToPaper("print-me");
        setTimeout(() => {
          this.alert("", "N??ng c???p g??i th??nh c??ng");
          this.setState({submited: true})
          this.props.history.push(url);
        }, 400);
      }, 200);
    });
  }
  backToStep1 () {
    confirmAlert({
      message: 'B???n ch??a l??u d??? li???u. B???n c?? ch???c ch???n mu???n h???y?',
      buttons: [
        {
          label: 'H???y'
        },
        {
          label: '?????ng ??',
          onClick: () => {
            this.setState({step: 1})
          }
        }
      ]
    });
  }
  listToConfirm () {
    const {newModel} = this.state
    if (!newModel) return (<></>)
    var ListToConfirm = newModel
    var hasInPackage = false
    var hasOverPackage = false
    var hasOutPackage = false
    var hasWarn = false
    if (ListToConfirm && ListToConfirm.listCharge && ListToConfirm.listCharge.length) {
      hasInPackage = ListToConfirm.listCharge.filter(e => e.InPackageType === 1).length > 0
      hasOverPackage = ListToConfirm.listCharge.filter(e => e.InPackageType === 2).length > 0
      hasOutPackage = ListToConfirm.listCharge.filter(e => e.InPackageType === 3).length > 0
      hasWarn = ListToConfirm.listCharge.filter(e => e.InPackageType === 4).length > 0
    }
    return (<table className="table cd-table cd-table-bordered cd-table-bordered">
      <thead className="thead-dark text-center">
        <tr>
          <th>M?? - T??n d???ch v???</th>
          <th>Th???i gian ch??? ?????nh</th>
          <th>Visit No.</th>
          <th width="90px">?????nh m???c c??n l???i</th>
          <th width="1" className="nowrap">S??? l?????ng</th>
          <th>????n gi??</th>
          <th>Th??nh ti???n</th>
          <th>Ghi ch??</th>
        </tr>
      </thead>
      {(ListToConfirm.listCharge && ListToConfirm.listCharge.length) ? 
      <tbody>
        {hasInPackage && <tr><th colSpan="8">Trong g??i</th></tr>}
        {ListToConfirm.listCharge.filter(e => e.InPackageType === 1).map((item, index) => {
            return <tr key={index}>
              <td>{item.ServiceCode} - {item.ServiceName}</td>
              <td>{item.ChargeDate}</td>
              <td>{item.VisitCode}</td>
              <td className="text-right">{item.QtyRemain}</td>
              <td className="text-right">{item.QtyCharged}</td>
              <td><CurrencyText noValue={'0'} value={item.Price}/></td>
              <td><CurrencyText noValue={'0'} value={item.Amount}/></td>
              <td>{item.Notes ? item.Notes.map(e => e.ViMessage).join(', ') : ''}</td>
            </tr>
          })
        }
        {hasOverPackage && <tr><th colSpan="8">V?????t g??i</th></tr>}
        {ListToConfirm.listCharge.filter(e => e.InPackageType === 2).map((item, index) => {
            return <tr key={index}>
              <td>{item.ServiceCode} - {item.ServiceName}</td>
              <td>{item.ChargeDate}</td>
              <td>{item.VisitCode}</td>
              <td className="text-right">{item.QtyRemain || '-'}</td>
              <td className="text-right">{item.QtyCharged}</td>
              <td><CurrencyText noValue={'0'} value={item.Price}/></td>
              <td><CurrencyText noValue={'0'} value={item.Amount}/></td>
              <td>{item.Notes ? item.Notes.map(e => e.ViMessage).join(', ') : ''}</td>
            </tr>
          })
        }
        {hasOutPackage && <tr><th colSpan="8">Ngo??i g??i</th></tr>}
        {ListToConfirm.listCharge.filter(e => e.InPackageType === 3).map((item, index) => {
            return <tr key={index}>
              <td>{item.ServiceCode} - {item.ServiceName}</td>
              <td>{item.ChargeDate}</td>
              <td>{item.VisitCode}</td>
              <td className="text-right">{item.QtyRemain || '-'}</td>
              <td className="text-right">{item.QtyCharged}</td>
              <td className="text-right">{item.Price ? <CurrencyText noValue={'0'} value={item.Price}/> : '0'}</td>
              <td className="text-right">{item.Amount ? <CurrencyText noValue={'0'} value={item.Amount}/> : '0'}</td>
              <td>{item.Notes ? item.Notes.map(e => e.ViMessage).join(', ') : ''}</td>
            </tr>
          })
        }
        {hasWarn && <tr><td colSpan="8"><p><b>D???ch v??? trong g??i c?? S??? l?????ng/L???n ch??? ?????nh > ?????nh m???c c??n l???i</b></p> H??? th???ng s??? kh??ng ghi nh???n l???n s??? d???ng v?? c???p nh???t gi?? g??i cho c??c ch??? ?????nh v?????t qu?? s??? ?????nh m???c c??n l???i. Vui l??ng t??ch charge tr??n OH v?? th???c hi???n l???i ch???c n??ng n??y! </td></tr>}
        {ListToConfirm.listCharge.filter(e => e.InPackageType === 4).map((item, index) => {
            return <tr key={index}>
              <td>{item.ServiceCode} - {item.ServiceName}</td>
              <td>{item.ChargeDate}</td>
              <td>{item.VisitCode}</td>
              <td className="text-right">{item.QtyRemain}</td>
              <td className="text-right">{item.QtyCharged}</td>
              <td className="text-right">{item.Price ? <CurrencyText noValue={'0'} value={item.Price}/> : '0'}</td>
              <td className="text-right">{item.Amount ? <CurrencyText noValue={'0'} value={item.Amount}/> : '0'}</td>
              <td>{item.Notes ? item.Notes.map(e => e.ViMessage).join(', ') : ''}</td>
            </tr>
          })
        }
      </tbody>
      :
      <tbody>
        <tr><td colSpan="8" className="text-center">Kh??ng c?? d??? li???u</td></tr>
      </tbody>
      }
    </table>
    )
  }
  changedData() {
    const { formData, rawData, submited } = this.state
    return JSON.stringify(formData) !== rawData && !submited
  }
  render() {
    const {data, customer, formData, reseter, step, newModel, siteInfo, reseter2} = this.state
    if (!data || reseter) return <Loading/>
    var tx = '???????c n??ng c???p t??? g??i' + data.PackageCode + ' - ' + data.PackageName
    return (<>
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
        content="B???n ch??a l??u d??? li???u, b???n c?? ch???c ch???n mu???n h???y kh??ng?"
      />
      <h3 class="text-center"><b>N??ng c???p g??i</b>
      <CButton color="secondary" className="float-right" to={`/Customer/Detail/${this.props.match.params.id}/${data.PatientModel.PID}`}>
        <i className="fa fa-fw fa-times" aria-hidden="true"></i>
      </CButton>
      </h3>
      <h4 class="text-center"><b>(Kh??ch h??ng: {data.PatientModel.FullName}, PID: {data.PatientModel.PID})</b></h4>
      <div className="step-bar d-flex justify-content-center">
        <div className={clsx({
            'active': true,
            'step-1': true
          })}><span>1</span><div>Ch???n g??i m???i</div></div>
        <div className={clsx({
            'active': step === 2,
            'step-2': true
          })}><span>2</span><div>Th??ng tin thanh to??n</div></div>
      </div>
      {true &&
      <div className={clsx({
        'hidden': step === 2
      })}>
      <CCard>
        <CCardHeader>
          <h4><b>Th??ng tin g??i hi???n t???i</b></h4>
        </CCardHeader>
        <CCardBody>
          <table className="table table-noborder">
            <tbody>
              <tr>
                <th className="nowrap" width="20%">M?? - T??n g??i:</th>
                <td className="pl-2 pr-2" width="30%">
                  {data.PackageCode} - {data.PackageName}
                </td>
                <th className="nowrap  pl-2" width="20%">Nh??m g??i:</th>
                <td className="pl-2">{data.GroupPackageCode} - {data.GroupPackageName}</td>
              </tr>
              <tr>
                <th width="20%">N??i k??ch ho???t g??i:</th>
                <td className="pl-2 pr-2">{data.SiteCode} - {data.SiteName}</td>
                <th className="nowrap  pl-2">?????i t?????ng:</th>
                <td className="pl-2">{(PersonalType.find(e => e.value === ("" + data.PersonalType)) || {}).label}</td>
              </tr>
              <tr>
                <th>Gi?? g??i:</th>
                <td className="pl-2 pr-2"><div className="float-left nowrap"><CurrencyText value={data.Amount} unit="VN??" noValue={"0"}/> </div></td>
                <th className=" pl-2">M???c gi???m gi??, chi???t kh???u:</th>
                <td className="pl-2">
                  <div className="float-left nowrap">
                  {data.IsDiscount ? <>
                  {data.DiscountType === 1 ?
                    <>{data.DiscountAmount} %</>
                    :
                    <><CurrencyText value={data.DiscountAmount} unit="VN??"/></>
                  }
                  </>: '-'}
                  </div>
                </td>
              </tr>
              <tr>
                <th>Gi?? g??i sau gi???m:</th>
                <td className="pl-2 pr-2">
                  <div className="float-left nowrap">{(data.IsDiscount) ? <CurrencyText value={data.NetAmount} unit="VN??" noValue={"0"}/>: '-'}</div>
                </td>
                <th className=" pl-2">L?? do gi???m gi??:</th>
                <td className="pl-2">
                  {data.DiscountNote || '-'}
                </td>
              </tr>
              {data.IsMaternityPackage ? <>
                <tr>
                  {/* <th>{data.IsMaternityPackage && <><i className="far fa-check-square" aria-hidden="true"></i> G??i thai s???n</>}</th>
                  <td className="pl-2 pr-2"></td> */}
                  {/* <th className=" pl-2">Thu???c & VTTH:</th>
                  <td className="pl-2">
                    {data.IsLimitedDrugConsum ? 'Theo ?????nh m???c' : 'Kh??ng theo ?????nh m???c'}
                  </td> */}
                  <th>{data.IsMaternityPackage ? 'Ng??y d??? sinh:': ''}</th>
                  <td className="pl-2 pr-2">{data.IsMaternityPackage ? <> {data.EstimateBornDate}</> : ''}</td>
                </tr>
                <tr>
                  <th className="">Th???i gian hi???u l???c:</th>
                  <td className="pl-2">{data.StartAt} ~ {data.EndAt}</td>
                </tr>
              </> : <>
                <tr>
                  {/* <th>Thu???c & VTTH:</th>
                  <td className="pl-2">
                    {data.IsLimitedDrugConsum ? 'Theo ?????nh m???c' : 'Kh??ng theo ?????nh m???c'}
                  </td> */}
                  <th className="">Th???i gian hi???u l???c:</th>
                  <td className="pl-2">{data.StartAt} ~ {data.EndAt}</td>
                </tr>
              </>}
            </tbody>
          </table>
        </CCardBody>
      </CCard>
      <CCard>
        <CCardHeader>
          <h4><b>Ch???n g??i m???i</b></h4>
        </CCardHeader>
        <CCardBody className={clsx({
            'no-site-selected': !formData.SiteId,
            'no-package-selected': !formData.PackageId
          })}>
          <table className="table table-noborder">
            <tbody>
              <tr>
                <th className="nowrap" width="20%">N??i k??ch ho???t g??i<span className="required-text">*</span>:</th>
                <td className="pl-2 pr-2" width="30%">
                  <SiteSelect
                    name="SiteId"
                    defaultValue={formData.SiteId}
                    applyCallback={this.handleChange}
                    applyCallbackWithObject={this.handleSiteIdChange}
                  />
                  {this.errorText('SiteId')}
                </td>
                <th className="nowrap pl-2" width="20%">?????i t?????ng:</th>
                <td className="pl-2">
                  <InputSelect
                    name="PersonalType"
                    options={PersonalType}
                    defaultValue={formData.PersonalType}
                    applyCallback={this.handleChange}
                  />
                  {this.errorText('PersonalType')}
                </td>
              </tr>
              <tr>
                <th>M??/ T??n g??i <span className="required-text">*</span>:</th>
                <td className="pl-2 pr-2">
                    <PackageInputSelect
                      name="PackageId"
                      defaultValue={formData.PackageId}
                      onChange={this.handleChange}
                      query={{ Sites: formData.SiteId, Status: 1, IsShowExpireDate: false, IsAvailable: true, OnlyShowSameRoot: true, CurrentGroupId: data.GroupPackageId  }}
                    />
                    {this.errorText('PackageId')}
                </td>
                <th className=" pl-2">Nh??m g??i:</th>
                <td className="pl-2">{formData.GroupPackageCode} - {formData.GroupPackageName}</td>
              </tr>
              <tr>
                <th className="nowrap">Gi?? g??i:</th>
                <td className="p-2 pr-2">
                  <div className="d-flex align-items-center justify-content-start">
                    {formData.Policy && <><CurrencyText value={formData.Policy.Amount} unit="VN??"/> </>}
                  </div>
                </td>
                <th className=" pl-2">Th???i gian c?? hi???u l???c <span className="required-text">*</span>:</th>
                <td className="pl-2 "><div className="d-flex align-items-center"><span className="nowrap">T??? {formData.StartAt || '-'}</span> <span className="pl-2 pr-2">?????n</span> <div><VDatePicker placeholder=" / /" minDate={new Date()} name="EndAt" value={formData.EndAt} onChange={this.handleChange} />{this.errorText('EndAt')}</div> </div></td>
              </tr>
              <tr>
                {/* <th>Thu???c & VTTH:</th>
                <td className="p-2 pr-2">
                  {formData.Policy && <>
                    {formData.Policy.Package.IsLimitedDrugConsum ? 'Theo ?????nh m???c' : 'Kh??ng theo ?????nh m???c'}
                  </>}
                </td> */}
                {/* <th className=" pl-2">
                  <CFormGroup variant="custom-checkbox" className="form-group mb-0 custom-control-2 d-flex align-items-center justify-content-between">
                    <CInputCheckbox
                      custom
                      id={'IsMaternityPackage'}
                      name="IsMaternityPackage"
                      checked={formData.IsMaternityPackage}
                      onChange={this.handleChange}
                    />
                    <CLabel variant="custom-checkbox" className="nowrap" htmlFor={'IsMaternityPackage'}>G??i thai s???n</CLabel>
                  </CFormGroup>
                </th> */}
                {formData.IsMaternityPackage && <><td className="pr-2">
                  <div className=""><b className="pr-1 nowrap">Ng??y d??? sinh:</b> <div className="min-w-110"></div></div>
                </td>
                <td className="p-2 pr-2"><VDatePicker minDate={new Date()} placeholder=" / /" name="EstimateBornDate" value={formData.EstimateBornDate} onChange={this.handleChange} /></td>
                </>
                }
              </tr>
              <tr>
                <th>S??? h???p ?????ng:</th>
                <td className="p-2 pr-2">
                  <InputText name="ContractNo" value={formData.ContractNo} placeholder="Nh???p S??? h???p ?????ng" type="text" onChange={this.handleChange} />
                </td>
                <th className="nowrap  pl-2">B??c s??:</th>
                <td>
                  <div className="controls">
                    <AdInput name="DoctorConsult" value={formData.DoctorConsult} applyCallback={this.handleChange} />
                  </div>
                </td>
              </tr>
              <tr>
                <th>Ng??y h???p ?????ng:</th>
                <td className="p-2 pr-2">
                  <VDatePicker placeholder=" / /" name="ContractDate" value={formData.ContractDate} onChange={this.handleChange} />
                </td>
                <th className=" pl-2">Khoa ph??ng:</th>
                <td>
                  <div className="controls">
                    <DepartmentSelect
                      query={{ SiteCode: formData.SiteCode }}
                      name="DepartmentId"
                      defaultValue={formData.DepartmentId}
                      applyCallback={this.handleChange}
                    />
                  </div>
                </td>
              </tr>
              <tr>
                <th>T??n nh??n vi??n ph??? tr??ch:</th>
                <td className="p-2 pr-2">
                  <div className="controls">
                    <AdInput name="ContractOwner" value={formData.ContractOwner} applyCallback={this.handleChange} />
                  </div>
                </td>
                <td className=" pl-2">
                  <CFormGroup variant="custom-checkbox" className="form-group mb-0 custom-control-2">
                    <CInputCheckbox
                      custom
                      id={'IsDiscount'}
                      name="IsDiscount"
                      checked={formData.IsDiscount}
                      onChange={this.handleChange}
                    />
                    <CLabel className="nowrap" variant="custom-checkbox" htmlFor={'IsDiscount'}>Gi???m gi?? chi???t kh???u.</CLabel>
                  </CFormGroup>
                </td>
              </tr>
              {formData.IsDiscount && <>
              {!reseter2 &&
              <tr>
                <th className="nowrap">M???c gi???m <span className="required-text">*</span>:</th>
                <td className="pl-2 pr-2">
                  <div className="d-flex align-items-center justify-content-end">
                    <div className="flex-grow-1">
                    {formData.DiscountType === '1' ?
                      <NumerInput min={1} max={100} name="DiscountAmount" value={formData.DiscountAmount} placeholder="Nh???p" type="text" onChange={this.handleChange} />
                      :
                      <CurrencyInputText name="DiscountAmount" value={formData.DiscountAmount} onChange={this.handleChange} />
                    }
                    {this.errorText('DiscountAmount')}
                    </div>
                    <div className="mini-input-item ml-2 sty2" style={{ width: '85px' }}>
                      <InputSelect
                        options={DiscountTypeOption}
                        name="DiscountType"
                        defaultValue={formData.DiscountType}
                        applyCallback={this.handleChange}
                        noSearchable={true}
                      />
                    </div>
                  </div>
                </td>
                <td className=" pl-2">
                  <div className="d-flex align-items-center justify-content-start"><b className="mr-1">Gi?? g??i sau gi???m: </b></div>
                </td>
                <td><div className="d-flex align-items-center justify-content-start"> {formData.PackageId ? <><CurrencyText value={formData.NetAmount} unit="VN??" noValue={'0'} /></> : ''}</div></td>
              </tr>
              }
              <tr className="need-package-selected">
                <th className="nowrap">L?? do gi???m gi??  <span className="required-text">*</span>:</th>
                <td colSpan="3" className="p-2">
                  <InputTextarea 
                    name="DiscountNote" 
                    id="DiscountNote"
                    className="form-control"
                    minRows="1"
                    value={formData.DiscountNote}
                    onChange={this.handleChange}
                    placeholder="Nh???p L?? do gi???m gi??" 
                  />
                  {this.errorText('DiscountNote')}
                </td>
              </tr>
              </>}
            </tbody>
          </table>
        </CCardBody>
      </CCard>
      </div>
      }
      {step === 2 && <>
        <CCard  className={clsx({
        'hidden': step === 1
      })}>
        <CCardHeader>
          <b>Th??ng tin thanh to??n</b>
        </CCardHeader>
        <CCardBody>
          <table className="table table-noborder">
            <tbody>
              <tr>
                <th className="nowrap" width="20%">M?? - T??n g??i m???i:</th>
                <td className="pl-2 pr-2" width="30%">
                  {newModel.PackageCode} - {newModel.PackageName}
                </td>
                <th className="nowrap" width="20%">M?? - T??n g??i c??:</th>
                <td className="pl-2">{newModel.OldPackageCode} - {newModel.OldPackageName}</td>
              </tr>
              <tr>
                <th className="nowrap" width="20%">Gi?? g??i m???i sau gi???m gi?? chi???t kh???u:</th>
                <td className="pl-2 pr-2" width="30%">
                  <div className="float-left nowrap"><CurrencyText noValue={'0'} value={newModel.NetAmount} unit="VN??"/></div>
                </td>
                {/* <th className="nowrap" width="20%">Gi?? nguy??n g??i c??:</th>
                <td className="pl-2"><div className="float-left nowrap"><CurrencyText value={newModel.OldPackageOriginalAmount} unit="VN??"/></div></td> */}
                <th className="nowrap" width="20%">Gi?? g??i c?? sau gi???m gi??, chi???t kh???u:</th>
                <td className="pl-2"><div className="float-left nowrap"><CurrencyText value={newModel.OldPackageNetAmount} unit="VN??" noValue={'0'}/></div></td>
              </tr>
              <tr>
                <th className="nowrap font18" width="20%">Ph???i thu d??? ki???n:</th>
                <td className="pl-2 pr-2 font18" width="30%">
                  <div><div className="float-left nowrap font18"><CurrencyText value={newModel.ReceivableAmount} unit="VN??" noValue={"0"}/></div></div>
                </td>
                <th className="nowrap" width="20%"></th>
                <td className="pl-2"></td>
              </tr>
              <tr>
                <td></td>
                <td colSpan="4" className="pl-2">{(newModel.DebitAmount || newModel.Over_OutSidePackageFee) ? <p>(Trong ????: {newModel.DebitAmount ? <><b>C???p nh???p c??ng n???: </b><CurrencyText2 value={newModel.DebitAmount} unit="VN??"/></> : ''}{(newModel.DebitAmount && newModel.Over_OutSidePackageFee) ? ', ' : ''}{newModel.Over_OutSidePackageFee ? <><b> Ph?? s??? d???ng v?????t/ ngo??i g??i: </b><CurrencyText2 value={newModel.Over_OutSidePackageFee} unit="VN??"/></> : ''})</p> : ''}</td>
              </tr>
            </tbody>
          </table>
          <h3 className="text-center font-bold">X??c nh???n ch??? ?????nh thu???c g??i</h3>
          <div className="d-flex justify-content-between">
            <CButton onClick={() => this.nextToStep2()} color="info" size="sm" title="C???p nh???t th??ng tin ch??? ?????nh t??? OH">
              <i className="fas fa-sync-alt"></i>
            </CButton>
            <p className="text-right"><i>(<b>????n v??? t??nh gi??:</b> VN??)</i></p>
          </div>
          {this.listToConfirm()}
        </CCardBody>
        </CCard>
      </>}
      <br/><br/><br/><br/><br/><br/>
      {newModel ? <Printer tx={tx} customer={customer} formData={formData} siteInfo={siteInfo} price={newModel.NetAmount}/> : ''}
      <BlockBtnForm>
        <CRow>
          <CCol md="5">
          
          </CCol>
          <CCol md="7" className="text-right">
            {step === 1 && <CButton onClick={() => this.nextToStep2()} color="secondary">
              Ti???p t???c
            </CButton>}
            {step === 2 && <CButton onClick={() => this.backToStep1()} color="secondary">
              Quay l???i
            </CButton>}
            {" "}
            {step === 2 && <CButton onClick={() => this.transferredPackage()} color="info">
              N??ng c???p
            </CButton>}
          </CCol>
        </CRow>
      </BlockBtnForm>
    </>)
  }
}
export default CustomerUpgrade