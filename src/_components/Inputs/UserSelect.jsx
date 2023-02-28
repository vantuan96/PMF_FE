import React from "react";
import { UserService } from "src/_services";
import AsyncSelect from 'react-select/async'
import { Loading } from 'src/_components'
export class UserSelect extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      users: [],
      selected: null,
      loaded: false
    }
    this.loadUser = this.loadUser.bind(this)
    this.handleSelectInputChange = this.handleSelectInputChange.bind(this)
  }
  async componentDidMount() {
    await this.loadUser(this.props.defaultValue || "")
    this.setState({loaded: true})
  }
  async loadUser(inputValue, callback) {
    await new UserService({ Search: inputValue }).all()
      .then(response => {
        var users = [].concat(response.Results.map(e => {
          e.value = e.Username
          e.Id = e.Username
          e.label = e.Fullname + ' - ' + e.Username
          return e
        }))
        this.setState({ users })
        if (callback) callback(users)
      })
    // this.setState({ currentUserSelected: value })
  }
  // onChangeEvent() {
  //   if (this.props.applyCallback) this.props.applyCallback({
  //     name: this.props.name,
  //     value: this.state.value
  //   })
  // }
  handleSelectInputChange(value) {
    console.log(value)
    if (this.props.applyCallback) this.props.applyCallback(value, {
      value: value,
      name: this.props.name,
      type: 'UserSelect'
    })
  }
  render() {
    const { users, loaded } = this.state
    var defaultValue = users.find(e => (this.props.defaultValue && this.props.defaultValue === e.value)) || null
    if (!loaded) return (<Loading />)
    return (
      <AsyncSelect
        classNamePrefix="reactjs-select"
        loadOptions={this.loadUser.bind(this)}
        defaultOptions={users}
        className="select-inline-form"
        onChange={this.handleSelectInputChange}
        name="AdAccount"
        placeholder="Gõ để tìm kiếm BS..."
        isClearable={true}
        defaultValue={defaultValue}
      />
    )
  }
}