import React from "react";
import { ServiceService } from "src/_services";
import AsyncSelect from 'react-select/async'
import { Loading } from 'src/_components'
const styles = {
  multiValue: (base, state) => {
    return state.data.isFixed ? { ...base, backgroundColor: 'gray' } : base;
  },
  multiValueLabel: (base, state) => {
    return state.data.isFixed
      ? { ...base, fontWeight: 'bold', color: 'white', paddingRight: 6 }
      : base;
  },
  multiValueRemove: (base, state) => {
    return state.data.isFixed ? { ...base, display: 'none' } : base;
  },
};
export class ServiceInputSelect extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      services: [],
      selected: null,
      loaded: false
    }
    this.loadServices = this.loadServices.bind(this)
    this.handleSelectInputChange = this.handleSelectInputChange.bind(this)
  }
  async componentDidMount() {
    if (this.props.defaultValue && this.props.defaultValue.length > 0) {
      await this.loadServices()
      this.setState({value: this.state.services})
    }
    this.setState({ loaded: true })
  }
  async loadServices(inputValue, callback) {
    var query = { Search: inputValue }
    if (!inputValue) query = { ids: this.props.defaultValue, Search: 'x' }
    if (this.props.query) query = {...query, ...this.props.query}
    await new ServiceService({...query, IsActived: true}).all()
      .then(response => {
        var services = [].concat(response.Results.map(e => {
          e.value = e.Id
          e.label = e.Code + ' - ' + e.ViName
          e.isFixed = (this.props.fixedValue || []).includes(e.Id)
          return e
        }))
        this.setState({ services })
        if (callback) callback(services)
      })
  }
  handleSelectInputChange(value, meta) {
    if (meta.action === 'pop-value' && meta.removedValue && meta.removedValue.isFixed) {
      console.log(meta)
      return false
    } else {
      this.setState({value})
    }
    if (this.props.onChange) this.props.onChange({
      target: {
        name: this.props.name,
        value: value ? (this.props.isMulti ? value.map(e => e.Id) : value.Id) : null,
        _obj: value
      }
    })
  }
  render() {
    const { services, loaded, value } = this.state
    var defaultValue = this.props.isMulti ? services.filter(e => (this.props.defaultValue && this.props.defaultValue.includes(e.value))) : services.find(e => (this.props.defaultValue && this.props.defaultValue.includes(e.value)))
    if (this.props.isMulti && defaultValue) {
      defaultValue = (defaultValue.filter(e => e.isFixed)).concat(defaultValue.filter(e => !e.isFixed))
    }
    if (!loaded) return (<Loading />)
    return (
      <AsyncSelect
        styles={styles}
        isMulti={this.props.isMulti}
        classNamePrefix="reactjs-select-service"
        loadOptions={this.loadServices.bind(this)}
        defaultOptions={services}
        className="select-inline-form"
        onChange={this.handleSelectInputChange}
        name="AdAccount"
        placeholder="Gõ để tìm kiếm..."
        isClearable={false}
        defaultValue={defaultValue}
        value={value}
      />
    )
  }
}