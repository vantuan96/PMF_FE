import React from 'react'
import {
  CDropdown,
  CDropdownMenu,
  CDropdownToggle,
  CDropdownItem
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import i18n from 'src/i18n'

import {
  hasPermissions
} from 'src/_helpers'
const TheHeaderAdminMenuDropdown = () => {
  return (
    <>
      {hasPermissions(['ADMINUSER_CREATEUSERDETAILAPI', 'ADMINROLE_CREATEROLEAPI', 'ADMINPACKAGEGROUP_CREATEPACKAGEGROUPAPI', 'ADMINPACKAGE_CREATEPACKAGEAPI', 'ADMINACTION_MAPPINGGROUPACTIONAPI']) &&
      <CDropdown
        inNav
        className="c-header-nav-items mx-2"
        direction="down"
      >
        <CDropdownToggle className="c-header-nav-link btn btn-warning" caret={true}>
          {i18n.t('Admin Area')}
        </CDropdownToggle>
        <CDropdownMenu>
          {hasPermissions(['ADMINUSER_CREATEUSERDETAILAPI']) && <CDropdownItem to="/users"> <CIcon name="cil-user" className="mfe-2" /> {i18n.t('Quản lý người dùng')} </CDropdownItem>}
          {hasPermissions(['ADMINACTION_MAPPINGGROUPACTIONAPI']) && <CDropdownItem to="/groupaction"><CIcon name="cil-user" className="mfe-2" /> {i18n.t('Quản lý nhóm chức năng')}</CDropdownItem>}
          {hasPermissions(['ADMINROLE_CREATEROLEAPI']) && <CDropdownItem to="/roles"><CIcon name="cil-user" className="mfe-2" /> {i18n.t('Quản lý nhóm quyền')}</CDropdownItem>}
          {hasPermissions(['ADMINPACKAGEGROUP_CREATEPACKAGEGROUPAPI']) && <CDropdownItem to="/admin/PackageGroup"><CIcon name="cil-code" className="mfe-2" />Quản lý nhóm gói</CDropdownItem>}
          {hasPermissions(['ADMINPACKAGE_CREATEPACKAGEAPI']) && <CDropdownItem to="/admin/Package"><CIcon name="cil-code" className="mfe-2" />Quản lý gói</CDropdownItem>}
        </CDropdownMenu>
      </CDropdown>
      }
    </>
  )
}

export default TheHeaderAdminMenuDropdown