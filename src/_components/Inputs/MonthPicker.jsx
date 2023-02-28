import React, { Component } from 'react'
import Picker from 'react-month-picker'
export class MonthPicker extends Component {
  constructor(props) {
    super(props)
    this.state = {
      rangeValue: this.getDefaultRangeValue()
    }
    this.pickRange = React.createRef()
  }
  getDefaultRangeValue() {
    const { defaultValue } = this.props
    if (defaultValue && defaultValue.start && defaultValue.end) {
      console.log(defaultValue)
      return { from: this.strToYearMonth(defaultValue.start), to: this.strToYearMonth(defaultValue.end) }
    }
    var now = new Date()
    return { from: { year: 2014, month: 8 }, to: { year: now.getFullYear(), month: now.getMonth() + 1 } }
  }
  strToYearMonth(str) {
    var arr = str.split('-')
    return { year: Number(arr[0]), month: Number(arr[1]) }
  }
  handleRangeChange = (value, x, y) => {
  }
  componentDidUpdate() {
  }
  updateDefaultValue() {
    var now = new Date()
    var rangeValue = {
      from: { year: 2014, month: 12 }, to: { year: now.getFullYear(), month: now.getMonth() + 5 }
    }
    this.setState({ rangeValue })
  }
  onChangeEvent() {
    if (this.props.applyCallback) this.props.applyCallback({
      name: this.props.name,
      value: this.state.rangeValue
    })
  }
  handleRangeDissmis = (value) => {
    var val = value
    var from = value.from
    from.ym = this.yearMonthToNumber(value.from)
    from.fomarted = this.fomartedYearMonth(value.from)
    var to = value.to
    to.ym = this.yearMonthToNumber(value.to)
    to.fomarted = this.fomartedYearMonth(value.to)
    val.to = to
    val.from = from
    this.setState({ rangeValue: val })
    setTimeout(() => {
      this.onChangeEvent()
    }, 10)
  }
  fomartedYearMonth(value) {
    return (`${value.year}-${(value.month > 9 ? value.month : ('0' + value.month))}`)
  }
  yearMonthToNumber(value) {
    return Number.parseInt(`${value.year}${(value.month > 9 ? value.month : ('0' + value.month))}`)
  }
  handleClickMonthBox = (e) => {
    this.pickRange.current.show()
  }
  render() {
    const pickerLang = {
      months: ['Th.1', 'Th.2', 'Th.3', 'Th.4', 'Th.5', 'Th.6', 'Th.7', 'Th.8', 'Th.9', 'Th.10', 'Th.11', 'Th.12'],
      from: 'Từ', to: 'Tới',
    }
    const { rangeValue } = this.state

    const makeText = m => {
      if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
      return '?'
    }
    var currentYear = new Date().getFullYear()
    var currentMonth = new Date().getMonth() + 1
    return (
      <Picker
        years={{min: {year: 2012, month: 1}, max: {year: currentYear, month: currentMonth}}}
        ref={this.pickRange}
        value={rangeValue}
        lang={pickerLang}
        theme="light"
        onChange={this.handleRangeChange}
        onDismiss={this.handleRangeDissmis}
      >
        <div className="fake-form-control" onClick={this.handleClickMonthBox}>{makeText(rangeValue.from) + ' ~ ' + makeText(rangeValue.to)}</div>
      </Picker>
    )
  }
}