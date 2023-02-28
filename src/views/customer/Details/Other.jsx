import React from 'react';
import BaseComponent from 'src/_components/BaseComponent'
import {
  CCard,
  CCardBody,
  CButton,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
} from '@coreui/react'
import {
  VDatePicker,
  AdInput,
  Loading,
  InputText
} from "src/_components";
import { stringToDate } from "src/_helpers";
import { hasPermissions } from "src/_helpers";
import { PatientService } from "src/_services";
import { confirmAlert } from 'react-confirm-alert'
class Other extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {
      customer: null,
      fullData: null,
      isOpen: false,
      formData: {},
      error: {},
      firstData: '',
      minTime: ''
    };
    this.handleChange = this.handleChange.bind(this);
  }
  componentDidMount() {
    this.getData()
  }
  getData () {
  	// new PatientService().find('Package/' + this.props.match.params.id)
     //    .then(({model}) => {
     //      this.setState({customer: model.PatientModel})
     //      this.setState({fullData: model})
     //    })
    this.setState({customer: this.props.data.PatientModel})
    this.setState({fullData: this.props.data})
    this.setState({minTime: stringToDate(this.props.data.EndAt)})
  }
  closePopup () {
    const { formData, firstData } = this.state;
    console.log(firstData, JSON.stringify(formData))
    if (firstData !== JSON.stringify(formData)) {
      confirmAlert({
        message: 'Bạn chưa lưu dữ liệu. Bạn có chắc chắn muốn hủy?',
        buttons: [
          {
            label: 'Hủy'
          },
          {
            label: 'Đồng ý',
            onClick: () => {
              this.setState({ isOpen: false });
            }
          }
        ]
      });
    } else {
      this.setState({ isOpen: false });
    }
  }
  openPopup () {
    const { isOpen, fullData } = this.state;
    var formData = {
      Id : fullData.Id,
      StartAt : fullData.StartAt,
      EndAt : fullData.EndAt,
      ContractNo : fullData.ContractNo,
      ContractDate : fullData.ContractDate,
      ContractOwner: {
        Username: fullData.ContractOwnerAd,
        Ad: fullData.ContractOwnerAd,
        Fullname: fullData.ContractOwnerFullName
      },
      ContractOwnerAd : fullData.ContractOwnerAd,
      ContractOwnerFullName : fullData.ContractOwnerFullName,
      PackageCode : fullData.PackageCode,
      PatientId : fullData.PatientModel.Id
    }
    this.setState({formData})
    
    setTimeout(() => {
      this.setState({ isOpen: !isOpen });
      this.setState({ firstData: JSON.stringify(formData)});
    }, 100)
  }
  handleChange(e) {
    const { value, name, type, checked, } = e.target;
    this.updateFormData(name, type === "checkbox" ? checked : value || "");
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
  isValidateData() {
    var error = {};
    const { formData } = this.state;
    if (!formData.StartAt) error["StartAt"] = "Ngày bắt đầu là bắt buộc";
    if (!formData.EndAt) error["EndAt"] = "Ngày kết thúc là bắt buộc";
    this.setState({ error });
    return Object.keys(error).length === 0;
  }
  submit () {
    const { formData, fullData } = this.state;
    if (this.isValidateData()) {
      var submitData = {
        ...formData, 
        ContractOwnerFullName: formData.ContractOwner
        ? formData.ContractOwner.Fullname
        : "",
        ContractOwnerAd: formData.ContractOwner
          ? formData.ContractOwner.Ad
          : "",
        PackageCode: fullData.PackageCode,
        PatientId: fullData.PatientModel.Id
      }
      new PatientService()
        .update("ScaleUpPatientInPackageAPI/", submitData)
        .then(() => {
          this.reload();
        }).catch(e => {
        });
    }
  }
  errorText(key) {
    const { error } = this.state;
    if (error[key])
      return <div className="srv-validation-message">{error[key]}</div>;
  }
  modalss () {
    const { isOpen, formData, minTime } = this.state;
    return (<>
      <CModal
          show={isOpen}
          onClose={() => this.closePopup()}
          size="xl"
          color="primary"
          closeOnBackdrop={false}
        >
          <CModalHeader className="text-center">
            <h3 className="text-center font-bold">
              Cập nhật thông tin hợp đồng
            </h3>
            <button class="close" onClick={() => this.closePopup()} aria-label="Close">×</button>
          </CModalHeader>

          {isOpen && <CModalBody className="min-heigh-500">
            <table className="table table-noborder">
              <tr>
                <th className="nowrap w1">
                  Thời gian áp dụng{" "}
                  <span className="required-text">*</span>:
                </th>
                <td
                  width="300px"
                  className="p-2"
                  colSpan="3"
                >
                  <div className="d-flex align-items-center justify-contxent-between">
                    <div className="d-flex align-items-center">
                      <span className="p-1">Từ</span>{" "}
                      <div className="min-w-110">
                        {formData.StartAt}
                      </div>
                    </div>
                    <div className="d-flex align-items-center">
                      <span className="p-1">Đến</span>{" "}
                      <div className="min-w-110">
                        <VDatePicker
                          placeholder=" / /"
                          minDate={minTime}
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
              <tr>
                <th className="nowrap w1">
                  Số hợp đồng:
                </th>
                <td className="p-2">
                  <InputText
                    name="ContractNo"
                    value={formData.ContractNo}
                    placeholder="Nhập Số hợp đồng"
                    type="text"
                    onChange={this.handleChange}
                  />
                </td>
                <th className="nowrap p-2 w1">Ngày hợp đồng:</th>
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
                <th className="nowrap w1">Tên nhân viên phụ trách:</th>
                <td className="p-2">
                  <div className="controls">
                    <AdInput
                      name="ContractOwner"
                      value={formData.ContractOwner}
                      applyCallback={this.handleChange}
                    />
                  </div>
                </td>
                <td></td>
                <td></td>
              </tr>
            </table>
          </CModalBody>}
          <CModalFooter>
            <CButton
              color="secondary"
              onClick={() => this.closePopup()}
            >
              Quay lại
            </CButton>
            <CButton color="primary" onClick={() => this.submit()}>
              Lưu
            </CButton>
          </CModalFooter>
        </CModal>
    </>)
  }
  render() {
  	const {customer, fullData} = this.state
    const {status} = this.props
    if (customer === null || fullData === null) return <Loading/>
  	return (<>
  		<CCard>
        <CCardBody>
          <table className="table table-noborder">
            <tbody>
              <tr>
                <th colSpan="5" className="fontSize16">Thông tin hợp đồng </th>
                <td>
                {hasPermissions('ADMINPATIENTINPACKAGE_SCALEUPPATIENTINPACKAGEAPI') && ![3, 4, 5, 7].includes(status) &&
                <CButton type="submit" size="sm" className="float-right" color="warning" onClick={() => this.openPopup()}>
                  <i className="fa fa-edit"></i>
                </CButton>
                }
                </td>
              </tr>
              <tr>
                <th width="100px" className="nowrap">Số hợp đồng:</th>
                <td width="150px" className="p10 nowrap">{fullData.ContractNo}</td>
                <th width="100px" className="nowrap">Ngày hợp đồng:</th>
                <td width="150px" className="p10">{fullData.ContractDate}</td>
                <th className="nowrap w1 p-2">Tên nhân viên phụ trách:</th>
                <td>{fullData.ContractOwnerFullName} {fullData.ContractOwnerAd ? <>({fullData.ContractOwnerAd})</> : ''}</td>
              </tr>
            </tbody>
          </table>
        </CCardBody>
      </CCard>
      <CCard>
        <CCardBody>
          <table className="table table-noborder">
            <tbody>
              <tr>
                <th colSpan="6" className="fontSize16">Thông tin bác sĩ tư vấn</th>
              </tr>
              <tr>
                <th width="100px" className="nowrap">Bác sĩ:</th>
                <td width="150px" className="nowrap p10">{fullData.DoctorConsultFullName} {fullData.DoctorConsultAd ? <>({fullData.DoctorConsultAd})</> : ''}</td>
                <th width="100px" className="nowrap">Khoa phòng:</th>
                <td colSpan="3" className="p10">{fullData.DepartmentName}</td>
              </tr>
            </tbody>
          </table>
        </CCardBody>
      </CCard>
      {this.modalss()}
  	</>)
  }
}
export default Other