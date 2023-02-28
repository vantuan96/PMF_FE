import { InputText } from 'src/_components'
import { UserService } from 'src/_services'
import clsx from 'clsx'
import React from 'react';
export class AdInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      err: null,
      selected: null,
      loaded: false,
      ad: null,
      title: '',
      info: null
    }
    this.handleSelectInputBlur = this.handleSelectInputBlur.bind(this)
    this.handleSelectInputChange = this.handleSelectInputChange.bind(this)
  }
  async componentDidMount() {
    this.buildValue()
  }
  buildValue() {
    const { value } = this.props
    if (value && value.Username) {
      this.setState({ title: `${value.Fullname} (${value.Username})` })
      this.setState({ info: {
        Ad: value.Username,
        Username: value.Username,
        Fullname: value.Fullname
      } })
    }
    this.setState({ loaded: true })
  }
  getAdInfo(ad) {
    new UserService({ ad }).find('ADInfo').then(info => {
      if (info) {
        this.setState({ info: {
          Username: ad,
          Ad: ad,
          Fullname: info.Fullname
        }})
        this.setState({ title: `${info.Fullname} (${ad})` })
        this.emitValue()
      }
    }).catch(err => {
      console.log(err)
      this.setState({ err: err.data })
      this.setState({ info: {} })
      this.emitValue()
    })
  }
  emitValue() {
    setTimeout(() => {
      const { info } = this.state
      if (this.props.applyCallback) this.props.applyCallback({
        target: {
          name: this.props.name,
          value: info
        }
      })
    }, 100)
  }
  handleSelectInputChange(value) {
    this.setState({ title: value.target.value })
  }
  handleSelectInputBlur(value) {
    const { info } = this.state
    var val = value.target.value
    if (info && val === `${info.Fullname} (${info.Ad})`) return false
    this.setState({ err: null })
    this.setState({ info: null })
    if (val) {
      this.getAdInfo(val)
    } else {
      this.setState({ info: {} })
      this.emitValue()
    }
  }
  render() {
    const { err, loaded, title } = this.state
    if (!loaded) return ''
    return (
      <>
        <InputText
          className={clsx({
            error: err
          })}
          placeholder="Nhập AD"
          type="text"
          onBlur={this.handleSelectInputBlur}
          onChange={this.handleSelectInputChange}
          value={title}
        />
      </>
    )
  }
}