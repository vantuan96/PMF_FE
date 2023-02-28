import React, { useState } from "react";
import NumericInput from "react-numeric-input";
import {spliNumber} from "src/_helpers";
export const NumerInput = props => {
  const [defaultValue, setValue] = useState(props.value || null);
  const applyCallback = value => {
    if (value > props.max)
      value = spliNumber(value)
    if (props.min && value < props.min)
      value = props.min
    setValue(value)
    if (props.onChange)
      props.onChange({
        target: {
          name: props.name,
          value: value
        }
      });
  };
  return (
    <>
      {props.readonly ?
        <div className="fake-form-control">{defaultValue || 'NA'}</div>
        :
        <NumericInput
          onChange={applyCallback}
          className="form-control"
          value={defaultValue}
          min={props.min || 0}
          max={props.max || 100}
          step={1}
          precision={0}
          size={5}
          mobile
        />
      }
    </>
  );
};
