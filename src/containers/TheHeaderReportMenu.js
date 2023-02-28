import React from 'react'
import {
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import i18n from 'src/i18n'
import {
  hasPermissions
} from 'src/_helpers'
const TheHeaderReportMenu = () => {
  return (
    <>
      {hasPermissions(['REPORTAPI_GETPL01API', 'REPORTAPI_GETPL05API', 'REPORTAPI_GETPL08API']) &&
        <CDropdown
          inNav
          className="c-header-nav-items mx-2"
          direction="down"
        >
          <CDropdownToggle className="c-header-nav-link" caret={true}>
            {i18n.t('Báo cáo')}
          </CDropdownToggle>
          <CDropdownMenu>
            {hasPermissions(['REPORTAPI_GETPL01API']) && <CDropdownItem to="/report/pl01"><CIcon name="cil-user" className="mfe-2" /> {i18n.t('Báo cáo PL01')}</CDropdownItem>}
            {hasPermissions(['REPORTAPI_GETPL05API']) && <CDropdownItem to="/report/pl05"><CIcon name="cil-user" className="mfe-2" /> {i18n.t('Báo cáo PL05')}</CDropdownItem>}
            {hasPermissions(['REPORTAPI_GETPL08API']) && <CDropdownItem to="/report/pl08"><CIcon name="cil-user" className="mfe-2" /> {i18n.t('Báo cáo PL08')}</CDropdownItem>}
          </CDropdownMenu>
        </CDropdown>
      }
    </>
  )
}

export default TheHeaderReportMenu

