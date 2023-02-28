import React from "react";
import { Package } from "src/_services";
import AsyncSelect from 'react-select/async'
import { Loading } from 'src/_components'
export class PackageInputSelect extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      packages: [],
      selected: null,
      loaded: false
    }
    this.loadPackage = this.loadPackage.bind(this)
    this.handleSelectInputChange = this.handleSelectInputChange.bind(this)
  }
  async componentDidMount() {
    await this.loadPackage()
    this.setState({ loaded: true })
  }
  async loadPackage(inputValue, callback) {
    var query = { Keyword: inputValue }
    if (!inputValue) query = { ids: this.props.defaultValue, Keyword: '' }
    await new Package({...query, IsActived: true, Status: 1, SetPrice: 1, Limited: -1, ...this.props.query, PageSize: 50}).all()
      .then(response => {
        var packages = [].concat(response.Results.map(e => {
          e.value = e.Id
          e.label = e.Code + ' - ' + e.Name
          return e
        }))
        if (this.props.query && this.props.query.IsExpireDate) {
          packages = packages.filter(e => !e.IsExpireDate)
        }
        this.setState({ packages })
        if (callback) callback(packages)
      })
  }
  handleSelectInputChange(value) {
    if (this.props.onChange) this.props.onChange({
      target: {
        name: this.props.name,
        value: value ? (this.props.isMulti ? value.map(e => e.Id) : value.Id) : null,
        _obj: value
      }
    })
  }
  render() {
    const { packages, loaded } = this.state
    var defaultValue = this.props.isMulti ? packages.filter(e => (this.props.defaultValue && this.props.defaultValue.includes(e.value))) : packages.find(e => (this.props.defaultValue && this.props.defaultValue.includes(e.value)))
    if (!loaded) return (<Loading />)
    return (
      <AsyncSelect
        isMulti={this.props.isMulti}
        classNamePrefix="reactjs-select-service"
        loadOptions={this.loadPackage.bind(this)}
        defaultOptions={packages}
        className="select-inline-form"
        onChange={this.handleSelectInputChange}
        name="PackageInput"
        placeholder="Gõ để tìm kiếm..."
        isClearable={true}
        defaultValue={defaultValue}
      />
    )
  }
}