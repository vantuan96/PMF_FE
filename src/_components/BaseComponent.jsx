import {
  Component
} from "react"
import {
  alertActions
} from 'src/_actions'
import {
  store
} from 'src/_helpers'
import {
  mesageConstants
} from 'src/_constants'
import qs from "query-string"
import {
  confirmAlert
} from 'react-confirm-alert'
import {
  submenuActions
} from 'src/_actions'
import {
  history
} from '../_helpers'
import { Package } from "src/_services";

const options = {
  name: '_blank',
  specs: [
    'fullscreen=yes',
    'titlebar=no',
    'scrollbars=yes'
  ],
  styles: [
    process.env.API_URL + '/Content/print-page.css'
  ]
}

class BaseComponent extends Component {
  componentWillUnmount() {
    store.dispatch(submenuActions.newmenu([]))
  }
  alertSuccess(msg) {
    store.dispatch(alertActions.success(msg || mesageConstants.SUBMIT_SUCCESS))
  }
  alertError(msg) {
    store.dispatch(alertActions.error(msg || mesageConstants.SUBMIT_SUCCESS))
  }
  alert(title, message) {
    confirmAlert({
      title: title,
      message: message,
      buttons: [
        {
          label: 'Đồng ý',
        }
      ]
    });
  }
  loading(isloading) {
    this.setState({
      isloading
    })
  }
  resetWithloading() {
    this.setState({
      isloading: true
    })
    setTimeout(() => {
      this.setState({
        isloading: false
      })
    }, 200)
  }
  handleChange(e) {
    const {
      name,
      value
    } = e.target;
    this.updateStateQuery(name, value)
  }
  updateStateQuery(name, value) {
    var query = {
      ...this.state.query
    }
    query[name] = value
    this.setState({
      query
    })
  }
  pageChange(newPage, oldpage) {
    if (this.state.query.pageNumber !== newPage && !oldpage) {
      this.updateStateQuery('pageNumber', newPage)
      setTimeout(() => {
        this.updateUrlSearch()
      })
    }
  }
  handleChangeInputForm(e) {
    const {
      value,
      name,
      type,
      checked
    } = e.target;
    let valueUpdate = {}
    valueUpdate[name] = type === 'checkbox' ? checked : value
    this.setState(prevState => {
      let formData = Object.assign({}, prevState.formData)
      formData = {
        ...formData,
        ...valueUpdate
      }
      return {
        formData
      }
    })
  }
  queryToState() {
    var query = qs.parse(this.props.location.search)
    query.pageNumber = Number(query.pageNumber || 1)
    query.PageSize = Number(query.PageSize || process.env.REACT_APP_PAGE_SIZE)
    this.setState({
      query: {
        ...this.defaultFilter,
        ...query
      }
    })
  }
  updateUrlSearch() {
    const {
      query
    } = this.state;
    const stringified = qs.stringify(query);
    this.props.history.push({
      search: '?' + stringified
    })
  }
  getQuery() {
    var q = qs.parse(this.props.location.search)
    return q || {}
  }
  reload(isloading) {
    window.location.reload()
  }
  handleFilterSubmit(e) {
    if (e) {
      this.updateStateQuery('pageNumber', 1)
      e.preventDefault()
    }
    setTimeout(() => {
      this.updateUrlSearch()
    }, 100)
  }
  goBack() {
    history.goBack()
  }
  addStyles(win, styles) {
    styles.forEach(style => {
      let link = win.document.createElement('link')
      link.setAttribute('rel', 'stylesheet')
      link.setAttribute('type', 'text/css')
      link.setAttribute('href', style)
      win.document.getElementsByTagName('head')[0].appendChild(link)
    })
  }
  htmlToPaper(el, footer, cb = () => true) {
    const element = document.getElementById(el)
    if (!element) {
      alert(`Element to print #${el} not found!`)
      return
    }
    let {
      name = '_blank',
      specs = ['fullscreen=yes', 'titlebar=yes', 'scrollbars=yes'],
      replace = true
      // styles = ['/static/print.css']
    } = options
    specs = specs.length ? specs.join(',') : ''
    const url = ''
    const win = window.open(url, name, specs, replace)
    win.document.write(`
        <html>
          <head>
            <title></title>
            <style type="text/css">
              @page {
                margin: 10mm 10mm 10mm 10mm;
              }
            </style>
          </head>
          <body>
            <div class="page-footer-space" style="visibility: hidden;font-size: 11px;">
              <p>Dr. Phan Ngọc Hải</p>
            </div>
            <table>
              <tbody>
                <tr>
                  <td>
                    <!--*** CONTENT GOES HERE ***-->
                    <div class="page">
                    ${element.innerHTML}
                    </div>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td>
                    <div class="page-footer" style="font-size: 11px;">
                      <p>${footer}</p>
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </body>
        </html>
      `)
    this.addStyles(win, [process.env.PUBLIC_URL + '/print.css'])
    setTimeout(() => {
      win.document.close()
      win.focus()
      win.print()
      win.close()
      cb()
    }, 1000)
    return true
  }
  async checkExistPatientReg (PackageId) {
    await new Package().find('checkExistPatientReg/' + PackageId)
      .then(({returnValue}) => {
        this.setState({
          existPatientReg: returnValue
        })
      })
  }
}
export default BaseComponent
