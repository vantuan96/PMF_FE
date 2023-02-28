import {
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { userActions } from '../_actions';
import i18n from 'src/i18n'
import { connect } from 'react-redux';
import { confirmAlert } from 'react-confirm-alert'
const TheHeaderDropdown = (props) => {
  const logout = () => {
    userActions.logout()
  }
  const logoutPopup = () => {
    confirmAlert({
      message: 'Bạn có chắc chắn muốn thoát khỏi hệ thống?',
      buttons: [
        {
          label: 'Không'
        },
        {
          label: 'Có',
          onClick: () => logout()
        }
      ]
    });
  }
  
  const Fullname = props.user.Fullname
  return (
    <>
      <CDropdown
        inNav
        className="c-header-nav-items mx-2"
        direction="down"
      >
        <CDropdownToggle className="c-header-nav-link" caret={false}>
          <CIcon name="cil-user" className="mfe-2" /> {Fullname}
        </CDropdownToggle>
        <CDropdownMenu className="pt-0" placement="bottom-end">
          <CDropdownItem onClick={() => logoutPopup(true)}>
            <CIcon name="cil-lock-locked" className="mfe-2" />
            {i18n.t('Đăng xuất')}
          </CDropdownItem>
        </CDropdownMenu>
      </CDropdown>
    </>
  )
}

function mapState(state) {
  const { user } = state.authentication;
  return { user };
}
const connectedLoginedPage = connect(mapState)(TheHeaderDropdown);
export default connectedLoginedPage

