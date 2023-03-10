import React from "react";
import BaseComponent from "src/_components/BaseComponent";
import {
  CCol,
  CRow,
  CTabContent,
  CTabPane,
  CCard,
  CCardBody,
  CTabs,
  CNav,
  CNavItem,
  CNavLink,
  CListGroupItem,
  CListGroup,
  CButton,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CInputCheckbox,
  CFormGroup,
  CLabel,
  CDropdown, CDropdownToggle, CDropdownMenu, CDropdownItem
} from "@coreui/react";
import clsx from "clsx";
import CustomerInfo from "./CustomerInfo";
import UsePackageInfo from "./UsePackageInfo";
import VisitInfo from "./VisitInfo";
import Other from "./Other";
import Child from "./Child"
import { PackageStatus, PackageStatus2 } from "src/_constants";
import { Loading, BlockBtnForm } from "src/_components";
import { PatientService, SiteInfoService } from "src/_services";
import { CurrencyText } from "src/_components";
import { confirmAlert } from "react-confirm-alert";
import { dateToString, hasPermissions, saveByteArray } from "src/_helpers";
import {Printer} from '../Register/Print'
const getIcon = (type) => {
  return type
    ? "fa fa-fw fa-angle-double-left"
    : "fa fa-fw fa-angle-double-right";
};
const getIcon2 = (type) => {
  return type ? "fa fa-fw fa-minus" : "fa fa-fw fa-plus";
};
class CustomerDetail extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {
      data: null,
      list: null,
      expand: false,
      loading: true,
      ListToConfirm: null,
      _ListToConfirm: null,
      StatisticWhenCancelled: null,
      siteInfo: null
    };
    this.applyPrice = this.applyPrice.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
    this.saveListToConfirm = this.saveListToConfirm.bind(this);
  }
  componentDidMount() {
    this.reset();
    this.getData();
  }
  componentDidUpdate(prevProps) {
    if (this.props.location !== prevProps.location) {
      console.log('here')
      this.reset();
      this.getData();
    }
  }
  handleCheckboxChange(e) {
    const { value, name, checked } = e.target;
    const { _ListToConfirm } = this.state;
    if (name === "checkall") {
      _ListToConfirm.listCharge.forEach((e) => {
        if (e.IsBelongOtherPackakge) {
          e.IsChecked = checked
        }
      });
    } else {
      _ListToConfirm.listCharge.forEach((e, index) => {
        if (value === e.HisChargeId) {
          e.IsChecked = checked;
        }
      })
    }
    setTimeout(() => {
      this.setState({ _ListToConfirm: _ListToConfirm });
    }, 100);
  }
  print () {
    const { data } = this.state;
    new SiteInfoService().find(data.SiteCode).then((rep) => {
      this.setState({ siteInfo: rep[0] });
      setTimeout(() => {
        this.htmlToPaper("print-me");
      }, 200);
    });
  }
  reset() {
    this.setState({ loading: true });
    this.setState({ list: null });
    this.setState({ data: null });
    setTimeout(() => {
      this.setState({ loading: false });
    }, 100);
  }
  getData() {
    new PatientService({ PID: this.props.match.params.pid, PageSize: 9999 })
      .getPackage()
      .then((response) => {
        this.setState({
          list: response.Results.map((e, index) => {
            e.STT = index + 1;
            return { ...e.PatientInformation, ...e };
          }),
        });
      })
      .catch((e) => {});
  }
  applyPrice(listChargeUncheck) {
    new PatientService({listChargeUncheck})
      .find("Package/Charge/ListToConfirm/" + this.props.match.params.id)
      .then(({ model }) => {
        var IsBelongOtherPackakge =
          model.listCharge &&
          model.listCharge.find((e) => e.IsBelongOtherPackakge);
        if (IsBelongOtherPackakge) {
          this.setState({ _ListToConfirm: model });
        } else {
          this.setState({ ListToConfirm: model });
        }
        // IsBelongOtherPackakge
      });
  }
  applyPriceForStep2(listChargeUncheck) {
    new PatientService({listChargeUncheck})
      .find("Package/Charge/ListToConfirm/" + this.props.match.params.id)
      .then(({ model }) => {
        this.setState({ ListToConfirm: model });
      });
  }
  reopen () {
    confirmAlert({
      message: 'Vi???c m??? l???i g??i c?? th??? d???n t???i c??c r???i ro v??? t??i ch??nh, c???n c?? x??c nh???n t??? L??nh ?????o Khoa/Ph??ng. B???n c?? ch???c ch???n m??? l???i g??i n??y?',
      buttons: [
        {
          label: "H???y",
        },
        {
          label: "?????ng ??",
          onClick: () => {
            this.submitReopen()
          },
        },
      ],
    });
  }
  submitReopen () {
    const { data } = this.state;
    new PatientService()
      .update("ReOpenPatientInPackageAPI/", {
        Id: this.props.match.params.id,
        PatientId: data.PatientModel.Id
      })
      .then(() => {
        this.reload();
      }).catch(e => {
      });
  }
  saveListToConfirm() {
    const { ListToConfirm } = this.state;
    new PatientService()
      .update("Package/ServiceConfirm/", {
        ...ListToConfirm,
        Id: this.props.match.params.id,
      })
      .then(() => {
        this.reload();
      }).catch(e => {
        if (e.data && e.data.MessageCode === 'CONFIRM_BELONG_PACKAGE_CURRENTPATIENT_INPACKAGE_ISOTHER') {
          this.setModal()
        }
      });
  }
  setModal() {
    this.setState({ ListToConfirm: null });
  }
  setStatisticWhenCancelledModel() {
    this.setState({ StatisticWhenCancelled: null });
  }
  upgrade() {
    new PatientService()
      .find(
        "Package/Transferred_CheckExistInvoiced/" + this.props.match.params.id
      )
      .then(({ Message, PackageCode }) => {
        if (Message && Message.Code === "MSG31_TRANSFERRED_CONFIRM") {
          this.upgradeConfirm(Message.ViMessage);
        } else {
        }
      });
  }
  upgradeConfirm(msg) {
    confirmAlert({
      message: msg,
      buttons: [
        {
          label: "H???y",
        },
        {
          label: "?????ng ??",
          onClick: () => {
            this.props.history.push(
              "/Customer/Upgrade/" + this.props.match.params.id
            );
          },
        },
      ],
    });
  }
  terminated() {
    new PatientService()
      .update("Package/Terminated", {
        patientinpackageid: this.props.match.params.id,
        isconfirmaction: false,
      })
      .then((Status) => {
        if (Status === 402)
          this.terminatedConfirm(
            <>
              Sau khi H???y g??i, gi?? c??c d???ch v??? s??? ???????c c???p nh???t v??? gi?? l???. B???n
              kh??ng th??? ??p d???ng l???i gi?? trong g??i. Kh??ch h??ng s??? kh??ng th??? s???
              d???ng c??c d???ch v??? c??n l???i trong g??i. B???n c?? ch???c ch???n mu???n{" "}
              <b>H???y g??i</b>?
            </>
          );
        if (Status === 1001) this.statisticWhenCancelled();
      });
  }
  statisticWhenCancelled() {
    this.setState({ StatisticWhenCancelled: null });
    new PatientService()
      .find(
        "Package/Charge/StatisticWhenCancelled/" + this.props.match.params.id
      )
      .then(({ model }) => {
        this.setState({ StatisticWhenCancelled: model });
      });
  }
  Cancelled() {
    new PatientService()
      .update("Package/Terminated", {
        patientinpackageid: this.props.match.params.id,
        isconfirmaction: false,
      })
      .then((Status) => {
        // this.reload()
        if (Status === 1001)
          this.terminatedConfirm(
            <>
              Sau khi H???y g??i, gi?? c??c d???ch v??? s??? ???????c c???p nh???t v??? gi?? l???. B???n
              kh??ng th??? ??p d???ng l???i gi?? trong g??i. Kh??ch h??ng s??? kh??ng th??? s???
              d???ng c??c d???ch v??? c??n l???i trong g??i. B???n c?? ch???c ch???n mu???n{" "}
              <b>H???y g??i</b>?
            </>
          );
        if (Status === 402) {
          new PatientService()
            .update("Package/Terminated", {
              patientinpackageid: this.props.match.params.id,
              isconfirmaction: true,
            })
            .then(() => {
              this.alertDone("H???y g??i th??nh c??ng");
            });
        }
      });
  }
  alertDone(msg) {
    confirmAlert({
      message: msg,
      buttons: [
        {
          label: "?????ng ??",
          onClick: () => {
            this.reload();
          },
        },
      ],
    });
  }
  terminatedConfirm(message) {
    confirmAlert({
      message: message,
      buttons: [
        {
          label: "H???y",
        },
        {
          label: "?????ng ??",
          onClick: () => {
            new PatientService()
              .update("Package/Terminated", {
                patientinpackageid: this.props.match.params.id,
                isconfirmaction: true,
              })
              .then(() => {
                this.alertDone("H???y g??i th??nh c??ng");
              });
          },
        },
      ],
    });
  }
  cancelConfirm(message) {
    confirmAlert({
      message: message,
      buttons: [
        {
          label: "H???y",
        },
        {
          label: "?????ng ??",
          onClick: () => {
            new PatientService()
              .update("Package/Cancelled", {
                patientinpackageid: this.props.match.params.id,
                isconfirmaction: true,
              })
              .then(() => {
                this.alertDone("H???y g??i th??nh c??ng");
              });
          },
        },
      ],
    });
  }
  cancel() {
    new PatientService()
      .update("Package/Cancelled", {
        patientinpackageid: this.props.match.params.id,
        isconfirmaction: false,
      })
      .then(({ Status }) => {
        if (Status === 402)
          this.cancelConfirm(
            <>
              Sau khi H???y g??i, Kh??ch h??ng s??? kh??ng th??? s??? d???ng g??i n??y, B???n c??
              ch???c ch???n mu???n <b>H???y g??i</b>?
            </>
          );
        if (Status === 302) this.terminated();
        // this.cancelConfirm(<>Sau khi H???y g??i, gi?? c??c d???ch v??? s??? ???????c c???p nh???t v??? gi?? l???. B???n kh??ng th??? ??p d???ng l???i gi?? trong g??i. Kh??ch h??ng s??? kh??ng th??? s??? d???ng c??c d???ch v??? c??n l???i trong g??i. B???n c?? ch???c ch???n mu???n <b>H???y g??i</b>?</>)
      });
  }
  close() {
    confirmAlert({
      message: (
        <>
          B???n c???n ch???c ch???n ???? ??p d???ng gi?? g??i cho c??c d???ch v??? tr?????c khi th???c
          hi???n ????ng g??i. Sau khi g??i b??? ????ng, Kh??ch h??ng s??? kh??ng th??? ti???p t???c
          s??? d???ng g??i n??y. B???n c?? ch???c ch???n mu???n <b>????ng g??i</b> ?
        </>
      ),
      buttons: [
        {
          label: "H???y",
        },
        {
          label: "?????ng ??",
          onClick: () => {
            new PatientService()
              .update("Package/Closed", {
                patientinpackageid: this.props.match.params.id,
              })
              .then((response) => {
                this.alertDone("????ng g??i th??nh c??ng");
              });
          },
        },
      ],
    });
  }
  statisticWhenCancelledModel() {
    const { StatisticWhenCancelled } = this.state;
    var isOpen = StatisticWhenCancelled !== null;
    return (
      <>
        <CModal
          show={isOpen}
          onClose={() => this.setStatisticWhenCancelledModel()}
          size="xl"
          color="primary"
          closeOnBackdrop={false}
        >
          <CModalHeader closeButton className="text-center">
            <h3 className="text-center font-bold">
              Th???ng k?? ch??? ?????nh d???ch v??? trong g??i
            </h3>
          </CModalHeader>
          {isOpen && (
            <CModalBody>
              <table className="table table-noborder">
                <tbody>
                  <tr>
                    <th>PID:</th>
                    <td>{StatisticWhenCancelled.PID}</td>
                    <th>M?? - T??n g??i:</th>
                    <td>
                      {StatisticWhenCancelled.PackageCode} -{" "}
                      {StatisticWhenCancelled.PackageName}
                    </td>
                  </tr>
                  <tr>
                    <th>T??n Kh??ch h??ng:</th>
                    <td>{StatisticWhenCancelled.PatientName}</td>
                    <th>Th???i gian ??p d???ng:</th>
                    <td>
                      {dateToString(StatisticWhenCancelled.StartAt)} -{" "}
                      {dateToString(StatisticWhenCancelled.EndAt)}
                    </td>
                  </tr>
                  <tr>
                    <th className="nowrap w1 pr-2">
                      Gi?? g??i sau gi???m gi??, chi???t kh???u:
                    </th>
                    <td>
                      <div className="float-left">
                        <CurrencyText
                          value={StatisticWhenCancelled.PkgAmount}
                        />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
              <p className="text-right">
                <i>
                  (<b>????n v??? t??nh gi??:</b> VN??)
                </i>
              </p>
              <table className="table cd-table cd-table-bordered cd-table-bordered">
                <thead className="thead-dark text-center">
                  <tr>
                    <th width="1" className="nowrap" rowSpan="2">
                      STT
                    </th>
                    <th rowSpan="2">M?? - T??n d???ch v???</th>
                    <th rowSpan="2">Th???i gian ch??? ?????nh</th>
                    <th rowSpan="2" width="1" className="nowrap">
                      Visit No.
                    </th>
                    <th rowSpan="2" width="1" className="nowrap">
                      S??? l?????ng
                    </th>
                    <th colSpan="2">Gi?? trong g??i</th>
                    <th colSpan="2">Gi?? sau h???y</th>
                  </tr>
                  <tr>
                    <th>????n gi??</th>
                    <th>Th??nh ti???n</th>
                    <th>????n gi??</th>
                    <th>Th??nh ti???n</th>
                  </tr>
                </thead>
                {StatisticWhenCancelled.Details &&
                StatisticWhenCancelled.Details.length ? (
                  <tbody>
                    {StatisticWhenCancelled.Details.filter(
                      (e) => e.ItemType === 2
                    ).map((item, index) => {
                      return (
                        <>
                          <tr key={index + "o"}>
                            <td className="text-right">{index + 1}</td>
                            <td>
                              {item.ServiceCode} - {item.ServiceName}
                            </td>
                            <td>{item.ChargeDate}</td>
                            <td>{item.VisitCode}</td>
                            <td className="text-right">{item.Qty}</td>
                            <td>
                              <CurrencyText
                                noValue={"0"}
                                value={item.PkgPrice}
                              />
                            </td>
                            <td>
                              <CurrencyText
                                noValue={"0"}
                                value={item.PkgAmount}
                              />
                            </td>
                            <td>
                              <CurrencyText noValue={"0"} value={item.Price} />
                            </td>
                            <td>
                              <CurrencyText noValue={"0"} value={item.Amount} />
                            </td>
                          </tr>
                        </>
                      );
                    })}
                    {StatisticWhenCancelled.Details.filter(
                      (e) => e.ItemType === 0
                    ).map((item, index) => {
                      return (
                        <>
                          <tr key={index + "z"}>
                            <td></td>
                            <td>
                              <b>T???NG</b>
                            </td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td>
                              <CurrencyText
                                noValue={"0"}
                                value={item.PkgAmount}
                              />
                            </td>
                            <td></td>
                            <td>
                              <CurrencyText noValue={"0"} value={item.Amount} />
                            </td>
                          </tr>
                        </>
                      );
                    })}
                    {StatisticWhenCancelled.Details.filter(
                      (e) => e.ItemType === -1
                    ).map((item, index) => {
                      return (
                        <>
                          <tr key={index + "y"}>
                            <td></td>
                            <td>
                              <b>PH???I THU KH??CH H??NG</b>
                            </td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td>
                              <CurrencyText noValue={"0"} value={item.Amount} />
                            </td>
                          </tr>
                        </>
                      );
                    })}
                    {StatisticWhenCancelled.Details.filter(
                      (e) => e.ItemType === -2
                    ).map((item, index) => {
                      return (
                        <>
                          <tr key={index + "x"}>
                            <td></td>
                            <td>
                              <b>PH???I TR??? KH??CH H??NG</b>
                            </td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td>
                              <CurrencyText noValue={"0"} value={item.Amount} />
                            </td>
                          </tr>
                        </>
                      );
                    })}
                  </tbody>
                ) : (
                  <tbody>
                    <tr>
                      <td colSpan="7" className="text-center">
                        Kh??ng c?? d??? li???u
                      </td>
                    </tr>
                  </tbody>
                )}
              </table>
            </CModalBody>
          )}
          <CModalFooter>
            <CButton
              color="secondary"
              onClick={() => this.setStatisticWhenCancelledModel()}
            >
              Quay l???i
            </CButton>
            {StatisticWhenCancelled &&
              StatisticWhenCancelled.Details &&
              StatisticWhenCancelled.Details.length > 0 && (
                <CButton color="primary" onClick={() => this.Cancelled()}>
                  H???y g??i
                </CButton>
              )}
          </CModalFooter>
        </CModal>
      </>
    );
  }
  listToConfirmModal() {
    const { ListToConfirm } = this.state;
    var isOpen = ListToConfirm !== null;
    var hasInPackage = false;
    var hasOutPackage = false;
    var hasWarn = false;
    var bindex = 0;
    if (
      ListToConfirm &&
      ListToConfirm.listCharge &&
      ListToConfirm.listCharge.length
    ) {
      hasInPackage =
        ListToConfirm.listCharge.filter(
          (e) => e.InPackageType === 1 && e.IsChecked
        ).length > 0;
      hasOutPackage =
        ListToConfirm.listCharge.filter(
          (e) => e.InPackageType === 2 && e.IsChecked
        ).length > 0;
      hasWarn =
        ListToConfirm.listCharge.filter(
          (e) => e.InPackageType === 4
        ).length > 0;
    }
    return (
      <>
        <CModal
          show={isOpen}
          onClose={() => this.setModal()}
          size="xl"
          color="primary"
          closeOnBackdrop={false}
        >
          <CModalHeader closeButton className="text-center">
            <h3 className="text-center font-bold">
              X??c nh???n ch??? ?????nh thu???c g??i
            </h3>
          </CModalHeader>
          {isOpen && (
            <CModalBody>
              <table className="table table-noborder mb-2">
                <tbody>
                  <tr>
                    {(!ListToConfirm.Visits || ListToConfirm.Visits.length === 0) ? <><th>PID:</th>
                    <td className="pr-1">{ListToConfirm.PID}</td>
                    <th className="pr-1" width="">T??n KH:</th>
                    <td className="pr-1">{ListToConfirm.PatientName}</td></> : null}
                    <th className="pr-1">M?? g??i:</th>
                    <td className="pr-1">{ListToConfirm.PackageCode}</td>
                    <th className="pr-1" width="60px">T??n g??i:</th>
                    <td className="pr-1" colSpan="5">{ListToConfirm.PackageName}</td>
                  </tr>
                  {ListToConfirm.Visits ? ListToConfirm.Visits.map(visit => {
                  return (<tr>
                    <th>PID:</th>
                    <td className="pr-1">{visit.PID}</td>
                    <th className="pr-1">T??n KH:</th>
                    <td className="pr-1">{visit.PatientName}</td>
                    <th width="70px">Visit No.:</th>
                    <td className="pr-1">{visit.VisitCode}</td>
                    <th className="pr-1">N??i kh??m:</th>
                    <td className="pr-1">
                      {visit.SiteCode} - {visit.SiteName}
                    </td>
                    <th className="pr-1">Ng??y kh??m:</th>
                    <td className="pr-1">{visit.VisitDate}</td>
                  </tr>)
                  }) : ''}
                </tbody>
              </table>
              <div>
                <span className="fa fa-exclamation-triangle"></span>
                <b className="text-danger"> L??u ??: </b>Danh s??ch d?????i ????y ch???
                g???m c??c ch??? ?????nh ch??a xu???t b???ng k?? tr??n OH v?? ch??a ???????c ghi nh???n
                v??o g??i ho???c ???? ghi nh???n v??o g??i nh??ng c?? thay ?????i v??? gi??
              </div>
              <p className="text-right">
                <i>
                  (<b>????n v??? t??nh gi??:</b> VN??)
                </i>
              </p>
              <table className="table cd-table cd-table-bordered cd-table-bordered">
                <thead className="thead-dark text-center">
                  <tr>
                    <th>M?? - T??n d???ch v???</th>
                    <th>Th???i gian ch??? ?????nh</th>
                    <th width="90px">
                      ?????nh m???c c??n l???i
                    </th>
                    <th width="1" className="nowrap">
                      S??? l?????ng
                    </th>
                    <th>????n gi??</th>
                    <th>Th??nh ti???n</th>
                    <th>Ghi ch??</th>
                  </tr>
                </thead>
                {ListToConfirm.listCharge &&
                ListToConfirm.listCharge.length ? (
                  <tbody>
                    {hasInPackage && (
                      <tr>
                        <th colSpan="8">Trong g??i</th>
                      </tr>
                    )}
                    {ListToConfirm.listCharge
                      .filter((e) => e.InPackageType === 1 && e.IsChecked)
                      .map((item, index) => {
                        return (
                          <tr key={index}>
                            <td>
                              {item.ServiceCode} - {item.ServiceName}
                            </td>
                            <td>{item.ChargeDate}</td>
                            <td className="text-right">{item.QtyRemain}</td>
                            <td className="text-right">{item.QtyCharged}</td>
                            <td>
                              <CurrencyText noValue={"0"} value={item.Price} />
                            </td>
                            <td>
                              <CurrencyText noValue={"0"} value={item.Amount} />
                            </td>
                            <td>{item.Notes ? item.Notes.map(e => {return e.ViMessage}).join(', ') : ""}</td>
                          </tr>
                        );
                      })}
                    {hasOutPackage && (
                      <tr>
                        <th colSpan="8">V?????t g??i</th>
                      </tr>
                    )}
                    {ListToConfirm.listCharge
                      .filter((e) => e.InPackageType === 2 && e.IsChecked)
                      .map((item, index) => {
                        return (
                          <tr key={index}>
                            <td>
                              {item.ServiceCode} - {item.ServiceName}
                            </td>
                            <td>{item.ChargeDate}</td>
                            <td className="text-right">{item.QtyRemain}</td>
                            <td className="text-right">{item.QtyCharged}</td>
                            <td>
                              <CurrencyText noValue={"0"} value={item.Price} />
                            </td>
                            <td>
                              <CurrencyText noValue={"0"} value={item.Amount} />
                            </td>
                            <td>{item.Notes ? item.Notes.map(e => {return e.ViMessage}).join(', ') : ""}</td>
                          </tr>
                        );
                      })}
                    {hasWarn && (
                      <tr>
                        <td colSpan="8">
                          <p>
                            <b>
                              D???ch v??? trong g??i c?? S??? l?????ng/L???n ch??? ?????nh > ?????nh
                              m???c c??n l???i
                            </b>
                          </p>{" "}
                          H??? th???ng s??? kh??ng ghi nh???n l???n s??? d???ng v?? c???p nh???t gi??
                          g??i cho c??c ch??? ?????nh v?????t qu?? s??? ?????nh m???c c??n l???i. Vui
                          l??ng t??ch charge tr??n OH v?? th???c hi???n l???i ch???c n??ng
                          n??y!{" "}
                        </td>
                      </tr>
                    )}
                    {ListToConfirm.listCharge
                      .filter((e) => e.InPackageType === 4)
                      .map((item, index) => {
                        return (
                          <tr key={index}>
                            <td>
                              {item.ServiceCode} - {item.ServiceName}
                            </td>
                            <td>{item.ChargeDate}</td>
                            <td className="text-right">{item.QtyRemain}</td>
                            <td className="text-right">{item.QtyCharged}</td>
                            <td>
                              <CurrencyText noValue={"-"} value={item.Price}/>
                            </td>
                            <td>
                              <CurrencyText noValue={"-"} value={item.Amount} />
                            </td>
                            <td>{item.Notes ? item.Notes.map(e => {return e.ViMessage}).join(', ') : ""}</td>
                          </tr>
                        );
                      })}
                  </tbody>
                ) : (
                  <tbody>
                    <tr>
                      <td colSpan="7" className="text-center">
                        Kh??ng c?? d??? li???u
                      </td>
                    </tr>
                  </tbody>
                )}
              </table>
            </CModalBody>
          )}
          <CModalFooter>
            <CButton color="secondary" onClick={() => this.setModal()}>
              H???y
            </CButton>
            {ListToConfirm &&
              ListToConfirm.listCharge &&
              ListToConfirm.listCharge.length > 0 &&
              ListToConfirm.listCharge.filter((e) => e.IsChecked).length >
                0 && (
                <CButton
                  color="primary"
                  onClick={() => this.saveListToConfirm()}
                >
                  ??p d???ng
                </CButton>
              )}
          </CModalFooter>
        </CModal>
      </>
    );
  }
  nextToConfirm2() {
    const { _ListToConfirm } = this.state;
    new PatientService({listChargeUncheck: _ListToConfirm.listCharge.filter(e => !e.IsChecked && e.IsBelongOtherPackakge).map(e => e.ChargeId)})
      .find("Package/Charge/ListToConfirm/" + this.props.match.params.id)
      .then(({ model }) => {
        model.listCharge.forEach(item => {
          item.IsChecked = _ListToConfirm.listCharge.filter(e => e.IsChecked && e.ChargeId === item.ChargeId).length > 0
        })
        this.setState({ ListToConfirm: model });
        this.setState({ _ListToConfirm: null });
      });
  }
  listToConfirmModalWhenHasBelongOtherPackakge() {
    // BelongOtherPackakge
    const { _ListToConfirm } = this.state;
    var isOpen = _ListToConfirm !== null;
    return (
      <>
        <CModal
          show={isOpen}
          onClose={() => this.setState({ _ListToConfirm: null })}
          size="xl"
          color="primary"
          closeOnBackdrop={false}
          // centered={true}
        >
          {isOpen && (
            <>
            <CModalHeader closeButton className="text-left">
              <p className="m-0" style={{color: '#fff'}}>
                C??c d???ch v??? sau c?? trong g??i{" "}
                <b>
                  {_ListToConfirm.PackageCode} - {_ListToConfirm.PackageName}
                </b>{" "}
                v?? m???t s??? g??i d???ch v??? kh??c m?? KH ??ang s??? d???ng. T??ch ch???n v??o ch???
                ?????nh n???u mu???n chuy???n sang ghi nh???n v??o g??i. B???n c?? th??? kh??ng
                ch???n ch??? ?????nh v?? ???n <b>Ti???p t???c</b> n???u kh??ng mu???n thay ?????i.
              </p>
            </CModalHeader>
            <CModalBody>
              <table className="table cd-table cd-table-bordered cd-table-bordered">
                <thead className="thead-dark text-center">
                  <tr>
                    <th>
                      {_ListToConfirm &&
                        _ListToConfirm.listCharge &&
                        _ListToConfirm.listCharge.length > 0 && (
                          <CFormGroup
                            variant="custom-checkbox"
                            className="form-group mb-0 custom-control-2"
                          >
                            <CInputCheckbox
                              custom
                              id={"checkall"}
                              name="checkall"
                              onChange={this.handleCheckboxChange}
                            />
                            <CLabel
                              variant="custom-checkbox"
                              className="nowrap"
                              htmlFor={"checkall"}
                            ></CLabel>
                          </CFormGroup>
                        )}
                    </th>
                    <th>M?? - T??n d???ch v???</th>
                    <th>Th???i gian ch??? ?????nh</th>
                    <th width="1" className="nowrap">
                      S??? l?????ng
                    </th>
                    <th>G??i ???? ghi nh???n d???ch v???</th>
                  </tr>
                </thead>
                <tbody>
                  {_ListToConfirm.listCharge
                    .filter((e) => e.IsBelongOtherPackakge)
                    .map((item, index) => {
                      return (
                        <tr key={index}>
                          <td>
                            <CFormGroup
                              variant="custom-checkbox"
                              className="form-group mb-0 custom-control-2"
                            >
                              <CInputCheckbox
                                custom
                                value={item.HisChargeId}
                                checked={item.IsChecked}
                                id={"check-item" + index + "-" + "a"}
                                name={"check-item" + index + "-" + "a"}
                                onChange={this.handleCheckboxChange}
                              />
                              <CLabel
                                variant="custom-checkbox"
                                className="nowrap"
                                htmlFor={"check-item" + index + "-" + "a"}
                              ></CLabel>
                            </CFormGroup>
                          </td>
                          <td>
                            {item.ServiceCode} - {item.ServiceName}
                          </td>
                          <td>{item.ChargeDate}</td>
                          <td>{item.QtyCharged}</td>
                          <td>
                            {item.WasPackageCode} - {item.WasPackageName}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </CModalBody>
            </>
          )}
          <CModalFooter>
            <CButton
              color="secondary"
              onClick={() => this.setState({ _ListToConfirm: null })}
            >
              H???y
            </CButton>
            <CButton color="primary" onClick={() => this.nextToConfirm2()}>
              Ti???p t???c
            </CButton>
          </CModalFooter>
        </CModal>
      </>
    );
  }
  handleChange(data) {
    this.setState({ data });
  }
  itemsIsExpireDate() {
    const { list, isShowItemExpire } = this.state;
    var items = list.filter((f) => f.IsExpireDate);
    if (items.length === 0) return "";
    return (
      <>
        <CListGroupItem
          href="#"
          color="light"
          className="nowrap p-2"
          onClick={() => this.setState({ isShowItemExpire: !isShowItemExpire })}
        >
          <i className={getIcon2(isShowItemExpire)} aria-hidden="true"></i>
          <span className="text-danger">
            {"H???t hi???u l???c"} ({items.length})
          </span>
        </CListGroupItem>
        {isShowItemExpire && (
          <>
            {items
              .filter((f) => f.IsExpireDate)
              .map((e) => {
                return (
                  <CListGroupItem
                    to={`/Customer/Detail/${e.Id}/${e.PID}`}
                    color="light"
                    className="p-2 pl-3"
                  >
                    {e.Package.PackageCode} - {e.Package.PackageName}
                  </CListGroupItem>
                );
              })}
          </>
        )}
      </>
    );
  }
  infoTable() {
    const { data, loading } = this.state;
    if (loading) return <Loading />;
    return (
      <>
        <div className="flex-grow-1">
          {data && (
            <h5 className="text-center font-bold mb-1">
              {data ? data.PackageName : ""}
            </h5>
          )}
          {data && (
            <h5 className="text-center font-bold mb-1">
              (M?? g??i: {data ? data.PackageCode : ""})
            </h5>
          )}

          <CRow>
            <CCol xl={3} md={3}>
              <CustomerInfo {...this.props} onChange={this.handleChange} />
            </CCol>
            <CCol xl={9} md={9}>
              {data && (
                <div
                  className={clsx({
                    "d-flex mb-1": true,
                    "justify-content-between": [3, 7, 4, 5].includes(data.Status) || (data.TransferredFromAt !== null),
                    "justify-content-end": ![3, 7].includes(data.Status),
                  })}
                >
                  <div>
                    {(data.TransferredFromAt !== null) && <div>
                      ???????c n??ng c???p t??? g??i <b>{data.FromPackageCode} - {data.FromPackageName}</b> ng??y {dateToString(
                        data.TransferredFromAt
                      )}
                    </div>}
                    {[3, 7, 4].includes(data.Status) && (
                      <div>
                        {
                          (
                            PackageStatus.find(
                              (e) => e.value === "" + data.Status
                            ) || {}
                          ).label
                        }{" "}
                        g??i ng??y{" "}
                        {dateToString(
                          data.ClosedAt || data.CancelledAt || data.TerminatedAt
                        )}{" "}
                      </div>
                    )}
                    {[5].includes(data.Status) && (
                      <div>
                        {
                          (
                            PackageStatus.find(
                              (e) => e.value === "" + data.Status
                            ) || {}
                          ).label
                        }{" "}
                        th??nh g??i <b>{data.PackageTranferCode} - {data.PackageTranferName}</b> ng??y{" "}
                        {dateToString(
                          data.TransferredAt
                        )}{" "}
                      </div>
                    )}
                  </div>
                  <div>
                    <b>Tr???ng th??i g??i:</b>{" "}
                    {
                      (
                        PackageStatus.find(
                          (e) => e.value === "" + data.Status
                        ) || {}
                      ).label
                    }
                    {(data.Status === 2 || data.Status === 6) &&
                    <CButton onClick={() => this.reload()} color="info" size="sm" title="C???p nh???t gi?? g??i">
                      <i className="fas fa-sync-alt"></i>
                    </CButton>
                    }
                  </div>
                </div>
              )}
              {data === null ? (
                <Loading />
              ) : (
                <CCard className="mb-0">
                  <CCardBody>
                    <CTabs>
                      <CNav variant="tabs">
                        <CNavItem>
                          <CNavLink>T??nh h??nh s??? d???ng g??i</CNavLink>
                        </CNavItem>
                        <CNavItem>
                          <CNavLink>Th??ng tin l?????t kh??m</CNavLink>
                        </CNavItem>
                        <CNavItem>
                          <CNavLink>Th??ng tin kh??c</CNavLink>
                        </CNavItem>
                      </CNav>
                      <CTabContent>
                        <CTabPane className="h-stl-3">
                          <UsePackageInfo
                            {...this.props}
                            package_fulldata={data}
                          />
                        </CTabPane>
                        <CTabPane className="h-stl-3">
                          <VisitInfo
                            {...this.props}
                            customer={data.PatientModel}
                            formData={data}
                          />
                        </CTabPane>
                        <CTabPane className="h-stl-3">
                          <Other {...this.props} data={data} status={data.Status} />
                          <Child {...this.props} data={data}/>
                        </CTabPane>
                      </CTabContent>
                    </CTabs>
                  </CCardBody>

                  {this.listToConfirmModal()}
                  {this.listToConfirmModalWhenHasBelongOtherPackakge()}
                  {this.statisticWhenCancelledModel()}
                </CCard>
              )}
            </CCol>
          </CRow>
        </div>
      </>
    );
  }
  actionBtnCancel() {
    return (
      <>
      {hasPermissions('ADMINPATIENTINPACKAGE_TERMINATEDPACKAGEAPI') &&
      <CButton type="submit" color="warning" onClick={() => this.cancel()}>
        H???y g??i
      </CButton>
      }
      </>
    );
  }
  reopenBtnCancel() {
    return (
      <>
      {hasPermissions('ADMINPATIENTINPACKAGE_REOPENPATIENTINPACKAGEAPI') &&
      <CButton type="submit" color="warning" onClick={() => this.reopen()}>
        M??? l???i g??i
      </CButton>
      }
      </>
    );
  }
  exportExcel() {
    // Package/Charge/ExportStatisticViaVisit/
    // Package/ExportServiceUsing/
    new PatientService().find('Package/ExportServiceUsing/' + this.props.match.params.id)
      .then((response) => {
        saveByteArray(response.Data.FileName, response.Data.FileData)
      })
  }
  actionBtnExport() {
    return (
      <>
      {hasPermissions(['ADMINPATIENTINPACKAGE_PRINTPACKAGREGISTRATIONFORMAPI', 'ADMINPATIENTINPACKAGE_PATIENTINPACKAGEEXPORTSERVICEUSINGAPI']) &&
      <CDropdown className="dropdown-sm display-inline mr-2 dr-custome" placement="top-start">
        <CDropdownToggle color="info">
          Xu???t file <i className="fa fa-fw fa-bars" aria-hidden="true"></i>
        </CDropdownToggle>
        <CDropdownMenu placement="top-start">
          {hasPermissions('ADMINPATIENTINPACKAGE_PATIENTINPACKAGEEXPORTSERVICEUSINGAPI') &&
          <CDropdownItem onClick={() => this.exportExcel()}>
            B???ng T??nh h??nh s??? d???ng g??i
          </CDropdownItem>
          }
          {hasPermissions('ADMINPATIENTINPACKAGE_PRINTPACKAGREGISTRATIONFORMAPI') &&
          <CDropdownItem onClick={() => this.print()}>
            Phi???u ????ng k?? g??i
          </CDropdownItem>
          }
        </CDropdownMenu>
      </CDropdown>
      }
      </>
    );
  }
  actionBtnClose() {
    return (
      <>
      {hasPermissions('ADMINPATIENTINPACKAGE_CLOSEPACKAGEAPI') &&
      <CButton type="submit" color="info" onClick={() => this.close()}>
        ????ng g??i
      </CButton>
      }
      </>
    );
  }
  actionBtnupgrade() {
    return (
      <>
      {hasPermissions('ADMINPATIENTINPACKAGE_TRANSFERREDPACKAGEAPI') &&
      <CButton type="submit" color="secondary" onClick={() => this.upgrade()}>
        N??ng c???p g??i
      </CButton>
      }
      </>
    );
  }
  actionBtnApplyPrice() {
    return (
      <>
      {hasPermissions('ADMINPATIENTINPACKAGE_CONFIRMCHARGETOINPACKAGEAPI') &&
      <CButton type="submit" color="success" onClick={() => this.applyPrice([])}>
        ??p d???ng gi?? g??i
      </CButton>
      }
      </>
    );
  }
  render() {
    const { list, expand, data, siteInfo } = this.state;
    if (!list) return <Loading />;
    var tx = ''
    if (data && data.TransferredFromAt !== null) {
      tx = '???????c n??ng c???p t??? g??i' + data.FromPackageCode + ' - ' + data.FromPackageName
    }
                      
    return (
      <>
        <div className="d-flex h100 pb-5 mb-5">
          <div
            className={clsx({
              "menu-left": true,
              "mr-3": true,
              "d-flex": true,
              expand: expand,
            })}
          >
            <div className="d-flex align-items-start flex-column">
              <div className="mb-auto w100">
                <div className="text-right">
                  <CButton
                    variant={"outline"}
                    color={"primary"}
                    size={"sm"}
                    className="m-2 pos-re"
                    onClick={() => this.setState({ expand: !expand })}
                  >
                    <i className={getIcon(expand)} aria-hidden="true"></i>
                  </CButton>
                </div>
                {expand && (
                  <div style={{height: 'calc(100vh - 65px - 87px - 60px)', overflow: 'auto'}}>
                    {PackageStatus2.map((status, index) => {
                      return (index === 0 || list.filter(e => (e.Status + '') === status.value).length === 0) ? '' : <CListGroup key={index}>
                      <CListGroupItem color="info" className="p-2">
                        {status.label} ({list.filter(e => (e.Status + '') === status.value).length})
                      </CListGroupItem>
                      {list.map((e) => {
                        return ((e.Status + '') === status.value ?
                          <CListGroupItem
                            to={`/Customer/Detail/${e.Id}/${e.PID}`}
                            color="light"
                            className="p-2"
                          >
                            {e.Package.PackageCode} - {e.Package.PackageName}
                          </CListGroupItem> : ''
                        );
                      })}
                    </CListGroup>
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
          {this.infoTable()}
          {(siteInfo && data) ? <Printer tx={tx} customer={data.PatientModel} formData={data} siteInfo={siteInfo} price={data.NetAmount}/> : <></>}
          {data !== null && (
            <BlockBtnForm>
              <CRow>
                <CCol md="5">
                  {expand && hasPermissions('ADMINPATIENTINPACKAGE_REGISTERPACKAGEAPI') && (
                    <CButton
                      to={`/Customer/Register-Form/new?Pid=${this.props.match.params.pid}`}
                      color="info"
                    >
                      ????ng k?? g??i
                    </CButton>
                  )}
                </CCol>
                <CCol md="7" className="text-right">
                  {this.actionBtnExport()}
                  {[1, 2, 6].includes(data.Status) && (
                    <>
                      {data.Status === 1 && (
                        <>
                          {this.actionBtnCancel()}
                        </>
                      )}
                      {data.Status === 2 && (
                        <>
                          {this.actionBtnupgrade()} {this.actionBtnCancel()}{" "}
                          {this.actionBtnClose()} {this.actionBtnApplyPrice()}
                        </>
                      )}
                      {data.Status === 3 && <></>}
                      {data.Status === 4 && <></>}
                      {data.Status === 5 && <></>}
                      {data.Status === 6 && (
                        <>
                          {this.actionBtnClose()} {this.actionBtnApplyPrice()}
                        </>
                      )}
                      {data.Status === 7 && <></>}
                    </>
                  )}
                  {[7].includes(data.Status) && (
                    <>{this.reopenBtnCancel()}</>
                  )}
                </CCol>
              </CRow>
            </BlockBtnForm>
          )}
        </div>
      </>
    );
  }
}
export default CustomerDetail;
