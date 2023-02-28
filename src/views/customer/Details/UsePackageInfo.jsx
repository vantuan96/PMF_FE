import React from 'react';
import BaseComponent from 'src/_components/BaseComponent'
import {
} from '@coreui/react'
import {
  Loading, CurrencyText
} from 'src/_components'
import clsx from 'clsx'
import { PatientService } from 'src/_services'
import ReactTooltip from "react-tooltip"
const getIcon = type => {
  return type ? 'fa fa-fw fa-caret-up pointer' : 'fa fa-fw fa-caret-down pointer'
}
class UsePackageInfo extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {
      data: null
    };
  }
  componentDidMount() {
    this.getData()
  }
  getData () {
  	new PatientService().find('Package/Service/' + this.props.match.params.id)
      .then(({Results}) => {
        this.setState({data: Results})
      })
  }
  render() {
  	const {data, showext} = this.state
  	const {package_fulldata} = this.props
    console.log(package_fulldata)
    if (data === null) return <Loading/>
    var TotalAmountWasUsed = data.filter(e => !e.ServiceType).reduce((a, b) => { return a + b['AmountWasUsed']}, 0)
  	var TotalAmountNotUsedYet = data.filter(e => !e.ServiceType).reduce((a, b) => { return a + b['AmountNotUsedYet']}, 0)
    var hasChi = data.filter(e => e.ServiceType === 2).length > 0 && data.filter(e => e.IsPackageDrugConsum).length > 0
  	return (<>
      <br/>
      <p className="text-right"><i>(<b>Đơn vị tính giá:</b> VNĐ)</i></p>
  		<table className="table cd-table cd-table-bordered cd-table-bordered">
        <thead className="thead-dark text-center">
          <tr>
            <th rowSpan="2" className="text-right" width="1" scope="col">STT</th>
            <th rowSpan="2" scope="col">Mã - Tên dịch vụ</th>
            <th rowSpan="2" scope="col">Dịch vụ thay thế</th>
            <th rowSpan="2" width="1" className="nowrap">Định mức</th>
            <th rowSpan="2">Đơn giá trong gói</th>
            <th colSpan="3" className="text-center">Đã sử dụng</th>
            <th colSpan="2" className="text-center">Chưa sử dụng</th>
            <th>Vượt gói</th>
          </tr>
          <tr>
            <th scope="col">SL</th>
            <th scope="col">Đã xuất bảng kê</th>
            <th scope="col">TT</th>
            <th scope="col">SL</th>
            <th scope="col">TT</th>
            <th scope="col">SL</th>
          </tr>
        </thead>
        <thead>
        	<tr>
    				<td colSpan="2" className="text-center"><b>Tổng</b></td>
    				<td></td>
    				<td></td>
    				<td></td>
    				<td></td>
    				<td></td>
    				<td><b><CurrencyText noValue={'0'} value={TotalAmountWasUsed}/></b></td>
    				<td></td>
    				<td><b><CurrencyText noValue={'0'} value={TotalAmountNotUsedYet}/></b></td>
    				<td></td>
    			</tr>
        </thead>
        {(hasChi && !package_fulldata.IsLimitedDrugConsum) ?
        <tbody>
        	{data.filter(e => e.ServiceCode).map((item, index) => {
        		return <>
        			<tr className={clsx({
                hidewithcollpase: item.ServiceType === 2 && !showext,
                isDT: item.ServiceType === 2
              })}>
        				<td className="text-right">{index + 1}</td>
        				<td className={clsx({
                    'pl-4': item.ServiceType === 2,
                  })}> {(item.IsPackageDrugConsum) && <i onClick={() => this.setState({ showext: !showext })} className={getIcon(showext)} aria-hidden="true"></i> } {item.ServiceCode} - {item.ServiceName}</td>
        				<td>
                  {(item.ItemsReplace && item.ItemsReplace.filter(e => !e.IsDeleted).length) ?
                    <>
                      <span data-for={item.Id} data-tip>{item.ItemsReplace.filter(e => !e.IsDeleted).length} dịch vụ thay thế</span>
                      <ReactTooltip id={item.Id} type="info">
                        <div className="v-tootip">
                          <div className="v-tootip-header">Dịch vụ thay thế</div>
                          <div className="v-tootip-body text-left">
                            {item.ItemsReplace.filter(e => !e.IsDeleted).map(e => { return <p>{e.ServiceCode || '-'} - {e.ServiceName || '-'}</p> })}
                          </div>
                        </div>
                      </ReactTooltip>
                    </>
                    : ''}
                </td>
                <td className="text-right">{item.Qty || '0'}</td>
        				<td><CurrencyText noValue={'0'} value={item.PkgPrice}/></td>
        				<td className="text-right">{item.QtyWasUsed || '0'}</td>
        				<td className="text-right">{item.QtyWasInvoiced || '0'}</td>
        				<td><CurrencyText noValue={'0'} value={item.AmountWasUsed}/></td>
        				<td className="text-right">{item.QtyNotUsedYet || '0'}</td>
        				<td><CurrencyText noValue={'0'} value={item.AmountNotUsedYet}/></td>
        				<td className="text-right">{item.QtyOver || '0'}</td>
        			</tr>
        		</>
        	})}
        </tbody>
        :
        <tbody>
        	{data.filter(e => e.ServiceCode).map((item, index) => {
        		return <>
        			<tr>
        				<td className="text-right">{index + 1}</td>
        				<td>{item.ServiceCode} - {item.ServiceName}</td>
                <td>
                  {(item.ItemsReplace && item.ItemsReplace.filter(e => !e.IsDeleted).length) ?
                    <>
                      <span data-for={item.Id} data-tip>{item.ItemsReplace.filter(e => !e.IsDeleted).length} dịch vụ thay thế</span>
                      <ReactTooltip id={item.Id} type="info">
                        <div className="v-tootip">
                          <div className="v-tootip-header">Dịch vụ thay thế</div>
                          <div className="v-tootip-body text-left">
                            {item.ItemsReplace.filter(e => !e.IsDeleted).map(e => { return <p>{e.ServiceCode || '-'} - {e.ServiceName || '-'}</p> })}
                          </div>
                        </div>
                      </ReactTooltip>
                    </>
                    : ''}
                </td>
        				<td className="text-right">{item.Qty || '0'}</td>
        				<td><CurrencyText noValue={'0'} value={item.PkgPrice}/></td>
        				<td className="text-right">{item.QtyWasUsed || '0'}</td>
        				<td className="text-right">{item.QtyWasInvoiced || '0'}</td>
        				<td><CurrencyText noValue={'0'} value={item.AmountWasUsed}/></td>
        				<td className="text-right">{item.QtyNotUsedYet || '0'}</td>
        				<td><CurrencyText noValue={'0'} value={item.AmountNotUsedYet}/></td>
        				<td className="text-right">{item.QtyOver || '0'}</td>
        			</tr>
        		</>
        	})}
        </tbody>
        }
      </table>          
  	</>)
  }
}
export default UsePackageInfo