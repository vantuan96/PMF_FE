import React, { useState, useEffect } from "react";
import moment from "moment-timezone";
import { VDatePicker } from "./DatePicker"
const format = process.env.REACT_APP_DATE_FORMAT
export const DateRange = props => {
  let start = null;
  let end = null;

  if (props.value && props.value.start) {
    start = props.value.start;
  }
  if (props.value && props.value.end) {
    end = props.value.end;
  }
  const [rangerTime, setRangerValue] = useState({ start, end });
  const applyCallback = (e) => {
    const { name, value } = e.target
    rangerTime[name] = (value)
    setRangerValue({
      start: rangerTime.start,
      end: rangerTime.end
    })
    if (props.onChange) {
      props.onChange({
        target: {
          name: props.name,
          value: rangerTime
        }
      });
    }
  };
  useEffect(() => {
  }, [rangerTime]);
  return (
    <>
      <div className="d-flex">
        <VDatePicker
          name="start"
          placeholder="Từ"
          onChange={(e) => applyCallback(e)}
          value={start}
          maxDate={rangerTime.end ? moment(rangerTime.end, format).toDate() : null}
        />
        <div className="m-1"></div>
        <VDatePicker
          name="end"
          placeholder="Đến"
          onChange={(e) => applyCallback(e)}
          value={end}
          minDate={rangerTime.start ? moment(rangerTime.start, format).toDate() : null}
        />
      </div>
    </>
  );
};
