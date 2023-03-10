import React from "react";
import BaseComponent from "src/_components/BaseComponent";
import ReactTooltip from "react-tooltip";
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CForm,
  CInputCheckbox,
  CFormGroup,
  CLabel,
  CCardFooter,
} from "@coreui/react";
import {
  VDatePicker,
  SiteSelect,
  InputSelect,
  AdInput,
  Loading,
  DepartmentSelect,
  PackageInputSelect,
  InputText,
  CurrencyInputText,
  NumerInput,
  CurrencyText,
  InputTextarea,
} from "src/_components";
import RouteLeavingGuard from "src/_components/RouteLeavingGuard";
import { Printer } from "./Print";
import { PatientService, Package, SiteInfoService } from "src/_services";
import clsx from "clsx";
import { dateToString, stringToDate } from "src/_helpers";
import qs from "query-string";
import { Gender, PersonalType, DiscountTypeOption } from "src/_constants";
const defaultForm = {
  PersonalType: "1",
  SiteId: null,
  SiteCode: "NONE",

  ContractNo: "",
  ContractDate: null,
  ContractOwner: null, // {Fullname, Username}
  ContractOwnerAd: "",
  ContractOwnerFullName: "",

  DoctorConsult: null,
  DoctorConsultAd: "",
  DoctorConsultFullName: "",
  DepartmentId: "",

  PackageId: null,
  PolicyId: null,

  StartAt: null,
  EndAt: null,
  IsMaternityPackage: false,
  EstimateBornDate: null,

  IsDiscount: false,
  DiscountType: "0",
  DiscountNote: "",
  DiscountAmount: 0,
  NetAmount: null,
  PatientModel: {},
  Services: null,
  Policy: null,
};
class CustomerRegisterForm extends BaseComponent {
  constructor(props) {
    super(props);
    this.defaultFilter = {
      Search: "",
    };
    this.state = {
      formData: defaultForm,
      customer: null,
      reseter: false,
      error: {},
      rawData: "",
      siteInfo: {},
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSiteIdChange = this.handleSiteIdChange.bind(this);
    this.applyDiscount = this.applyDiscount.bind(this);
    this.submit = this.submit.bind(this);
    this.print = this.print.bind(this);
  }
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.location !== prevProps.location) {
      this.getData();
    }
  }
  isValidateData() {
    var error = {};
    const { formData } = this.state;
    if (!formData.SiteId) error["SiteId"] = "N??i k??ch ho???t g??i l?? b???t bu???c";
    if (!formData.PackageId) error["PackageId"] = "G??i l?? b???t bu???c";
    if (!formData.StartAt) error["StartAt"] = "Ng??y b???t ?????u l?? b???t bu???c";
    if (!formData.EndAt) error["EndAt"] = "Ng??y k???t th??c l?? b???t bu???c";
    if (formData.IsDiscount) {
      if (!formData.DiscountAmount)
        error["DiscountAmount"] = "M???c gi???m l?? b???t bu???c";
      if (!formData.DiscountNote)
        error["DiscountNote"] = "L?? do gi???m l?? b???t bu???c";
    }
    this.setState({ error });
    return Object.keys(error).length === 0;
  }
  applyDiscount() {
    this.getService();
  }
  submit(e) {
    e.preventDefault();
    if (this.isValidateData()) {
      const { formData, customer } = this.state;
      new PatientService()
        .createPackage({
          ...formData,
          DiscountType: formData.IsDiscount ? formData.DiscountType : '0',
          PatientModel: customer,
          ContractOwnerFullName: formData.ContractOwner
            ? formData.ContractOwner.Fullname
            : "",
          ContractOwnerAd: formData.ContractOwner
            ? formData.ContractOwner.Ad
            : "",
          DoctorConsultFullName: formData.DoctorConsult
            ? formData.DoctorConsult.Fullname
            : "",
          DoctorConsultAd: formData.DoctorConsult
            ? formData.DoctorConsult.Ad
            : "",
        })
        .then((response) => {
          this.updateFormData("submited", true);
          this.print(
            "/Customer/Detail/" +
              response.PatientInPackageId +
              "/" +
              customer.PID
          );
        });

      // submit
    }
  }
  handleSiteIdChange(e) {
    setTimeout(() => {
      this.resetDataWhenSiteSelect(e);
    }, 10);
  }
  handleChange(e) {
    const { value, name, type, checked, _obj } = e.target;
    this.updateFormData(name, type === "checkbox" ? checked : value || "");
    if (name === "PersonalType") {
      this.handlePersonalTypeChange(e);
    }
    if (name === "PackageId") {
      this.resetDataWhenPackageSelect();
      this.updateFormData("PackageName", _obj ? _obj.Name : '');
      this.updateFormData("IsMaternityPackage",  _obj ? _obj.IsMaternityPackage : false);
      setTimeout(() => {
        this.getPolicy();
      }, 100);
    }
    if (name === "IsDiscount") {
      if (!checked) {
        this.updateFormData("NetAmount", 0);
        this.updateFormData('DiscountType', '0')
      } else {
        this.updateFormData('DiscountType', '1')
      }
      setTimeout(() => {
        this.getService();
      }, 200);
    }
    setTimeout(() => {
      this.discountCalculated();
    }, 100);
  }
  handlePersonalTypeChange() {
    this.setState({ reseter: true });
    this.updateFormData("DepartmentId", null);
    this.updateFormData("PackageId", null);
    this.resetDataWhenPackageSelect();
    setTimeout(() => {
      this.setState({ reseter: false });
    }, 100);
  }
  updateFormData(name, value) {
    let valueUpdate = {};
    valueUpdate[name] = value;
    this.setState((prevState) => {
      let formData = Object.assign({}, prevState.formData);
      formData = { ...formData, ...valueUpdate };
      return { formData };
    });
  }
  async componentDidMount() {
    if (this.isNew()) {
      await this.getCustomer();
    }
    this.getData();
  }
  getPolicy() {
    if (!this.state.formData.PackageId) return false;
    new Package({
      sitecode: this.state.formData.SiteCode,
      personaltype: this.state.formData.PersonalType,
      applydate: "",
    })
      .find("PricePolicyAvailable/" + this.state.formData.PackageId)
      .then((response) => {
        if (response.model && response.model.length) {
          this.updateFormData("Policy", response.model[0]);
          this.updateFormData("PolicyId", response.model[0].PolicyId);
          setTimeout(() => {
            this.getService();
          }, 10);
        } else {
          this.alert("L???i", "Kh??ng t??m th???y th??ng tin gi?? t????ng ???ng");
        }
      });
  }
  getService() {
    const { formData } = this.state;
    var pkgamountafterdiscount = formData.IsDiscount ? formData.NetAmount : formData.Policy.Amount
    new PatientService({
      pkgamountafterdiscount: pkgamountafterdiscount
    })
      .find("service/" + this.state.formData.Policy.PolicyId)
      .then((response) => {
        if (response.Results && response.Results.length) {
          var ServicesData = response.Results;
          ServicesData.sort((a, b) => {
            return a.IsPackageDrugConsum - b.IsPackageDrugConsum;
          });
          this.updateFormData("Services", ServicesData);
          this.updateFormData(
            "Total",
            response.Results.reduce((a, b) => {
              return a + b["PkgAmount"];
            }, 0)
          );
        } else {
          this.alert("L???i", "Kh??ng t??m th???y chi ti???t b???ng d???ch v??? v?? gi??");
        }
      });
  }
  resetDataWhenPackageSelect() {
    this.setState({ reseter: true });
    // this.updateFormData('StartAt', null)
    // this.updateFormData('EndAt', null)
    this.updateFormData("NetAmount", null);
    this.updateFormData("PolicyId", null);
    this.updateFormData("Policy", null);
    this.updateFormData("IsMaternityPackage", false);
    this.updateFormData("EstimateBornDate", null);
    this.updateFormData("IsDiscount", false);
    this.updateFormData("DiscountType", "0");
    this.updateFormData("DiscountNote", "");
    this.updateFormData("DiscountAmount", 0);
    this.updateFormData("Services", null);
    setTimeout(() => {
      this.setState({ reseter: false });
    }, 100);
  }
  resetDataWhenSiteSelect(site) {
    this.setState({ reseter: true });
    this.updateFormData("SiteCode", site.ApiCode);
    this.updateFormData("DepartmentId", null);
    this.updateFormData("PackageId", null);
    this.resetDataWhenPackageSelect();
    setTimeout(() => {
      this.setState({ reseter: false });
    }, 100);
  }
  isNew() {
    return this.props.match.params.id === "new";
  }
  async getCustomer() {
    var query = qs.parse(this.props.location.search);
    new PatientService({ Pid: query.Pid }).all().then((response) => {
      if (response.Results && response.Results.length === 1) {
        this.setState({ customer: response.Results[0] });
      } else {
        this.alert("L???i", "Kh??ng t??m th???y th??ng tin Kh??ch h??ng");
      }
    });
  }
  print(url) {
    const { formData } = this.state;
    new SiteInfoService().find(formData.SiteCode).then((rep) => {
      this.setState({ siteInfo: rep[0] });
      setTimeout(() => {
        this.htmlToPaper("print-me");
        setTimeout(() => {
          this.alert("", "B???n ???? ????ng k?? g??i th??nh c??ng");
          this.props.history.push(url);
        }, 400);
      }, 200);
    });
  }
  getData() {
    this.queryToState();
    this.setState({ rawData: JSON.stringify(this.state.formData) });
  }
  discountCalculated() {
    const { DiscountType, DiscountAmount, Policy, IsDiscount } = this.state.formData;
    var NetAmount = 0;
    if (!Policy || !DiscountAmount || !IsDiscount) {
      NetAmount = 0;
      if (Policy) NetAmount = Policy.Amount;
    } else {
      if (DiscountType === "1")
        NetAmount = Policy.Amount - (Policy.Amount * DiscountAmount) / 100;
      if (DiscountType === "2") NetAmount = Policy.Amount - DiscountAmount;
    }
    this.updateFormData("NetAmount", NetAmount);
    // Policy.Amount, NetAmount
  }
  changedData() {
    const { formData, rawData } = this.state;
    return JSON.stringify(formData) !== rawData && !formData.submited;
  }
  errorText(key) {
    const { error } = this.state;
    if (error[key])
      return <div className="srv-validation-message">{error[key]}</div>;
  }
  packageDrugConsum() {
    const { formData, showext } = this.state;
    const getIcon = (type) => {
      return type
        ? "fa fa-fw fa-caret-up pointer"
        : "fa fa-fw fa-caret-down pointer";
    };
    var hasData = formData.Services.filter((e) => e.IsPackageDrugConsum);
    if (hasData.length === 0) return null;
    var startIndex = formData.Services.filter(
      (e) => !e.IsPackageDrugConsum && e.ServiceType === 1
    ).length;
    var chils = formData.Services.filter((e) => e.ServiceType === 2);
    return (
      <>
        {hasData.map((item, index) => {
          return (
            <>
              {true && (
                <tr key={index + startIndex}>
                  <td className="text-right">{index + startIndex + 1}</td>
                  <td>
                    {chils.length > 0 && (
                      // <i
                      //   onClick={() => this.setState({ showext: !showext })}
                      //   className={getIcon(showext)}
                      //   aria-hidden="true"
                      // ></i>
                      <></>
                    )}
                    {item.Service.Code + " - " + item.Service.ViName}
                  </td>
                  <td className="text-right">{item.Qty}</td>
                  <td>
                    <CurrencyText noValue={"0"} value={item.PkgPrice} />
                  </td>
                  <td>
                    <CurrencyText noValue={"0"} value={item.PkgAmount} />
                  </td>
                  <td>
                    {item.ItemsReplace && item.ItemsReplace.length ? (
                      <>
                        <span
                          data-for={
                            item.Id +
                            (item.ServiceType + "") +
                            (index + "") +
                            "x"
                          }
                          data-tip
                        >
                          {item.ItemsReplace.length} d???ch v??? thay th???
                        </span>
                        <ReactTooltip
                          id={
                            item.Id +
                            (item.ServiceType + "") +
                            (index + "") +
                            "x"
                          }
                          type="info"
                        >
                          <div className="v-tootip">
                            <div className="v-tootip-header">
                              D???ch v??? thay th???
                            </div>
                            <div className="v-tootip-body text-left">
                              {item.ItemsReplace.map((e) => {
                                return (
                                  <p>
                                    {e.Code || "-"} - {e.ViName || "-"}
                                  </p>
                                );
                              })}
                            </div>
                          </div>
                        </ReactTooltip>
                      </>
                    ) : (
                      ""
                    )}
                  </td>
                </tr>
              )}
            </>
          );
        })}
        {true && (
          <>
            {chils.map((item, index) => {
              return (
                <>
                  <tr key={index + startIndex + hasData.length}>
                    <td className="text-right">
                      {index + startIndex + hasData.length + 1}
                    </td>
                    <td>
                      {item.Service.Code + " - " + item.Service.ViName}
                    </td>
                    <td className="text-right">{item.Qty}</td>
                    <td>
                      <CurrencyText noValue={"0"} value={item.PkgPrice} />
                    </td>
                    <td>
                      <CurrencyText noValue={"0"} value={item.PkgAmount} />
                    </td>
                    <td>
                      {item.ItemsReplace && item.ItemsReplace.length ? (
                        <>
                          <span
                            data-for={
                              item.Id +
                              (item.ServiceType + "") +
                              (index + "") +
                              "y"
                            }
                            data-tip
                          >
                            {item.ItemsReplace.length} d???ch v??? thay th???
                          </span>
                          <ReactTooltip
                            id={
                              item.Id +
                              (item.ServiceType + "") +
                              (index + "") +
                              "y"
                            }
                            type="info"
                          >
                            <div className="v-tootip">
                              <div className="v-tootip-header">
                                D???ch v??? thay th???
                              </div>
                              <div className="v-tootip-body text-left">
                                {item.ItemsReplace.map((e) => {
                                  return (
                                    <p>
                                      {e.Code || "-"} - {e.ViName || "-"}
                                    </p>
                                  );
                                })}
                              </div>
                            </div>
                          </ReactTooltip>
                        </>
                      ) : (
                        ""
                      )}
                    </td>
                  </tr>
                </>
              );
            })}
          </>
        )}
      </>
    );
  }
  servicesList() {
    const { formData, customer, reseter, siteInfo } = this.state;
    var isShowAll = true
    // formData.Services.filter((e) => e.IsPackageDrugConsum).length === 0;
    return (
      <>
        <CCard>
          <CCardBody>
            <h3 className="text-center">B???ng d???ch v??? v?? gi??</h3>
            <p className="text-center">
              <b>L??u ??:</b> M???c gi?? d?????i ????y ???????c l???y t???i th???i ??i???m ????ng k?? g??i
              v?? ??p d???ng trong su???t qu?? tr??nh s???a d???ng g??i c???a KH
            </p>
            <p className="text-right">
              <i>(<b>????n v??? t??nh gi??:</b> VN??)</i>
            </p>
            <table className="table cd-table cd-table-bordered cd-table-bordered">
              <thead className="thead-dark">
                <tr>
                  <th className="text-right" width="1" scope="col">
                    STT
                  </th>
                  <th scope="col">M?? - T??n d???ch v???</th>
                  <th scope="col" width="1" className="nowrap">
                    ?????nh m???c
                  </th>
                  <th scope="col" width="1" className="nowrap">
                    ????n gi?? trong g??i
                  </th>
                  <th scope="col" width="1" className="nowrap">
                    Th??nh ti???n trong g??i
                  </th>
                  <th scope="col">D???ch v??? thay th???</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td></td>
                  <td
                    className="text-center font-bold"
                    style={{ color: "red" }}
                  >
                    T???NG
                  </td>
                  <td></td>
                  <td></td>
                  <td className="font-bold-all" style={{ color: "red" }}>
                    <CurrencyText noValue={"0"}  value={formData.Total} />
                  </td>
                  <td></td>
                </tr>
                {formData.Services.filter(
                  (e) =>
                    isShowAll || (!e.IsPackageDrugConsum && e.ServiceType === 1)
                ).map((item, index) => {
                  return (
                    <>
                      {
                        <tr key={index}>
                          <td className="text-right">{index + 1}</td>
                          <td>
                            {item.Service.Code + " - " + item.Service.ViName}
                          </td>
                          <td className="text-right">{item.Qty}</td>
                          <td>
                            <CurrencyText noValue={"0"} value={item.PkgPrice} />
                          </td>
                          <td>
                            <CurrencyText
                              noValue={"0"}
                              value={item.PkgAmount}
                            />
                          </td>
                          <td>
                            {item.ItemsReplace && item.ItemsReplace.length ? (
                              <>
                                <span
                                  data-for={
                                    item.Id +
                                    (item.ServiceType + "") +
                                    (index + "") +
                                    "z"
                                  }
                                  data-tip
                                >
                                  {item.ItemsReplace.length} d???ch v??? thay th???
                                </span>
                                <ReactTooltip
                                  id={
                                    item.Id +
                                    (item.ServiceType + "") +
                                    (index + "") +
                                    "z"
                                  }
                                  type="info"
                                >
                                  <div className="v-tootip">
                                    <div className="v-tootip-header">
                                      D???ch v??? thay th???
                                    </div>
                                    <div className="v-tootip-body text-left">
                                      {item.ItemsReplace.map((e) => {
                                        return (
                                          <p>
                                            {e.Code || "-"} - {e.ViName || "-"}
                                          </p>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </ReactTooltip>
                              </>
                            ) : (
                              ""
                            )}
                          </td>
                        </tr>
                      }
                    </>
                  );
                })}
                {!isShowAll && <>{this.packageDrugConsum()} </>}
              </tbody>
            </table>
          </CCardBody>
          <CCardFooter className="text-right">
            <CButton
              type="button"
              color="secondary"
              onClick={() => this.goBack()}
            >
              H???y
            </CButton>{" "}
            {formData.submited && (
              <CButton
                type="button"
                color="secondary"
                onClick={() => this.print()}
              >
                In
              </CButton>
            )}{" "}
            <CButton type="submit" color="primary">
              L??u
            </CButton>
          </CCardFooter>
          <Printer
            customer={customer}
            formData={formData}
            siteInfo={siteInfo}
            price={formData.IsDiscount ? formData.NetAmount : formData.Policy.Amount}
          />
        </CCard>
      </>
    );
  }
  render() {
    const { formData, customer, reseter } = this.state;
    if (!customer) return <Loading />;
    console.log(formData.DiscountType)
    return (
      <>
        <RouteLeavingGuard
          when={this.changedData()}
          navigate={(path) => {
            this.props.history.push(path);
          }}
          shouldBlockNavigation={(location) => {
            return true;
          }}
          yes="Yes"
          no="No"
          content="B???n ch??a l??u d??? li???u, b???n c?? ch???c ch???n mu???n h???y kh??ng?"
        />
        <CForm onSubmit={this.submit.bind(this)}>
          <CRow>
            <CCol xl={4} md={3}>
              <CCard>
                <CCardHeader>
                  <b>Th??ng tin kh??ch h??ng</b>
                </CCardHeader>
                <CCardBody>
                  <table className="table table-noborder">
                    <tbody>
                      <tr>
                        <th className="nowrap" width="40%">
                          H??? v?? t??n:
                        </th>
                        <td>{customer.FullName}</td>
                      </tr>
                      <tr>
                        <th>PID:</th>
                        <td>{customer.PID}</td>
                      </tr>
                      <tr>
                        <th className="nowrap">Ng??y sinh:</th>
                        <td>{dateToString(customer.DateOfBirth)}</td>
                      </tr>
                      <tr>
                        <th>Gi???i t??nh:</th>
                        <td>{Gender[customer.Gender]}</td>
                      </tr>
                      <tr>
                        <th>S??T:</th>
                        <td>{customer.Mobile}</td>
                      </tr>
                      <tr>
                        <th>?????a ch???:</th>
                        <td>{customer.Address}</td>
                      </tr>
                      <tr>
                        <th>
                          ?????i t?????ng <span className="required-text">*</span>:
                        </th>
                        <td>
                          <InputSelect
                            name="PersonalType"
                            options={PersonalType}
                            defaultValue={formData.PersonalType}
                            applyCallback={this.handleChange}
                          />
                        </td>
                      </tr>
                      <tr>
                        <th>
                          N??i k??ch ho???t g??i{" "}
                          <span className="required-text">*</span>:
                        </th>
                        <td>
                          <SiteSelect
                            name="SiteId"
                            defaultValue={formData.SiteId}
                            applyCallback={this.handleChange}
                            applyCallbackWithObject={this.handleSiteIdChange}
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </CCardBody>
              </CCard>
              <CCard>
                <CCardHeader>
                  <b>Th??ng tin h???p ?????ng</b>
                </CCardHeader>
                <CCardBody>
                  <table className="table table-noborder">
                    <tbody>
                      <tr>
                        <th className="nowrap" width="40%">
                          S??? h???p ?????ng:
                        </th>
                        <td>
                          <InputText
                            name="ContractNo"
                            value={formData.ContractNo}
                            placeholder="Nh???p S??? h???p ?????ng"
                            type="text"
                            onChange={this.handleChange}
                          />
                        </td>
                      </tr>
                      <tr>
                        <th className="nowrap">Ng??y h???p ?????ng:</th>
                        <td>
                          <div className="controls">
                            <VDatePicker
                              placeholder=" / /"
                              name="ContractDate"
                              value={formData.ContractDate}
                              onChange={this.handleChange}
                            />
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <th>T??n nh??n vi??n ph??? tr??ch:</th>
                        <td>
                          <div className="controls">
                            <AdInput
                              name="ContractOwner"
                              value={formData.ContractOwner}
                              applyCallback={this.handleChange}
                            />
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </CCardBody>
              </CCard>
              <CCard>
                <CCardHeader>
                  <b>Th??ng tin B??c s?? t?? v???n</b>
                </CCardHeader>
                <CCardBody>
                  <table className="table table-noborder">
                    <tbody>
                      <tr>
                        <th className="nowrap" width="40%">
                          B??c s??:
                        </th>
                        <td>
                          <div className="controls">
                            <AdInput
                              name="DoctorConsult"
                              value={formData.DoctorConsult}
                              applyCallback={this.handleChange}
                            />
                          </div>
                        </td>
                      </tr>
                      {!reseter && (
                        <tr>
                          <th>Khoa ph??ng:</th>
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
                      )}
                    </tbody>
                  </table>
                </CCardBody>
              </CCard>
            </CCol>
            <CCol
              xl={8}
              md={9}
              className={clsx({
                "no-site-selected": !formData.SiteId,
                "no-package-selected": !formData.PackageId,
              })}
            >
              <CCard>
                <CCardHeader>
                  <b>Th??ng tin g??i d???ch v???</b>
                </CCardHeader>
                <CCardBody>
                  {!reseter && (
                    <table className="table table-noborder">
                      <tbody>
                        <tr>
                          <th className="nowrap" width="1%">
                            M??/ T??n g??i <span className="required-text">*</span>
                            :
                          </th>
                          <td className="p-2 min-w-250">
                            <div className="max-w-500">
                              <PackageInputSelect
                                name="PackageId"
                                defaultValue={formData.PackageId}
                                onChange={this.handleChange}
                                query={{
                                  Sites: formData.SiteId,
                                  Status: 1,
                                  IsShowExpireDate: false,
                                  IsAvailable: true,
                                }}
                              />
                            </div>
                          </td>
                          <th className="max-w-140 min-w-80 need-package-selected">
                            Th???i gian ??p d???ng{" "}
                            <span className="required-text">*</span>:
                          </th>
                          <td
                            width="300px"
                            className="p-2 need-package-selected"
                            colSpan="2"
                          >
                            <div className="d-flex align-items-center justify-content-between">
                              <div className="d-flex align-items-center">
                                <span className="p-1">T???</span>{" "}
                                <div className="min-w-110">
                                  <VDatePicker
                                    placeholder=" / /"
                                    minDate={stringToDate(
                                      formData.ContractDate
                                    )}
                                    maxDate={stringToDate(formData.EndAt)}
                                    name="StartAt"
                                    value={formData.StartAt}
                                    onChange={this.handleChange}
                                  />
                                  {this.errorText("StartAt")}
                                </div>
                              </div>
                              <div className="d-flex align-items-center">
                                <span className="p-1">?????n</span>{" "}
                                <div className="min-w-110">
                                  <VDatePicker
                                    placeholder=" / /"
                                    minDate={stringToDate(formData.StartAt)}
                                    name="EndAt"
                                    value={formData.EndAt}
                                    onChange={this.handleChange}
                                  />
                                  {this.errorText("EndAt")}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                        <tr className="need-package-selected">
                          <th className="nowrap" width="1%">
                            Gi?? g??i:
                          </th>
                          <td className="p-2">
                            <div className="d-flex align-items-center justify-content-start">
                              {formData.Policy && (
                                <>
                                  <CurrencyText
                                    value={formData.Policy.Amount}
                                    unit="VN??"
                                  />
                                </>
                              )}
                            </div>
                          </td>
                          <td className="" colSpan="3">
                            <div className="d-flex align-items-center justify-content-between">
                              {/* <CFormGroup
                                variant="custom-checkbox"
                                className="form-group mb-0 custom-control-2 d-flex align-items-center justify-content-between"
                              >
                                <CInputCheckbox
                                  custom
                                  id={"IsMaternityPackage"}
                                  name="IsMaternityPackage"
                                  checked={formData.IsMaternityPackage}
                                  onChange={this.handleChange}
                                />
                                <CLabel
                                  variant="custom-checkbox"
                                  className="nowrap"
                                  htmlFor={"IsMaternityPackage"}
                                >
                                  G??i thai s???n
                                </CLabel>
                              </CFormGroup> */}
                              {formData.IsMaternityPackage && (
                                <div className="d-flex align-items-center justify-content-end pr-2">
                                  <b className="pr-1 nowrap">Ng??y d??? sinh:</b>{" "}
                                  <div className="min-w-110">
                                    <VDatePicker
                                      placeholder=" / /"
                                      name="EstimateBornDate"
                                      value={formData.EstimateBornDate}
                                      onChange={this.handleChange}
                                      minDate={new Date()}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                        <tr className="need-package-selected">
                          {/* <th className="nowrap" width="1%">
                            Thu???c & VTTH:
                          </th>
                          <td className="p-2">
                            {formData.Policy && (
                              <>
                                {formData.Policy.Package.IsLimitedDrugConsum
                                  ? "Theo ?????nh m???c"
                                  : "Kh??ng theo ?????nh m???c"}
                              </>
                            )}
                          </td> */}
                          <td colSpan="3">
                            <CFormGroup
                              variant="custom-checkbox"
                              className="form-group mb-0 custom-control-2"
                            >
                              <CInputCheckbox
                                custom
                                id={"IsDiscount"}
                                name="IsDiscount"
                                checked={formData.IsDiscount}
                                onChange={this.handleChange}
                              />
                              <CLabel
                                className="nowrap"
                                variant="custom-checkbox"
                                htmlFor={"IsDiscount"}
                              >
                                Gi???m gi?? chi???t kh???u
                              </CLabel>
                            </CFormGroup>
                          </td>
                        </tr>
                        {formData.IsDiscount && (
                          <>
                            <tr className="need-package-selected">
                              <th className="nowrap" width="1%">
                                M???c gi???m{" "}
                                <span className="required-text">*</span>:
                              </th>
                              <td className="p-2">
                                <div className="d-flex align-items-center justify-content-end">
                                  <div className="flex-grow-1">
                                    {formData.DiscountType === "1" ? (
                                      <NumerInput
                                        min={1}
                                        max={100}
                                        name="DiscountAmount"
                                        value={formData.DiscountAmount}
                                        placeholder="Nh???p"
                                        type="text"
                                        onChange={this.handleChange}
                                      />
                                    ) : (
                                      <CurrencyInputText
                                        name="DiscountAmount"
                                        value={formData.DiscountAmount}
                                        onChange={this.handleChange}
                                      />
                                    )}
                                  </div>
                                  <div
                                    className="mini-input-item ml-2 sty2"
                                    style={{ width: "85px" }}
                                  >
                                    <InputSelect
                                      options={DiscountTypeOption}
                                      name="DiscountType"
                                      defaultValue={formData.DiscountType}
                                      applyCallback={this.handleChange}
                                      noSearchable={true}
                                    />
                                  </div>
                                </div>
                                {this.errorText("DiscountAmount")}
                              </td>
                              <td width="180px" colSpan="3">
                                <div className="d-flex align-items-center justify-content-start">
                                  <b className="mr-1">Gi?? g??i sau gi???m: </b>{" "}
                                  <CurrencyText
                                    value={formData.NetAmount || 0}
                                    unit="VN??"
                                    noValue={'0'}
                                  />
                                </div>
                              </td>
                            </tr>
                            <tr className="need-package-selected">
                              <th className="nowrap" width="1%">
                                L?? do gi???m gi??{" "}
                                <span className="required-text">*</span>:
                              </th>
                              <td colSpan="4" className="p-2">
                                <div className="d-flex align-items-center justify-content-end">
                                  <InputTextarea
                                    name="DiscountNote"
                                    id="DiscountNote"
                                    className="form-control"
                                    minRows="1"
                                    value={formData.DiscountNote}
                                    onChange={this.handleChange}
                                    placeholder="Nh???p L?? do gi???m gi??"
                                  />
                                  <CButton
                                    onClick={() => this.applyDiscount()}
                                    className="nowrap ml-2"
                                    color="warning"
                                  >
                                    ??p d???ng
                                  </CButton>
                                </div>
                                {this.errorText("DiscountNote")}
                              </td>
                            </tr>
                          </>
                        )}
                      </tbody>
                    </table>
                  )}
                </CCardBody>
              </CCard>
              {formData.Services !== null &&
                formData.Policy !== null &&
                this.servicesList()}
            </CCol>
          </CRow>
        </CForm>
      </>
    );
  }
}
export default CustomerRegisterForm;
