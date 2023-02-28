import CurrencyInput from 'react-currency-input-field';

export const CurrencyInputText = (props) => {
  const applyCallback = (value) => {
    console.log(value)
    if (value < 1) value = -1 * value
    if (props.onChange)
      props.onChange({
        target: {
          name: props.name,
          value: value
        }
      });
  }
  return (
    <>
      {props.readonly ?
        <div className="xfake-form-control">{props.value ? props.value.toLocaleString() : 0}</div>
        :
        <CurrencyInput
          className={"form-control text-right " + props.className}
          name={props.name}
          placeholder={props.placeholder}
          value={props.value}
          decimalsLimit={2}
          onValueChange={applyCallback}
          min={0}
          maxLength={10}
          autoComplete="off"
        />
      }
    </>
  )
}
