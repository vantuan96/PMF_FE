import React, { useState, forwardRef } from "react";
import DatePicker from "react-datepicker";
import moment from "moment-timezone";
const format = process.env.REACT_APP_DATETIME_FORMAT
export const VDateTimePicker = (props) => {
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
  const DateInput = forwardRef(
    ({ value, onClick }, ref) => (
      <div className="custom-input" onClick={onClick} ref={ref}>
        {value}
      </div>
    ),
  );
  return (
    <DatePicker
      showTimeSelect
      className="form-control"
      selected={value}
      onChange={date => applyCallback(date)}
      timeFormat="HH:mm"
      dateFormat={'HH:mm dd/MM/yyyy'}
      isClearable
      placeholderText={props.placeholder || 'Chọn ngày'}
      maxDate={props.maxDate}
      minDate={props.minDate}
      customInput={<DateInput />}
    />
  );
};