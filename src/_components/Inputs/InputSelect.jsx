import React from "react";
import Select, { components } from 'react-select'
import { Loading } from 'src/_components'
export class InputSelect extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: true,
      value: null
    }
    this.handleSelectInputChange = this.handleSelectInputChange.bind(this)
  }
  componentDidMount() {
    this.setValue()
    this.reset()
  }
  setValue() {
    const { isMulti, options } = this.props
    var defaultValue = isMulti ? options.filter(e => this.props.defaultValue && (this.props.defaultValue.includes(e.value))) : options.find(e => this.props.defaultValue && (this.props.defaultValue === (e.value)))
    this.setState({ value: defaultValue })
  }
  componentDidUpdate(prevProps) {
    if (JSON.stringify(this.props.defaultValue) !== JSON.stringify(prevProps.defaultValue)) {
      this.reset()
    }
  }
  reset () {
    this.setState({loaded: false})
    setTimeout(() => {
      this.setState({loaded: true})
    }, 10)
  }
  // handleSelectInputChange(value) {
  //   const { isMulti } = this.props
  //   var val = value ? (isMulti ? value.map(e => e.value) : value.value) : null
  //   if (this.props.applyCallback) this.props.applyCallback({
  //     target: {
  //       value: val,
  //       name: this.props.name
  //     }
  //   })
  //   if (this.props.onChange) this.props.onChange({
  //     target: {
  //       value: val,
  //       name: this.props.name
  //     }
  //   })
  // }
  handleSelectInputChange(value, selected, cs) {
    const { isMulti } = this.props
    var val = value ? (isMulti ? value.map(e => e.value) : value.value) : null
    if (this.props.hasSelectAll && selected.action === 'select-option') {
      if (selected.option.value === '*') {
        this.emitValue({
          target: {
            value: '*',
            name: this.props.name
          }
        })
        this.setState({ value: isMulti ? [{ value: '*', label: 'Tất cả' }] : { value: '*', label: 'Tất cả' } })
      } else {
        this.emitValue({
          target: {
            value: val ? (isMulti ? val.filter(e => e !== '*') : val) : '*',
            name: this.props.name
          }
        })
        this.setState({ value: value.filter(e => e.value !== '*') })
      }
    } else {
      this.emitValue({
        target: {
          value: val,
          name: this.props.name
        }
      })
      this.setState({ value: value })
    }
  }
  emitValue (val) {
    if (this.props.applyCallback) this.props.applyCallback(val)
    if (this.props.onChange) this.props.onChange(val)
  }
  readOnly () {
    const { isMulti, options } = this.props
    const { loaded } = this.state
    var defaultValue = isMulti ? options.filter(e => this.props.defaultValue && (this.props.defaultValue.includes(e.value))) : options.find(e => this.props.defaultValue && (this.props.defaultValue === (e.value)))
    if (!loaded) return (<Loading />)
    var val = isMulti ? defaultValue : [defaultValue].filter(e => e).map(e => {
      return e.label
    }).join(', ')
    return (
      <span>{val || 'N/A'}</span>
    )
  }
  render() {
    const Input = props => <components.Input {...props} maxLength={250} />
    const { options, isMulti, readOnly, placeholder, isClearable, noSearchable } = this.props
    if (readOnly) return this.readOnly()
    const { loaded, value } = this.state
    if (!loaded) return <Loading/>
    var defaultValue = isMulti ? options.filter(e => this.props.defaultValue && (this.props.defaultValue.includes(e.value))) : options.find(e => this.props.defaultValue && this.props.defaultValue === e.value)
    console.log(defaultValue)
    return (
      <Select
        components={{ Input }}
        classNamePrefix="reactjs-select"
        options={options}
        isMulti={isMulti}
        placeholder={placeholder || 'Chọn'}
        onChange={this.handleSelectInputChange}
        defaultValue={defaultValue}
        value={value}
        isClearable={isClearable}
        isSearchable={!noSearchable}
      />
    )
  }
}