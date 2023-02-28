import React from 'react'
import {
  CDropdown,
  CDropdownMenu,
  CDropdownToggle,
  CDropdownItem
} from '@coreui/react'
import CIcon from '@coreui/icons-react'

import {
  hasPermissions
} from 'src/_helpers'
const TheHeaderCustomerMenuDropdown = () => {
  return (
    <>
    {hasPermissions(['ADMINPATIENTINPACKAGE_REGISTERPACKAGEAPI', 'ADMINPATIENTINPACKAGE_GETLISTPATIENTINPACKAGEAPI']) &&
      <CDropdown
        inNav
        className="c-header-nav-items mx-2"
        direction="down"
      >
        <CDropdownToggle className="c-header-nav-link btn" caret={true}>
          Quản lý khách hàng
        </CDropdownToggle>
        <CDropdownMenu>
          {hasPermissions(['ADMINPATIENTINPACKAGE_REGISTERPACKAGEAPI']) && <CDropdownItem to="/Customer/Search"><CIcon name="cil-code" className="mfe-2"/>Đăng ký gói</CDropdownItem>}
          {hasPermissions(['ADMINPATIENTINPACKAGE_GETLISTPATIENTINPACKAGEAPI']) && <CDropdownItem to="/Customer/List"><CIcon name="cil-code" className="mfe-2" />Danh sách khách hàng</CDropdownItem>}
        </CDropdownMenu>
      </CDropdown>
    }
    </>
  )
}

export default TheHeaderCustomerMenuDropdown

