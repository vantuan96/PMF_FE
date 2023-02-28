import Barcode from "react-barcode";
import { dateToString, sortByKey } from "src/_helpers";
import { Genders } from "src/_constants";
import { CurrencyText } from "src/_components";

const sumQtyByType = (type, arr) => {
  return arr.filter(e => e.InPackageType === type).reduce((a, b) => {
    return a + b["QtyCharged"];
  }, 0)
}
const totalQty = (outPackage, inPackage, type) => {
  console.log(outPackage, inPackage, type)
  return inPackage.filter(e => type.includes(e.InPackageType)).reduce((a, b) => {
    return a + b["QtyCharged"];
  }, 0) + outPackage.reduce((a, b) => {
    return a + b["QtyCharged"];
  }, 0)
}
const totalAmount = (outPackage, inPackage, type) => {
  return inPackage.filter(e => type.includes(e.InPackageType)).reduce((a, b) => {
    return a + b["Amount"];
  }, 0) + outPackage.reduce((a, b) => {
    return a + b["Amount"];
  }, 0)
}
const sumByType = (type, arr) => {
  return arr.filter(e => e.InPackageType === type).reduce((a, b) => {
    return a + b["Amount"];
  }, 0)
}
const sortByCode = (arr, noValue) => {
  var sorted = sortByKey(arr, 'ServiceCode')
  return <>
    {sorted.map((e, indexx) => {
      return <>
          <tr>
            <td className="text-right">{indexx + 1}</td>
            <td>
              {sorted[e][0].ServiceCode}
            </td>
            <td>
              {sorted[e][0].ServiceName}
            </td>
            <td>
              <CurrencyText noValue={noValue} value={sorted[e][0].Price} />
            </td>
            <td>
              <CurrencyText noValue={noValue} value={sorted[e][0].ChargePrice} />
            </td>
            <td className="text-center">
              {sumQtyByType(1, sorted[e]) || ('-')}
            </td>
            <td className="text-center">
              <CurrencyText noValue={noValue} value={sumByType(1, sorted[e])}/>
            </td>
            <td className="text-center">
              {sumQtyByType(2, sorted[e]) || ('-')}
            </td>
            <td className="text-center">
              <CurrencyText noValue={noValue} value={sumByType(2, sorted[e])}/>
            </td>
            <td>
              {sorted[e].map(tt => {
                return <>{tt.Notes ? tt.Notes.map(e => e.ViMessage).join(', ') : ''}</>
              })}
            </td>
          </tr>
    </>
  })}
  </>
}
const isIfNoDuplicateExit = arr => {
  return arr.length > 1 && new Set(arr).size === arr.length
}
const priceItems = (noValue, ChargePrice, arr)  => {
  var nArr = arr.map(e => e.ChargePrice)
  if (isIfNoDuplicateExit(nArr)) return '-'
  return <CurrencyText noValue={noValue} value={ChargePrice} />
}
const GroupedByService = (arr, type, indexxx) => {
  arr = sortByKey(arr, 'ServiceCode')
  var noValue = type === 3 ? '-' : 0
  var grouped = arr.map((e, index) => {
    if (type) e.InPackageType = 2
    e.index = index + 1
    e.noValue = '-'
    e.key = e.ServiceCode
    return e
  }).reduce(function (r, a) {
      r[a.key] = r[a.key] || [];
      r[a.key].push(a);
      return r;
  }, Object.create(null));
  return <>
    {Object.keys(grouped).map((e, indexx) => {
      return <>
          <tr>
            <td className="text-right">{indexx + 1}</td>
            <td>
              {grouped[e][0].ServiceCode}
            </td>
            <td>
              {grouped[e][0].ServiceName}
            </td>
            <td>
              <CurrencyText noValue={noValue} value={grouped[e][0].Price} />
            </td>
            <td>
              {priceItems(noValue, grouped[e][0].ChargePrice, grouped[e])}
            </td>
            <td className="text-center">
              {sumQtyByType(1, grouped[e]) || ('-')}
            </td>
            <td className="text-center">
              <CurrencyText noValue={noValue} value={sumByType(1, grouped[e])}/>
            </td>
            <td className="text-center">
              {sumQtyByType(2, grouped[e]) || ('-')}
            </td>
            <td className="text-center">
              <CurrencyText noValue={noValue} value={sumByType(2, grouped[e])}/>
            </td>
            <td>
              <>{grouped[e][0].Notes ? grouped[e][0].Notes.map(e => e.ViMessage).join(', ') : ''}</>
            </td>
          </tr>
    </>
  })
  }
  <tr>
    <td colSpan="5"><b>({indexxx}) Tổng/ Sum</b></td>
    <td className="text-center">{sumQtyByType(1, arr) || noValue}</td>
    <td><CurrencyText noValue={noValue} value={sumByType(1, arr)}/></td>
    <td className="text-center">{sumQtyByType(2, arr) || (noValue)}</td>
    <td><CurrencyText noValue={noValue} value={sumByType(2, arr)}/></td>
    <td></td>
  </tr>
  </>
}
export const Printer = ({
  customer,
  grouped,
  outPackage,
  total,
  inPackage,
  th7,
  detail,
  formData,
  site
}) => (
  <div id="print-me" style={{ fontSize: "10pt" }}>
    <table>
      <tboby>
        <tr>
          <td>
            <img
              src={"images/logo.png"}
              alt="logo"
              height="50"
              className="c-logo-img"
            />
          </td>
          <td>
            <div className="text-center" style={{ fontSize: "12pt" }}>
              <b>{site.FullNameL}</b>
            </div>
            <div className="text-center" style={{ fontSize: "11pt" }}>
              <b>{site.FullNameE}</b>
            </div>
            <div className="text-center" style={{ fontSize: "8pt" }}>
              Địa chỉ/ Add: {site.AddressL}
            </div>
            <div className="text-center no-wrap" style={{ fontSize: "8pt" }}>
              Điện thoại/ Tel: {site.Tel} Fax: {site.Fax} Hotline: {site.Hotline} EMERGENCY: {site.Emergency}
            </div>
          </td>
        </tr>
      </tboby>
    </table>
    <table>
      <tboby>
        <tr>
          <td width="200px">
            <Barcode value={customer.PID} height={30} displayValue={false} />
            <div style={{ fontSize: "7pt", textAlign: 'center' }}>Patient HN # {customer.PID}</div>
          </td>
          <td>
            <div className="text-center" style={{ fontSize: "12pt" }}>
              BẢNG KÊ THU PHÍ DỊCH VỤ GÓI
            </div>
            <div className="text-center" style={{ fontSize: "11pt" }}>
              <b>LIST OF PACKAGE SERVICES</b>
            </div>
          </td>
        </tr>
      </tboby>
    </table>
    <table>
      <tboby>
        <tr>
          <td>Họ, tên bệnh nhân/ Patient's Name:</td>
          <td>
            <b>{customer.FullName}</b>
          </td>
          <td>Ngày sinh/ DOB:</td>
          <td>
            <b>{dateToString(customer.DateOfBirth)}</b>
          </td>
          <td>Giới tính/ Sex:</td>
          <td>
            <b>{Genders[customer.Gender]}</b>
          </td>
        </tr>
        {/* <tr>
          
          <td>Điện thoại/ Tel:</td>
          <td>
            <b>{customer.Mobile}</b>
          </td>
        </tr> */}
        <tr>
          <td>Địa chỉ/Address:</td>
          <td colSpan="33">
            <b>{customer.Address}</b>
          </td>
        </tr>
        <tr>
          <td>Ngày khám/ Visit date:</td>
          <td>
            <b>{detail.VisitDate}</b>
          </td>
          <td>Visit No:</td>
          <td>
            <b>{detail.VisitCode}</b>
          </td>
        </tr>
      </tboby>
    </table>
    <br />
    <table className="tbl-border-1">
      <>
        <thead className="thead-dark text-center">
          <tr>
            <th className="w1 nowrap" rowSpan="2">STT</th>
            <th rowSpan="2">Mã dịch vụ/ Service code</th>
            <th rowSpan="2">Tên dịch vụ/ Service name</th>
            <th rowSpan="2">Đơn giá gói/ Unit price</th>
            <th rowSpan="2">Đơn giá lẻ/ Unit price over</th>
            <th colSpan="2">Trong gói/ In-package</th>
            <th colSpan="2">Vượt gói/ Over package</th>
            <th rowSpan="2">Ghi chú/ Note</th>
          </tr>
          <tr>
            <th>SL/ QTY</th>
            <th>TT/ Amount</th>
            <th>SL/ QTY</th>
            <th>TT/ Amount</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(grouped).map((e, index) => {
            return (
              <>
                <tr>
                  <th colSpan="8">{e}</th>
                </tr>
                {GroupedByService(grouped[e], 0, index + 1)}
              </>
            );
          })}
        </tbody>
        {outPackage.length > 0 && (
          <tbody>
            <tr>
              <th colSpan="8">Dịch vụ ngoài gói</th>
            </tr>
            {GroupedByService(outPackage, 3, Object.keys(grouped).length + 1)}
          </tbody>
        )}
        <tr>
          <th colSpan="5">
            {outPackage.length > 0 ? <>({Object.keys(grouped).length + 2})</> : `(${Object.keys(grouped).length + 1}) `} = {" "}
            {Object.keys(grouped).map((e, index) => {
              return <>({index + 1}) {index < (Object.keys(grouped).length - 1) ? '+' : (outPackage.length > 0 ? '+' : '')} </>
            })} {outPackage.length > 0 && <>({Object.keys(grouped).length + 1})</>}
            Tổng thanh toán/ (Total Amount)
          </th>
          <td className="text-center">{totalQty(outPackage, inPackage, [1])}</td>
          <th>
            <CurrencyText
              noValue={"0"}
              value={totalAmount(outPackage, inPackage, [1])}
            />
          </th>
          <td className="text-center">{totalQty(outPackage, inPackage, [2])}</td>
          <th><CurrencyText
              noValue={"0"}
              value={totalAmount(outPackage, inPackage, [2])}
            /></th>
          <td></td>
        </tr>
      </>
    </table>
    <br/>
  	<table>
  		<tboby>
	  		<tr>
		  		<td className="text-center"><div className="text-center"><b>Khách hàng (Payor)</b></div><span>Ký và ghi rõ họ tên</span><br/>(Sign with full name)</td>
		  		<td className="text-center"><div className="text-center"><b>Nhân viên thu ngân (Cashier)</b></div><span>Ký và ghi rõ họ tên</span><br/>(Sign with full name)</td>
	  		</tr>
  		</tboby>
  	</table>
  </div>
);
