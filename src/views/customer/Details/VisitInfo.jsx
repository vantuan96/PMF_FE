import React from 'react';
import BaseComponent from 'src/_components/BaseComponent'
import {
	CButton,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
} from '@coreui/react'
import {
  Loading, CurrencyText
} from 'src/_components'
import { PatientService, SiteInfoService } from 'src/_services'
import {Printer} from './Print'
import {
  hasPermissions, cloneObj, saveByteArray
} from 'src/_helpers'
const getIcon = type => {
  return type ? <i className='far fa-check-square' aria-hidden="true"></i> : <i className='far fa-square' aria-hidden="true"></i>
}
class VisitInfo extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {
      data: null,
      detail: null,
      site: {}
    };
  }
  componentDidMount() {
    this.getData()

  }
  getData () {
  	new PatientService().find('Package/Visit/' + this.props.match.params.id)
      .then(({Results}) => {
        this.setState({data: Results})
      })
  }
  getDetail (item) {
    console.log(item)
    new PatientService().find(`Package/Charge/StatisticViaVisit/${item.PID}/?visitcode=${item.VisitCode}`)
      .then(({model}) => {
        this.setState({detail: model})
        this.getSite(model.SiteCode)
      })
  }
  getSite (SiteCode) {
    new SiteInfoService().find(SiteCode).then((rep) => {
      this.setState({site: rep[0]})
    })
  }
  setModal () {
    this.setState({detail: null})
  }
  detailTable () {
    const { detail, site } = this.state;
    if (!detail.Details || detail.Details.length === 0) return (<tr><td colSpan="8" className="text-center">Không có dữ liệu</td></tr>)
    var inPackage = detail.Details.filter(e => (e.InPackageType === 1 || e.InPackageType === 2) && e.ItemType === 2 && !e.IsTotal)
    var grouped = inPackage.map((e, index) => {
      e.index = index + 1
      e.key = e.PackageName + (e.PackageCode ? '(' + e.PackageCode + ')' : '')
      return e
    }).reduce(function (r, a) {
        r[a.key] = r[a.key] || [];
        r[a.key].push(a);
        return r;
    }, Object.create(null));
    var outPackage = detail.Details.filter(e => e.ItemType === 2 && e.InPackageType === 3 && !e.IsTotal)
    var total = detail.Details.filter(e => e.ItemType === 0 && e.IsTotal)
    var th456 = detail.Details.filter(e => e.ItemType === 1 && [1, 2, 3].includes(e.InPackageType) && e.IsTotal)
    var th7 = detail.Details.filter(e => e.ItemType === -1 && e.IsTotal)
    return (
      <>
      <tr hidden>
        <td>
          <Printer
            site={site}
            grouped={cloneObj(grouped)}
            outPackage={cloneObj(outPackage)}
            total={total}
            th456={cloneObj(th456)}
            th7={th7}
            detail={cloneObj(detail)}
            inPackage={cloneObj(inPackage)}
            {...this.props}
          />
        </td>
      </tr>
      <tbody>
        {Object.keys(grouped).map(e => {
        return <>
          <tr><th colSpan="8">{e}</th></tr>
          {grouped[e].map((item, indexx) => {
            return <tr>
              <td className="text-right">{indexx + 1}</td>
              <td>{item.ServiceCode} - {item.ServiceName}</td>
              <td>{item.ChargeDate}</td>
              <td className="text-right">{item.QtyCharged}</td>
              <td><CurrencyText noValue={'0'} value={item.Price}/></td>
              <td><CurrencyText noValue={'0'} value={item.Amount}/></td>
              <td className="text-center">{getIcon(item.InPackageType === 2)}</td>
              <td className="text-center">{getIcon(item.IsInvoiced)}</td>
              <td>{item.Notes ? item.Notes.map(e => {return e.ViMessage}).join(', ') : ""}</td>
            </tr>
          })}
        </>
        })}
      </tbody>
      {outPackage.length > 0 &&
      <tbody>
        <tr><th colSpan="8">Dịch vụ ngoài gói</th></tr>
        {outPackage.map(item => {
            return <tr>
              <td className="text-right">{item.index}</td>
              <td>{item.ServiceCode} - {item.ServiceName}</td>
              <td>{item.ChargeDate}</td>
              <td className="text-right">{item.QtyCharged}</td>
              <td><CurrencyText noValue={'0'} value={item.Price}/></td>
              <td><CurrencyText noValue={'0'} value={item.Amount}/></td>
              <td className="text-center">-</td>
              <td className="text-center">{getIcon(item.IsInvoiced)}</td>
              <td>{item.Notes ? item.Notes.map(e => {return e.ViMessage}).join(', ') : ""}</td>
            </tr>
          })}
      </tbody>
      }
      <tr>
        <th colSpan="2">TỔNG TIỀN</th>
        <td></td>
        <th className="text-right">{(total.reduce((a, b) => { return a + b['QtyCharged']}, 0))}</th>
        <td></td>
        <th><CurrencyText noValue={'0'} value={(total.reduce((a, b) => { return a + b['Amount']}, 0))}/></th>
        <td></td>
        <td></td>
        <td></td>
      </tr>
      {th456.length > 0 &&
      <tbody>
        {th456.map(item => {
            return <tr>
              <td className="text-right">{item.index}</td>
              <td>{item.PackageName}</td>
              <td></td>
              <td className="text-right">{item.QtyCharged}</td>
              <td></td>
              <td><CurrencyText noValue={'0'} value={item.Amount}/></td>
              <td className="text-center">-</td>
              <td className="text-center"></td>
              <td className="text-center"></td>
            </tr>
          })}
      </tbody>
      }
      <tr>
        <th colSpan="2">PHẢI THU</th>
        <td></td>
        <th className="text-right"></th>
        <td></td>
        <th><CurrencyText noValue={'0'} value={(th7.reduce((a, b) => { return a + b['Amount']}, 0))}/></th>
        <td></td>
        <td></td>
        <td></td>
      </tr>
      </>
    )
  }
  exportExcel(item) {
    new PatientService({visitcode: item.VisitCode}).find('Package/Charge/ExportStatisticViaVisit/' + item.PID)
      .then((response) => {
        saveByteArray(response.Data.FileName, response.Data.FileData)
      })
  }
  detailModal () {
    const { detail } = this.state;
    var isOpen = detail !== null
    return (<>
      <CModal
          show={isOpen}
          onClose={() => this.setModal()}
          size="xl"
          color="primary"
          closeOnBackdrop={false}
        >
          <CModalHeader closeButton className="text-center">
            <h3 className="text-center font-bold">Bảng thống kê chỉ định theo lượt khám</h3>
          </CModalHeader>
          {isOpen && <CModalBody>
            <table className="table table-noborder">
              <tbody>
                <tr>
                  <th className="nowrap w1">PID: {" "}</th>
                  <td className="pl-2" >{detail.PID}</td>
                  <th className="nowrap w1">Tên Khách hàng: {" "}</th>
                  <td className="pl-2">{detail.PatientName}</td>
                  <th className="nowrap w1">Visit No.: {" "}</th>
                  <td className="pl-2">{detail.VisitCode}</td>
                  <th className="nowrap w1">Nơi khám: {" "}</th>
                  <td className="pl-2">{detail.SiteCode} - {detail.SiteName}</td>
                  <th className="nowrap w1">Ngày khám: {" "}</th>
                  <td className="pl-2">{detail.VisitDate}</td>
                </tr>
              </tbody>
            </table>
            <p className="text-right"><i>(<b>Đơn vị tính giá:</b> VNĐ)</i></p>
            <table className="table cd-table cd-table-bordered cd-table-bordered">
              <thead className="thead-dark text-center">
                <tr>
                  <th className="w1 nowrap">STT</th>
                  <th>Mã - Tên dịch vụ</th>
                  <th className="w1 nowrap">Thời gian chỉ định</th>
                  <th className="w1 nowrap">SL</th>
                  <th className="w1 nowrap">Đơn giá</th>
                  <th className="w1 nowrap">Thành tiền</th>
                  <th className="w1 nowrap">Vượt gói</th>
                  <th className="w1 nowrap">Đã xuất bảng kê</th>
                  <th className="">Ghi chú</th>
                </tr>
              </thead>
              {this.detailTable()}
            </table>
          </CModalBody>}
          <CModalFooter>
            {hasPermissions('ADMINPATIENTINPACKAGE_EXPORTSTATISTICCHARGEVIAVISITAPI') && 
              <CButton onClick={() => this.exportExcel(detail)} title="Xuất file" color="secondary" size="sm"><i className="fa fa-fw fa-download" aria-hidden="true"></i> Xuất file</CButton>
            }
            {hasPermissions('ADMINPATIENTINPACKAGE_PRINTSTATISTICVIAVISITAPI') && <CButton
              color="secondary"
              onClick={() => this.print()}
            >In</CButton>}
            <CButton
              color="secondary"
              onClick={() => this.setModal()}
            >Đóng</CButton>
          </CModalFooter>
        </CModal>
    </>)
  }
  print () {
    const { formData } = this.props
    this.htmlToPaper('print-me', formData.ContractOwner ? formData.ContractOwner.Fullname : '')
  }
  render() {
  	const {data} = this.state
    const { IsIncludeChild } = this.props.formData
    console.log(IsIncludeChild)
    if (data === null) return <Loading/>
  	return (<>
  		<table className="table cd-table cd-table-bordered cd-table-bordered click-table">
        <thead className="thead-dark text-center">
          <tr>
            <th width="1" scope="col">STT</th>
            <th scope="col">Ngày khám</th>
            {IsIncludeChild && <>
              <th scope="col">PID</th>
              <th scope="col">Họ và tên</th>
            </>}
            <th scope="col">Visit No.</th>
            <th scope="col">Nơi khám</th>
            <th  width="1" scope="col"></th>
          </tr>
        </thead>
        <tbody>
        	{data.length === 0 ? <tr><td colSpan={IsIncludeChild ? 7 : 5} className="text-center">Không có dữ liệu</td></tr> : <>
        	{data.map((item, index) => {
        		return <>
        			<tr>
        				<td onDoubleClick={() => this.getDetail(item)} className="text-right">{index + 1}</td>
        				<td onDoubleClick={() => this.getDetail(item)}>{item.VisitDate}</td>
                {IsIncludeChild && <>
                  <td onDoubleClick={() => this.getDetail(item)}>{item.PID}</td>
                  <td onDoubleClick={() => this.getDetail(item)}>{item.PatientName}</td>
                </>}
        				<td onDoubleClick={() => this.getDetail(item)}>{item.VisitCode}</td>
        				<td onDoubleClick={() => this.getDetail(item)}>{item.SiteName}</td>
        				<td className="nowrap">
                  {hasPermissions('ADMINPATIENTINPACKAGE_GETSTATISTICCHARGEVIAVISITAPI') && <CButton onClick={() => this.getDetail(item)} title="Xem chi tiết" color="secondary" size="sm"><i className="fa fa-fw fa-eye" aria-hidden="true"></i></CButton>} {" "}
                  {hasPermissions('ADMINPATIENTINPACKAGE_EXPORTSTATISTICCHARGEVIAVISITAPI') && <CButton onClick={() => this.exportExcel(item)} title="Xuất file" color="secondary" size="sm"><i className="fa fa-fw fa-download" aria-hidden="true"></i></CButton>}
                </td>
        			</tr>
        		</>
        	})}
        	</>
        	}
        </tbody>
      </table>
      {this.detailModal()}      
  	</>)
  }
}
export default VisitInfo