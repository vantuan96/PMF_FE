import moment from "moment-timezone";

export function dateToString(dateTime) {
  if (!dateTime) return null
  return moment(dateTime).format(process.env.REACT_APP_DATE_FORMAT)
}
export function stringToDate(dateTime) {
  if (!dateTime) return null
  return moment(dateTime, process.env.REACT_APP_DATE_FORMAT).toDate()
}
