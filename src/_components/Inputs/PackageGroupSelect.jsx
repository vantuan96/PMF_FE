import React from "react";
import { PackageGroup } from "src/_services";
import Select, { components } from 'react-select';
import { Loading } from 'src/_components'
export class PackageGroupSelect extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      PackageGroup: [],
      selected: null,
      loaded: false,
      value: null
    }
    this.loadPackageGroups = this.loadPackageGroups.bind(this)
    this.handleSelectInputChange = this.handleSelectInputChange.bind(this)
  }
  async componentDidMount() {
    await this.loadPackageGroups()
    this.setState({loaded: true})
    this.setValue()
  }
  setValue() {
    const { isMulti } = this.props
    const { PackageGroup } = this.state
    var defaultValue = isMulti ? PackageGroup.filter(e => this.props.defaultValue && (this.props.defaultValue.includes(e.value))) : PackageGroup.find(e => this.props.defaultValue && (this.props.defaultValue === (e.value)))
    this.setState({ value: defaultValue })
  }
  async loadPackageGroups() {
    await new PackageGroup({PageSize: 2000, Status: 1}).all()
      .then(response => {
        var s = []
        if (this.props.hasSelectAll) s = [{ value: '*', label: 'Tất cả' }]
        this.setState({
          PackageGroup: s.concat(response.Results.map(e => {
            e.value = e.Id
            e.label = e.Code + ' - ' + e.Name
            return e
          }))
        });
      })
  }
  handleSelectInputChange(value, selected, cs) {
    console.log(value, selected)
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
  render() {
    const Input = props => <components.Input {...props} maxLength={250} />
    const { PackageGroup, loaded, value } = this.state
    var defaultValue = PackageGroup.filter(e => this.props.defaultValue && (this.props.defaultValue.includes(e.value)))
    if (!loaded) return (<Loading />)
    return (
      <Select
        components={{ Input }}
        classNamePrefix="reactjs-select"
        options={PackageGroup}
        isMulti
        placeholder="Chọn nhóm gói"
        onChange={this.handleSelectInputChange}
        value={value}
        defaultValue={defaultValue}
      />
    )
  }
}