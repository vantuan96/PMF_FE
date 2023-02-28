import React from "react";
import { DepartmentService } from "src/_services";
import Select, { components } from 'react-select'
import { Loading } from 'src/_components'
export class DepartmentSelect extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      departments: [],
      selected: null,
      loaded: false,
      value: null
    }
    this.loadSites = this.loadDepartment.bind(this)
    this.handleSelectInputChange = this.handleSelectInputChange.bind(this)
  }
  async componentDidMount() {
    if (this.props.query && this.props.query.SiteCode && this.props.query.SiteCode !== 'NONE') {
      await this.loadDepartment()
    }
    this.setState({ loaded: true })
    this.setValue()
  }
  setValue() {
    const { isMulti } = this.props
    const { departments } = this.state
    var defaultValue = isMulti ? departments.filter(e => this.props.defaultValue && (this.props.defaultValue.includes(e.value))) : departments.find(e => this.props.defaultValue && (this.props.defaultValue === (e.value)))
    this.setState({ value: defaultValue })
  }
  async loadDepartment() {
    await new DepartmentService({PageSize: 1000, ...this.props.query}).all()
      .then(response => {
        if (response.Results) {
          var s = []
          if (this.props.hasSelectAll) s = [{ value: '*', label: 'Tất cả' }]
          this.setState({
            departments: s.concat(response.Results.map(e => {
              e.value = this.props.objecKey ? e[this.props.objecKey] : e.Id
              e.label = e.ViName
              return e
            }))
          });
        }
      })
  }
  handleSelectInputChange(value, selected, cs) {
    const { isMulti } = this.props
    var val = value ? (isMulti ? value.map(e => e.value) : value.value) : null
    if (this.props.hasSelectAll && selected.action === 'select-option') {
      if (selected.option.value === '*') {
        if (this.props.applyCallback) this.props.applyCallback({
          target: {
            value: '*',
            name: this.props.name
          }
        })
        this.setState({ value: isMulti ? [{ value: '*', label: 'Tất cả' }] : { value: '*', label: 'Tất cả' } })
      } else {
        if (this.props.applyCallback) this.props.applyCallback({
          target: {
            value: val ? (isMulti ? val.filter(e => e !== '*') : val) : '*',
            name: this.props.name
          }
        })
        this.setState({ value: value.filter(e => e.value !== '*') })
      }
    } else {
      if (this.props.applyCallback) this.props.applyCallback({
        target: {
          value: val,
          name: this.props.name
        }
      })
      this.setState({ value: value })
    }
  }
  readOnly() {
    const { isMulti } = this.props
    const { departments, loaded } = this.state
    var defaultValue = isMulti ? departments.filter(e => this.props.defaultValue && (this.props.defaultValue.includes(e.value))) : departments.find(e => this.props.defaultValue && (this.props.defaultValue === (e.value)))
    if (!loaded) return (<Loading />)

    var val = isMulti ? defaultValue : [defaultValue].filter(e => e).map(e => {
      return e.ApiCode + ' - ' + e.Name
    }).join(', ')
    return (
      <span>{val || 'N/A'}</span>
    )
  }
  render() {
    const Input = props => <components.Input {...props} maxLength={5} />
    const { isMulti, readOnly } = this.props
    if (readOnly) return this.readOnly()
    const { departments, loaded, value } = this.state
    var defaultValue = isMulti ? departments.filter(e => this.props.defaultValue && (this.props.defaultValue.includes(e.value))) : departments.find(e => this.props.defaultValue && (this.props.defaultValue === (e.value)))
    if (!loaded) return (<Loading />)
    return (
      <Select
        // menuIsOpen={true}
        components={{ Input }}
        classNamePrefix="reactjs-select"
        options={departments.filter(e => !this.props.departmentsSelected || this.props.departmentsSelected.find(i => i.Id !== e.Id))}
        isMulti={isMulti}
        placeholder="Chọn Khoa phòng"
        name="Departments"
        onChange={this.handleSelectInputChange}
        defaultValue={defaultValue}
        value={value}
      />
    )
  }
}