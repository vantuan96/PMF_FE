export const CurrencyText3 = (props) => {
  var val = props.value
  if (['NaN', 'Infinity'].includes(val)) val = 0
  if (typeof val === 'string') val = Number(props.value)
  return (
    <>
      {val === null ? <div className="currency-text text-right currency-tooltip">-</div> : <div className="currency-text text-right currency-tooltip" title={(val || 0).toLocaleString()}>{val ? (Number(val.toFixed(0))).toLocaleString() : val} {props.unit}</div>}
    </>
  )
}