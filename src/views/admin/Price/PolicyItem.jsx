import React from "react"
import { SiteSelect, CurrencyInputText, VDatePicker, InputSelect } from 'src/_components'
import { Package } from "src/_services";
import clsx from 'clsx'
const PersonalTypes = ['N/A', 'Người Việt Nam', 'Người nước ngoài']

export class PolicyItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      policy: {},
      ChargeType: [],
      loaded: false
    }
    this.handleChange = this.handleChange.bind(this)
  }
  componentDidMount() {
    this.setValue()
  }
  setValue() {
    this.setState({ policy: this.props.Policy })
    setTimeout(() => {
      this.loadChargeType()
    }, 100);
  }
  emitValue() {
    var { policy } = this.state
    if (this.props.applyCallback) this.props.applyCallback(this.props.index, policy)
  }
  handleChange(e) {
    const { value, name, type, checked } = e.target;
    this.updatePolicy(name, type === 'checkbox' ? checked : (value || ''))
    if (name === 'SiteBaseCode') {
      setTimeout(() => {
        this.loadChargeType(true)
      }, 100);
    }
    setTimeout(() => {
      this.emitValue()
    }, 100);
  }
  updatePolicy(name, value) {
    let valueUpdate = {}
    valueUpdate[name] = value
    this.setState(prevState => {
      let policy = Object.assign({}, prevState.policy)
      policy = { ...policy, ...valueUpdate }
      return { policy }
    })
  }
  loadChargeType(isFirst) {
    if (!this.state.policy.SiteBaseCode) {
      this.setState({ loaded: true })
      return false
    }
    this.setState({ loaded: false})
    if (isFirst) this.updatePolicy('ChargeType', null)
    new Package().find('ChargeType/' + this.state.policy.SiteBaseCode)
      .then(res => {
        this.setState({
          ChargeType: res.entities.map(e => {
            e.value = e.ChargeTypeCode
            e.label = e.ChargeTypeName
            return e
          })
        })
        this.setState({ loaded: true })
      }).catch(e => {
        this.setState({ loaded: true })
      })
  }
  render() {
    var { ChargeType, loaded } = this.state
    var policy = this.props.Policy
    var { readOnly, index } = this.props
    if (!loaded) return null
    return (
      <tr className={clsx({
        error: policy.error
      })}>
        <th scope="row" className="align-middle">{PersonalTypes[policy.PersonalType]}</th>
        <td className={clsx({
          error: policy.error && !policy.SiteBaseCode
        })}>
          <SiteSelect
            name="SiteBaseCode"
            defaultValue={policy.SiteBaseCode}
            applyCallback={this.handleChange}
            objecKey={'ApiCode'}
            readOnly={readOnly}
          />
        </td>
        <td className={clsx({
          error: policy.error && !policy.ChargeType
        })}>
          <InputSelect
            name="ChargeType"
            readOnly={readOnly}
            options={ChargeType}
            defaultValue={policy.ChargeType}
            applyCallback={this.handleChange} />
        </td>
        <td className={clsx({
          error: policy.error && !policy.Amount
        })}><CurrencyInputText readonly={readOnly} name="Amount" value={policy.Amount} onChange={this.handleChange} /></td>
        {index == 0 && <td rowSpan="2" className={clsx({
          'vertical-align-middle': true,
          error: policy.error && !policy.StartAt
        })}><VDatePicker minDate={new Date()} name="StartAt" readonly={readOnly} onChange={this.handleChange} value={policy.StartAt} /></td>}
      </tr>
    )
  }
}
