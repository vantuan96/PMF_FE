import React, { useState } from 'react'
import moment from "moment-timezone"
import DateTimeRangeContainer from "react-advanced-datetimerange-picker"
import 'react-input-range/lib/css/index.css'
export const VDateTimeRange = (props) => {
  const local = {
    format: props.format,
    sundayFirst: false,
    fromDate: 'Từ ngày',
    toDate: 'Đến ngày',
    customRange: 'Tùy chọn'
  }


  let now = new Date();
  let startAt = moment(
    new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
  );
  let endAt = moment(startAt).add(1, "days").subtract(1, "seconds");

  if (props.value.start) {
    startAt = moment(
      props.value.start, props.format
    );
    endAt = moment(startAt).add(1, "days").subtract(1, "seconds");
  }
  if (props.value.end) {
    endAt = moment(
      props.value.end, props.format
    );
  }

  const ranges = {
    "Ngày hôm nay": [startAt, endAt],
    "3 ngày": [startAt, moment(endAt).add(3, "days").subtract(1, "seconds")],
    "5 ngày": [startAt, moment(endAt).add(5, "days").subtract(1, "seconds")],
    "1 tuần": [startAt, moment(endAt).add(7, "days").subtract(1, "seconds")],
    "2 tuần": [startAt, moment(endAt).add(14, "days").subtract(1, "seconds")],
    "1 tháng": [startAt, moment(endAt).add(1, "months").subtract(1, "seconds")]
  }


  const [rangerTime, setInputValue] = useState(startAt.format(props.format) + ' ~ ' + endAt.format(props.format));
  const applyCallback = (start, end) => {
    setInputValue(start.format(props.format) + ' ~ ' + end.format(props.format));
    props.onChange({
      target: {
        value: {
          start: start.format(props.format),
          end: end.format(props.format)
        },
        name: props.name
      }
    })
  }
  return (
    <>
      <DateTimeRangeContainer
        ranges={ranges}
        start={startAt}
        end={endAt}
        local={local}
        applyCallback={applyCallback}
        smartMode
      // standalone
      // style={{
      //   standaloneLayout: { display: "flex", maxWidth: "fit-content" }
      // }}
      >
        <div className="fake-form-control">{rangerTime || 'Chọn thời gian'}</div>
      </DateTimeRangeContainer>
    </>
  )
}