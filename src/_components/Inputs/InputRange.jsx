import React, { useState } from 'react'
import InputRange from 'react-input-range';
import 'react-input-range/lib/css/index.css'
export const VInputRange = (props) => {
  const [inputValue, setInputValue] = useState(props.value);
  const onChange = (e) => {
    setInputValue(e)
    props.onChange({
      target: {
        value: e,
        name: props.name,
        type: 'InputRange'
      }
    })
  }
  return (
    <>
      <div className="p10">
        <InputRange
          name={props.name}
          maxValue={props.max || 100}
          minValue={props.min || 0}
          value={inputValue}
          onChange={(value, e) => onChange(value, e)} />
      </div>
    </>
  )
}