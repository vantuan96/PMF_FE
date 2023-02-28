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
      message: 'Việc mở lại gói có thể dẫn tới các rủi ro về tài chính, cần có xác nhận từ Lãnh đạo Khoa/Phòng. Bạn có chắc chắn mở lại gói này?',
      buttons: [
        {
          label: "Hủy",
        },
        {
          label: "Đồng ý",
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
          label: "Hủy",
        },
        {
          label: "Đồng ý",
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
              Sau khi Hủy gói, giá các dịch vụ sẽ được cập nhật về giá lẻ. Bạn
              không thể áp dụng lại giá trong gói. Khách hàng sẽ không thể sử
              dụng các dịch vụ còn lại trong gói. Bạn có chắc chắn muốn{" "}
              <b>Hủy gói</b>?
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
              Sau khi Hủy gói, giá các dịch vụ sẽ được cập nhật về giá lẻ. Bạn
              không thể áp dụng lại giá trong gói. Khách hàng sẽ không thể sử
              dụng các dịch vụ còn lại trong gói. Bạn có chắc chắn muốn{" "}
              <b>Hủy gói</b>?
            </>
          );
        if (Status === 402) {
          new PatientService()
            .update("Package/Terminated", {
              patientinpackageid: this.props.match.params.id,
              isconfirmaction: true,
            })
            .then(() => {
              this.alertDone("Hủy gói thành công");
            });
        }
      });
  }
  alertDone(msg) {
    confirmAlert({
      message: msg,
      buttons: [
        {
          label: "Đồng ý",
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
          label: "Hủy",
        },
        {
          label: "Đồng ý",
          onClick: () => {
            new PatientService()
              .update("Package/Terminated", {
                patientinpackageid: this.props.match.params.id,
                isconfirmaction: true,
              })
              .then(() => {
                this.alertDone("Hủy gói thành công");
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
          label: "Hủy",
        },
        {
          label: "Đồng ý",
          onClick: () => {
            new PatientService()
              .update("Package/Cancelled", {
                patientinpackageid: this.props.match.params.id,
                isconfirmaction: true,
              })
              .then(() => {
                this.alertDone("Hủy gói thành công");
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
              Sau khi Hủy gói, Khách hàng sẽ không thể sử dụng gói này, Bạn có
              chắc chắn muốn <b>Hủy gói</b>?
            </>
          );
        if (Status === 302) this.terminated();
        // this.cancelConfirm(<>Sau khi Hủy gói, giá các dịch vụ sẽ được cập nhật về giá lẻ. Bạn không thể áp dụng lại giá trong gói. Khách hàng sẽ không thể sử dụng các dịch vụ còn lại trong gói. Bạn có chắc chắn muốn <b>Hủy gói</b>?</>)
      });
  }
  close() {
    confirmAlert({
      message: (
        <>
          Bạn cần chắc chắn đã áp dụng giá gói cho các dịch vụ trước khi thực
          hiện Đóng gói. Sau khi gói bị đóng, Khách hàng sẽ không thể tiếp tục
          sử dụng gói này. Bạn có chắc chắn muốn <b>Đóng gói</b> ?
        </>
      ),
      buttons: [
        {
          label: "Hủy",
        },
        {
          label: "Đồng ý",
          onClick: () => {
            new PatientService()
              .update("Package/Closed", {
                patientinpackageid: this.props.match.params.id,
              })
              .then((response) => {
                this.alertDone("Đóng gói thành công");
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
              Thống kê chỉ định dịch vụ trong gói
            </h3>
          </CModalHeader>
          {isOpen && (
            <CModalBody>
              <table className="table table-noborder">
                <tbody>
                  <tr>
                    <th>PID:</th>
                    <td>{StatisticWhenCancelled.PID}</td>
                    <th>Mã - Tên gói:</th>
                    <td>
                      {StatisticWhenCancelled.PackageCode} -{" "}
                      {StatisticWhenCancelled.PackageName}
                    </td>
                  </tr>
                  <tr>
                    <th>Tên Khách hàng:</th>
                    <td>{StatisticWhenCancelled.PatientName}</td>
                    <th>Thời gian áp dụng:</th>
                    <td>
                      {dateToString(StatisticWhenCancelled.StartAt)} -{" "}
                      {dateToString(StatisticWhenCancelled.EndAt)}
                    </td>
                  </tr>
                  <tr>
                    <th className="nowrap w1 pr-2">
                      Giá gói sau giảm giá, chiết khấu:
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
                  (<b>Đơn vị tính giá:</b> VNĐ)
                </i>
              </p>
              <table className="table cd-table cd-table-bordered cd-table-bordered">
                <thead className="thead-dark text-center">
                  <tr>
                    <th width="1" className="nowrap" rowSpan="2">
                      STT
                    </th>
                    <th rowSpan="2">Mã - Tên dịch vụ</th>
                    <th rowSpan="2">Thời gian chỉ định</th>
                    <th rowSpan="2" width="1" className="nowrap">
                      Visit No.
                    </th>
                    <th rowSpan="2" width="1" className="nowrap">
                      Số lượng
                    </th>
                    <th colSpan="2">Giá trong gói</th>
                    <th colSpan="2">Giá sau hủy</th>
                  </tr>
                  <tr>
                    <th>Đơn giá</th>
                    <th>Thành tiền</th>
                    <th>Đơn giá</th>
                    <th>Thành tiền</th>
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
                              <b>TỔNG</b>
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
                              <b>PHẢI THU KHÁCH HÀNG</b>
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
                              <b>PHẢI TRẢ KHÁCH HÀNG</b>
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
                        Không có dữ liệu
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
              Quay lại
            </CButton>
            {StatisticWhenCancelled &&
              StatisticWhenCancelled.Details &&
              StatisticWhenCancelled.Details.length > 0 && (
                <CButton color="primary" onClick={() => this.Cancelled()}>
                  Hủy gói
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
              Xác nhận chỉ định thuộc gói
            </h3>
          </CModalHeader>
          {isOpen && (
            <CModalBody>
              <table className="table table-noborder mb-2">
                <tbody>
                  <tr>
                    {(!ListToConfirm.Visits || ListToConfirm.Visits.length === 0) ? <><th>PID:</th>
                    <td className="pr-1">{ListToConfirm.PID}</td>
                    <th className="pr-1" width="">Tên KH:</th>
                    <td className="pr-1">{ListToConfirm.PatientName}</td></> : null}
                    <th className="pr-1">Mã gói:</th>
                    <td className="pr-1">{ListToConfirm.PackageCode}</td>
                    <th className="pr-1" width="60px">Tên gói:</th>
                    <td className="pr-1" colSpan="5">{ListToConfirm.PackageName}</td>
                  </tr>
                  {ListToConfirm.Visits ? ListToConfirm.Visits.map(visit => {
                  return (<tr>
                    <th>PID:</th>
                    <td className="pr-1">{visit.PID}</td>
                    <th className="pr-1">Tên KH:</th>
                    <td className="pr-1">{visit.PatientName}</td>
                    <th width="70px">Visit No.:</th>
                    <td className="pr-1">{visit.VisitCode}</td>
                    <th className="pr-1">Nơi khám:</th>
                    <td className="pr-1">
                      {visit.SiteCode} - {visit.SiteName}
                    </td>
                    <th className="pr-1">Ngày khám:</th>
                    <td className="pr-1">{visit.VisitDate}</td>
                  </tr>)
                  }) : ''}
                </tbody>
              </table>
              <div>
                <span className="fa fa-exclamation-triangle"></span>
                <b className="text-danger"> Lưu ý: </b>Danh sách dưới đây chỉ
                gồm các chỉ định chưa xuất bảng kê trên OH và chưa được ghi nhận
                vào gói hoặc đã ghi nhận vào gói nhưng có thay đổi về giá
              </div>
              <p className="text-right">
                <i>
                  (<b>Đơn vị tính giá:</b> VNĐ)
                </i>
              </p>
              <table className="table cd-table cd-table-bordered cd-table-bordered">
                <thead className="thead-dark text-center">
                  <tr>
                    <th>Mã - Tên dịch vụ</th>
                    <th>Thời gian chỉ định</th>
                    <th width="90px">
                      Định mức còn lại
                    </th>
                    <th width="1" className="nowrap">
                      Số lượng
                    </th>
                    <th>Đơn giá</th>
                    <th>Thành tiền</th>
                    <th>Ghi chú</th>
                  </tr>
                </thead>
                {ListToConfirm.listCharge &&
                ListToConfirm.listCharge.length ? (
                  <tbody>
                    {hasInPackage && (
                      <tr>
                        <th colSpan="8">Trong gói</th>
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
                        <th colSpan="8">Vượt gói</th>
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
                              Dịch vụ trong gói có Số lượng/Lần chỉ định > Định
                              mức còn lại
                            </b>
                          </p>{" "}
                          Hệ thống sẽ không ghi nhận lần sử dụng và cập nhật giá
                          gói cho các chỉ định vượt quá số Định mức còn lại. Vui
                          lòng tách charge trên OH và thực hiện lại chức năng
                          này!{" "}
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
                        Không có dữ liệu
                      </td>
                    </tr>
                  </tbody>
                )}
              </table>
            </CModalBody>
          )}
          <CModalFooter>
            <CButton color="secondary" onClick={() => this.setModal()}>
              Hủy
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
                  Áp dụng
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
                Các dịch vụ sau có trong gói{" "}
                <b>
                  {_ListToConfirm.PackageCode} - {_ListToConfirm.PackageName}
                </b>{" "}
                và một số gói dịch vụ khác mà KH đang sử dụng. Tích chọn vào chỉ
                định nếu muốn chuyển sang ghi nhận vào gói. Bạn có thể không
                chọn chỉ định và ấn <b>Tiếp tục</b> nếu không muốn thay đổi.
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
                    <th>Mã - Tên dịch vụ</th>
                    <th>Thời gian chỉ định</th>
                    <th width="1" className="nowrap">
                      Số lượng
                    </th>
                    <th>Gói đã ghi nhận dịch vụ</th>
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
              Hủy
            </CButton>
            <CButton color="primary" onClick={() => this.nextToConfirm2()}>
              Tiếp tục
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
            {"Hết hiệu lực"} ({items.length})
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
              (Mã gói: {data ? data.PackageCode : ""})
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
                      Được nâng cấp từ gói <b>{data.FromPackageCode} - {data.FromPackageName}</b> ngày {dateToString(
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
                        gói ngày{" "}
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
                        thành gói <b>{data.PackageTranferCode} - {data.PackageTranferName}</b> ngày{" "}
                        {dateToString(
                          data.TransferredAt
                        )}{" "}
                      </div>
                    )}
                  </div>
                  <div>
                    <b>Trạng thái gói:</b>{" "}
                    {
                      (
                        PackageStatus.find(
                          (e) => e.value === "" + data.Status
                        ) || {}
                      ).label
                    }
                    {(data.Status === 2 || data.Status === 6) &&
                    <CButton onClick={() => this.reload()} color="info" size="sm" title="Cập nhật giá gói">
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
                          <CNavLink>Tình hình sử dụng gói</CNavLink>
                        </CNavItem>
                        <CNavItem>
                          <CNavLink>Thông tin lượt khám</CNavLink>
                        </CNavItem>
                        <CNavItem>
                          <CNavLink>Thông tin khác</CNavLink>
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
        Hủy gói
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
        Mở lại gói
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
          Xuất file <i className="fa fa-fw fa-bars" aria-hidden="true"></i>
        </CDropdownToggle>
        <CDropdownMenu placement="top-start">
          {hasPermissions('ADMINPATIENTINPACKAGE_PATIENTINPACKAGEEXPORTSERVICEUSINGAPI') &&
          <CDropdownItem onClick={() => this.exportExcel()}>
            Bảng Tình hình sử dụng gói
          </CDropdownItem>
          }
          {hasPermissions('ADMINPATIENTINPACKAGE_PRINTPACKAGREGISTRATIONFORMAPI') &&
          <CDropdownItem onClick={() => this.print()}>
            Phiếu đăng ký gói
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
        Đóng gói
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
        Nâng cấp gói
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
        Áp dụng giá gói
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
      tx = 'Được nâng cấp từ gói' + data.FromPackageCode + ' - ' + data.FromPackageName
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
                      Đăng ký gói
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
