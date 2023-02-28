export const CurrencyText2 = (props) => {
  var val = props.value
  if (['NaN', 'Infinity'].includes(val)) val = 0
  if (typeof val === 'string') val = Number(props.value)
  return (
    <>
      <>{val ? (Number(val.toFixed(0))).toLocaleString() : (props.noValue || '-')} {props.unit}</>
    </>
  )
}