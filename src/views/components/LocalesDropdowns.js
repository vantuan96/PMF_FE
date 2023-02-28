import React from 'react'
import {
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { flagSet } from '@coreui/icons'
import i18n from 'src/i18n'

class LocalesDropdowns extends React.Component {
  constructor(props) {
    super(props)
    this.state = {currentLocale: i18n.language}
    this.changeLanguage = this.changeLanguage.bind(this)
  }
  changeLanguage(locale) {
    i18n.changeLanguage(locale)
    localStorage.setItem('locale', locale)
    this.setState({currentLocale: locale})
  }
  render() {
    let button;
    if (this.state.currentLocale === 'vi') {
      button = <svg className="c-icon c-icon-2xl" viewBox={'0 0 ' + flagSet.cifVn[0]} dangerouslySetInnerHTML={{__html: flagSet.cifVn[1]}}></svg>
    } else {
      button = <svg className="c-icon c-icon-2xl" viewBox={'0 0 ' + flagSet.cifGb[0]} dangerouslySetInnerHTML={{__html: flagSet.cifGb[1]}}></svg>
    }
    return (
      <CDropdown className={`${this.props.className}`}>
        <CDropdownToggle>
          {button}
        </CDropdownToggle>
        <CDropdownMenu>
          <CDropdownItem onClick={() => this.changeLanguage('vi')}><CIcon content={flagSet.cifVn} size="2xl" className="mr-10"/>Tiếng Việt</CDropdownItem>
          <CDropdownItem onClick={() => this.changeLanguage('en')}><CIcon content={flagSet.cifGb} size="2xl" className="mr-10"/>English</CDropdownItem>
        </CDropdownMenu>
      </CDropdown>
    )
  }
}
export default LocalesDropdowns