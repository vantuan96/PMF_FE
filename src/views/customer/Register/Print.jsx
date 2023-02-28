
import Barcode from 'react-barcode'
import { dateToString } from 'src/_helpers'
import { Genders } from 'src/_constants'
import {
  CurrencyText
} from 'src/_components'
export const Printer = ({customer, price, formData, siteInfo}) => (
  <div id="print-me" style={{fontSize: '10pt'}} hidden>
  	<table>
  		<tboby>
  		<tr>
  			<td><img src={'images/logo.png'} alt="logo" height="50" className="c-logo-img" /></td>
  			{siteInfo ? <td >
  				<div className="text-center"style={{fontSize: '12pt'}}><b>{siteInfo.FullNameL}</b></div>
					<div className="text-center" style={{fontSize: '11pt'}}><b>{siteInfo.FullNameE}</b></div>
					<div className="text-center" style={{fontSize: '8pt'}}>Địa chỉ/ Add: {siteInfo.AddressL}</div>
					<div className="text-center" style={{fontSize: '8pt'}}>Điện thoại/ Tel: {siteInfo.Tel} Fax: {siteInfo.Fax} Hotline: {siteInfo.Hotline} EMERGENCY: {siteInfo.Emergency}</div>
  			</td> : ''}
  		</tr>
  		</tboby>
  	</table>
  	<table>
  		<tboby>
  		<tr>
  			<td width="200px"><Barcode value={customer.PID} height={30} displayValue={false} /><div style={{ fontSize: "7pt", textAlign: 'center' }}>Patient HN # {customer.PID}</div></td>
  			<td>
  				<div className="text-center" style={{fontSize: '12pt'}}>PHIẾU ĐĂNG KÝ GÓI</div>
					<div className="text-center" style={{fontSize: '11pt'}}><b>REQUEST ORDER</b></div>
  			</td>
				<td width="200px"></td>
  		</tr>
  		</tboby>
  	</table>
  	<table>
  		<tboby>
				<tr>
          <td>Họ tên Khách hàng/ Patient's Name:</td>
          <td>
            <b className="textUppercase">{customer.FullName}</b>
          </td>
          {/* <td>Ngày sinh/ DOB:</td>
          <td>
            <b>{dateToString(customer.DateOfBirth)}</b>
          </td> */}
          <td>Giới tính/ Sex:</td>
          <td>
            <b>{Genders[customer.Gender]}</b>
          </td>
        </tr>
	  		<tr>
		  		<td>Ngày sinh/ DOB:</td>
		  		<td><b>{dateToString(customer.DateOfBirth)}</b></td>
		  		<td>Điện thoại/ Tel:</td>
		  		<td><b>{customer.Mobile}</b></td>
	  		</tr>
	  		<tr>
		  		<td>Địa chỉ/Address:</td>
		  		<td colSpan="33"><b>{customer.Address}</b></td>
	  		</tr>
	  		<tr>
		  		<td>Ngày đăng ký/ Order Date:</td>
		  		<td colSpan="33"><b>{formData.CreatedAt ? dateToString(formData.CreatedAt) : dateToString(new Date())}</b></td>
	  		</tr>
  		</tboby>
  	</table>
  	<br/>
  	<table className="tbl-border-1">
  		<tboby>
	  		<tr>
		  		<td className="text-center"><b>Tên gói<br/>(Package Name)</b></td>
		  		<td className="text-center" width="200px"><b>Giá tiền<br/>(Price)</b></td>
	  		</tr>
	  		<tr>
		  		<td>{formData.PackageName}</td>
		  		<td className="text-right"><CurrencyText noValue={'0'} value={price} /></td>
	  		</tr>
  		</tboby>
  	</table>
  	<br/>
  	<table>
  		<tboby>
	  		<tr>
		  		<td className="text-right"></td>
		  		<td width="1px">
						<div className="text-center nowrap font16"><b>Người đăng ký / Ordering staff</b></div>
						<div className="text-center nowrap font13"><i>Ký và ghi rõ họ tên / (Sign with full name)</i></div>
					</td>
	  		</tr>
	  		<tr>
		  		<td className="text-right"></td>
		  		<td className="text-right nowrap" width="1px" style={{visibility: 'hidden'}}><i>Ký và ghi rõ họ tên/ <br/>(Sign with full name)</i></td>
	  		</tr>
	  		<tr>
		  		<td className="text-right"></td>
		  		<td className="text-right nowrap" width="1px" style={{visibility: 'hidden'}}><i>Ký và ghi rõ họ tên/ <br/>(Sign with full name)</i></td>
	  		</tr>
	  		<tr>
		  		<td className="text-right"></td>
		  		<td className="text-center"><b>{formData.ContractOwner ? formData.ContractOwner.Fullname : ''}</b></td>
	  		</tr>
  		</tboby>
  	</table>
  </div>
)