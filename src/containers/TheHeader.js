import React, { useEffect, useState } from "react";
import axios from 'axios';
// import { useSelector, useDispatch } from 'react-redux'
import {
  CHeader,
  // CToggler,
  CHeaderBrand,
  CHeaderNav,
  CSubheader,
  CBreadcrumbRouter,
  CDropdown,
  CDropdownMenu,
  CDropdownToggle,
  CDropdownItem,
  CHeaderNavLink,
  CHeaderNavItem,
  CNavLink,
  CNavItem
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import clsx from 'clsx'
// routes config
import {
  getMenu, getDefaultPage
} from '../_helpers'
import routes from '../routes'
import { connect } from 'react-redux';
import {
  TheHeaderDropdown,
  TheHeaderDropDownListApp

} from './index'
import $ from 'jquery';
import { cilBell, cilEnvelopeOpen, cilList, cilMenu } from '@coreui/icons'
function GetListApp (){
  
}
const TheHeader = (props) => {
  // const dispatch = useDispatch()
  // const sidebarShow = useSelector(state => state.sidebarShow)

  // const toggleSidebar = () => {
  //   const val = [true, 'responsive'].includes(sidebarShow.value) ? false : 'responsive'
  //   dispatch({type: 'set', value: val})
  // }

  // const toggleSidebarMobile = () => {
  //   const val = [false, 'responsive'].includes(sidebarShow) ? true : 'responsive'
  //   dispatch({type: 'set', sidebarShow: val})
  // }

  const [isVisible, setIsVisible] = useState(false);
  // Show button when page is scorlled upto given distance
  const toggleVisibility = () => {
    if (window.pageYOffset > 200) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Set the top cordinate to 0
  // make scrolling smooth
  const { submenu } = props

  const Menus = getMenu()
  const defaultPage = getDefaultPage()
  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
  }, []);

  // const ListManageApp = getListManageApp()
  return (
    <div>
      <CHeader withSubheader className={clsx({
      'is-scrolling': isVisible
    })}>
      {/* <CToggler
        inHeader
        className="ml-md-3 d-lg-none"
        onClick={toggleSidebarMobile}
      />
      <CToggler
        inHeader
        className="ml-3 d-md-down-none"
        onClick={toggleSidebar}
      /> */}
      <CHeaderBrand className="px-3" to={defaultPage}>
        <img src={'images/logo.png'} alt="logo" height="40" className="c-logo-img" />
      </CHeaderBrand>

      <CHeaderNav className="d-md-down-none mr-auto">
        {/* <CHeaderNavItem className="px-3" >
          <CHeaderNavLink to="/dashboard">Dashboard</CHeaderNavLink>
        </CHeaderNavItem> */}
        {/* <CHeaderNavItem  className="px-3">
          <CHeaderNavLink to="/users">Users</CHeaderNavLink>
        </CHeaderNavItem> */}
        {/* <TheHeaderReportMenu /> */}
        {/* <TheHeaderCustomerMenuDropdown />
        <TheHeaderAdminMenuDropdown /> */}
        {Menus && Menus.map(parent => {
          return <CDropdown
            inNav
            className="c-header-nav-items mx-2"
            direction="down"
            key={parent.Id}
          >
            <CDropdownToggle className="c-header-nav-link btn" caret={true}>
              {parent.Name}
            </CDropdownToggle>
            <CDropdownMenu>
              <>
                {parent.SubMenus.map(e => {
                  return <CDropdownItem key={e.Id} to={e.Url.replace('#', '')}>{e.Name}</CDropdownItem>
                })}
              </>
            </CDropdownMenu>
          </CDropdown>
        })}

      </CHeaderNav>

      <CHeaderNav className="px-3">
        <CHeaderNavItem className="px-3" >
          <a href="https://vingroupjsc.sharepoint.com/sites/DR-VinMec/vmkht/vmcntt/tltk/Forms/Items.aspx?RootFolder=%2Fsites%2FDR-VinMec%2Fvmkht%2Fvmcntt%2Ftltk%2Fbieumau%2Ftlhdsd%2Fhdpms&FolderCTID=0x012000C7D06E1583C27D4D87181C7B29A9A99C&View=%7B65FA7BCF-5F5E-47E6-8FC4-5D87B2E98534%7D&OR=Teams-HL&CT=1641803175637&sourceId=¶ms=%7B%22AppName%22%3A%22Teams-Desktop%22%2C%22AppVersion%22%3A%2227%2F21110108719%22%7D" target="_blank"> <span className="badge badge-noti navbar-badge animation-s" ><i className="fa fa-fw fa-question" aria-hidden="true"></i></span>Hướng dẫn sử dụng</a>
        </CHeaderNavItem>     
        <TheHeaderDropdown />
        <TheHeaderDropDownListApp/>
       
      </CHeaderNav>

      {/* <CSubheader className="px-3 justify-content-between">
        {(submenu && submenu.length) ? <>
          <CBreadcrumbRouter
            className="border-0 c-subheader-nav m-0 px-0 px-md-3"
            routes={[{ name: 'Trang chủ', path: '/Dashboard', exact: true }].concat(submenu)}
          />
        </> :
          <CBreadcrumbRouter
            className="border-0 c-subheader-nav m-0 px-0 px-md-3"
            routes={routes}
          />
        }
      </CSubheader> */}
    </CHeader>
     
    </div>
  )
}

function mapState(state) {
  const { submenu } = state;
  return { submenu };
}

const connectedTheHeader = connect(mapState)(TheHeader);
export default connectedTheHeader 