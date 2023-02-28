export const CurrencyText = (props) => {
  var val = props.value
  if (['NaN', 'Infinity'].includes(val)) val = 0
  if (typeof val === 'string') val = Number(props.value)
  return (
    <>
      <div className="currency-text text-right currency-tooltip" title={(val || 0).toLocaleString()}>{val ? (Number(val.toFixed(0))).toLocaleString() : (props.noValue || '-')} {props.unit}</div>
    </>
  )
}