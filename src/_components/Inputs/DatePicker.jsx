import React, { useState } from "react";
import DatePicker from "react-datepicker";
import moment from "moment-timezone";

const format = process.env.REACT_APP_DATE_FORMAT
export const VDatePicker = (props) => {
  const [value, setValue] = useState(props.value ? moment(props.value, format).toDate() : null);
  const applyCallback = (val) => {
    setValue(val)
    if (props.onChange)
      props.onChange({
        target: {
          name: props.name,
          value: val ? moment(val).format(format) : ''
        }
      });
  };

  return (
    <>
      {props.readonly ?
        <div className="xfake-form-control">{props.value}</div>
        :
        <DatePicker
          showMonthDropdown
          showYearDropdown
          dropdownMode="select"
          className="form-control"
          selected={value}
          onChange={date => applyCallback(date)}
          dateFormat={'dd/MM/yyyy'}
          isClearable
          placeholderText={props.placeholder || 'Chọn ngày'}
          maxDate={props.maxDate}
          minDate={props.minDate}
          // customInput={<DateInput />}
        />
      }
    </>
  );
};