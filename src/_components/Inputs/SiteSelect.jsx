import React from "react";
import { SiteService } from "src/_services";
import Select, { components } from 'react-select'
import { Loading } from 'src/_components'
export class SiteSelect extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sites: [],
      selected: null,
      loaded: false,
      value: null
    }
    this.loadSites = this.loadSites.bind(this)
    this.handleSelectInputChange = this.handleSelectInputChange.bind(this)
  }
  async componentDidMount() {
    await this.loadSites()
    this.setState({ loaded: true })
    this.setValue()
  }
  setValue() {
    const { isMulti } = this.props
    const { sites } = this.state
    var defaultValue = isMulti ? sites.filter(e => this.props.defaultValue && (this.props.defaultValue.includes(e.value))) : sites.find(e => this.props.defaultValue && (this.props.defaultValue === (e.value)))
    this.setState({ value: defaultValue })
  }
  async loadSites() {
    await new SiteService().getAllFromStorage('_Sites')
      .then(response => {
        var s = []
        if (this.props.hasSelectAll) s = [{ value: '*', label: 'Tất cả' }]
        this.setState({
          sites: s.concat(response.map(e => {
            e.value = this.props.objecKey ? e[this.props.objecKey] : e.Id
            e.label = e.Code + ' - ' + e.Name
            return e
          }))
        });
      })
  }
  handleSelectInputChange(value, selected, cs) {
    const { isMulti } = this.props
    var val = value ? (isMulti ? value.map(e => e.value) : value.value) : null
    this.applyCallbackWithObject(value)
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
  }
  applyCallbackWithObject (obj) {
    if (this.props.applyCallbackWithObject) this.props.applyCallbackWithObject(obj)
  }
  readOnly() {
    const { isMulti } = this.props
    const { sites, loaded } = this.state
    var defaultValue = isMulti ? sites.filter(e => this.props.defaultValue && (this.props.defaultValue.includes(e.value))) : sites.find(e => this.props.defaultValue && (this.props.defaultValue === (e.value)))
    if (!loaded) return (<Loading />)

    var val = isMulti ? defaultValue : [defaultValue].filter(e => e).map(e => {
      return e.Code + ' - ' + e.Name
    }).join(', ')
    return (
      <span>{val || 'N/A'}</span>
    )
  }
  render() {
    const Input = props => <components.Input {...props} maxLength={5} />
    const { isMulti, readOnly } = this.props
    if (readOnly) return this.readOnly()
    const { sites, loaded, value } = this.state
    var defaultValue = isMulti ? sites.filter(e => this.props.defaultValue && (this.props.defaultValue.includes(e.value))) : sites.find(e => this.props.defaultValue && (this.props.defaultValue === (e.value)))
    if (!loaded) return (<Loading />)
    return (
      <div className="reactjs-site-select">
      <Select
        components={{ Input }}
        classNamePrefix="reactjs-select"
        options={sites.filter(e => !this.props.sitesSelected || this.props.sitesSelected.find(i => i.Id !== e.Id))}
        isMulti={isMulti}
        placeholder="Chọn bệnh viện"
        name="Sites"
        onChange={this.handleSelectInputChange}
        defaultValue={defaultValue}
        value={value}
        isSearchable={false}
      />
      </div>
    )
  }
}