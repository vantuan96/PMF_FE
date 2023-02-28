import React from "react"
import { confirmAlert } from 'react-confirm-alert'
import { stringToDate } from 'src/_helpers'
import { SiteSelect, VDatePicker } from 'src/_components'
import clsx from 'clsx'
import moment from "moment-timezone";
import {
  CButton,
} from '@coreui/react'

export class SiteItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      site: {},
      minDate: null
    }
    this.handleChange = this.handleChange.bind(this)

  }
  componentWillReceiveProps(nextProps) {
  }
  resetEndAt () {
  }
  componentDidMount() {
    this.setValue()
  }
  setValue() {
    this.setState({ site: this.props.site || {} })
  }
  emitValue () {
    var { site } = this.state
    if (this.props.applyCallback) this.props.applyCallback(this.props.index, site)
  }
  confirm () {
    confirmAlert({
      title: '',
      message: 'Bạn có chắc chắn xóa phạm vi áp dụng cho cơ sở này?',
      buttons: [
        {
          label: 'Không'
        },
        {
          label: 'Có',
          onClick: () => this.remove()
        }
      ]
    });
  }
  remove () {
    var { site } = this.state
    site.IsDeleted = true
    this.setState({ site })
    setTimeout(() => {
      this.emitValue()
    }, 300);
  }
  handleChange(e) {
    const { value, name, type, checked } = e.target;
    let valueUpdate = {}
    valueUpdate[name] = type === 'checkbox' ? checked : value
    this.setState(prevState => {
      let site = Object.assign({}, prevState.site)
      site = { ...site, ...valueUpdate }
      return { site }
    })
    setTimeout(() => {
      this.emitValue()
    }, 100);
  }
  render() {
    var { site, rootData } = this.props
    if (site.IsDeleted) return ''
    var minDate = new Date()
    if (rootData.Code) {
      var policyStartAt = rootData.Policy.filter(e => e.StartAt).map(e => {
        return stringToDate(e.StartAt)
      })
      policyStartAt.push(moment(new Date(), process.env.REACT_APP_DATE_FORMAT).toDate())
      minDate = Math.max( ...policyStartAt)
    }
    return (
      <tr>
        <th scope="row"></th>
        <td className={clsx({
          error: site.error && !site.SiteId
        })}>
          {(this.props.readOnly || (this.props.existPatientReg && !site.IsNew)) ? <>{site.Site ? (site.Site.ApiCode + ' - ' + site.Site.Name) : 'N/A' }</> :
            <SiteSelect
              sitesSelected={this.props.sitesSelected}
              name="SiteId"
              defaultValue={site.SiteId}
              applyCallback={this.handleChange}
            />
          }
        </td>
        <td>
          <VDatePicker minDate={minDate} name="EndAt" value={site.EndAt} readonly={this.props.readOnly} onChange={this.handleChange}/>
        </td>
        {this.props.readOnly ?
          <td>{''}</td>
          :
          <td>
            {(!this.props.existPatientReg || site.IsNew) && <CButton onClick={(e) => this.confirm()} type="button" color="warning"><i className="fa fa-minus-circle pointer" aria-hidden="true"></i></CButton>}
          </td>
        }
      </tr>
    )
  }
}
