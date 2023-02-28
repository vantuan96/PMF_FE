import {
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CNavItem,
} from '@coreui/react'
import React, { useEffect, useState } from "react";
import { connect } from 'react-redux';
import { userConstants } from '../_constants';
import { UserService, AccountService } from '../_services';
import { useDispatch } from 'react-redux';
import {
  getListApp
} from '../_helpers'
import Axios from 'axios'

const style = {
  color: 'white !import'
}

const TheHeaderDropDownListApp = (props) => {
  function success(listApp) { return { type: userConstants.LIST_APP, listApp } }
  useEffect(() => {
    window.$('.img-circle').initial({ charCount: 1, seed: 100, width: 50, height: 50, fontSize: 30 });
    
  }, [ window.$('.img-circle').initial({ charCount: 1, seed: 100, width: 50, height: 50, fontSize: 30 })]);
  
  const dispatch = useDispatch()
  useEffect(() => {
    fetchData();
  }, []);
  function fetchData() {
    try {
      new AccountService().listApp()
        .then(
          listApp => {
            dispatch(success(listApp));
          },
          error => {

          }
        );

    } catch (e) {
      // if (e !== "No current user") {
      //   alert(e);
      // }
    }

  }
  const listApp = props.lstapp;
  console.log(listApp);

  let GenListApp = [];
  listApp.map((element, index) => {
    const GenIcon = (item) =>{
      var postUrl  = process.env.REACT_APP_BASE_URL;  
      if(item.icon != null){
        var appIcon = postUrl + item.icon ;
        var sectionStyle = {       
          backgroundImage: "url(" + { appIcon } + ")"
        };
           return(
             <span  className='vmb_q user-image'  style={sectionStyle}></span>
           )
          }
          else {
           return(
             <img data-name={item.code} className='vmb_q img-circle' alt='App Icon'/> 
           )
    }}
    let defaultHerf =  "";
    if(element.appSettings[0]?.appId === element.appId){
      defaultHerf = element.appSettings[0]?.defaultUrlRefer;
    }
    const herf = userConstants.Authority + userConstants.AzureTenantId + "/oauth2/v2.0/authorize?client_id=" + userConstants.AzureClientId + "&scope=profile+email+openid&redirect_uri=" + defaultHerf+ "&response_type=code&response_mode=form_post"
    GenListApp.push(<li className="item-app vmb_i">
      <a className="vmb_d" data-pid={element.appId} draggable="false"  href={herf}>
        {GenIcon(element)}
        <span className="vmb_r">{element.name}</span>
      </a>
    </li>
    )

  })

  return (
    <>
      <div></div>
      <CDropdown
        inNav
        className="c-header-nav-items mx-2"
        direction="down"
      >
        <CDropdownToggle className="" >
          <img style={{ marginRight: "-200px" }} src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAYAAADE6YVjAAAABmJLR0QA/wD/AP+gvaeTAAAC+klEQVRIie2UTW9TRxSGnzP3+usSAqiC1JEhQIQUcPmokm4QAiGQAImwgx0bfkmX/R9dIAELaBCiVSKBvEBCaWkIToAEhCFyCFGQDPiL3LnTha/HvnZcwYIdZ3M1z8y87zkz5w58j68IiYyMEd4+OYFy3BYMVhn4aYaV2aPgeC1sPpDOPqT4eBTH3Wa5NnUGs7neJoXHe1HOI4Q/w2kHzCjr3gixSgm41bb6PJmsx1J+DeQeGN1IlDPE/H38ePhdc2FbxoByFIEsMXTgEgDFaY917ymJNcW6V7EcoDC31shcFLHKZQbHKiHPU3VVRDZiUgf8aHFoFf1aLhvzzv1dlQAEkmJxfhSAiiQxTVEcyxsmTsih0vczi/M1u7/DN2oiyVV8fx4jv7UYE6RH6zx7PtXB74aiNwn41V6vIo/bX4rIdlUys5BBTNyOY7rE/v1rzM2l8d1Ua6db5uDeFRYWtlM1my2PBzVGRoq9TfIvdhGYBWApnBYwAUmTpSYfgTdtWwc4ONzH7OIKSBlM82AzqESa7M73Gx9XzcRxZJEjw1kAposebvUpJc/BrZY5Mjxs1/77otldcfzUHsYGKyHPo/x4u2z3xevOsUS/zQh6cA18jqINTJRDrtD4g5WfwpdGo2sRywF06KIFXH8ruUIi5E6nZNSkbErERHDMNAA1AyKzlNOfSb56bTmALy9Dkxn8IEdTWkudmvepK/lvHdEDzRW2EajbYBKtFTKHzlxBvf4LpL9t5yrHd53jfuEGyO42lQqb3LO2Eeg8Ll/9AKQx5mI4nUSCq3xajtOnxjDByZaJmgIgUKcw6jz4tZBf52O9H+hhAqCpcnrobwAmih4p20XacoDJJR1yqMojxocaopNvqnRcfdSkDqheD2Fnq/ZqbQX1Tf9jIjGNH2S4U7wGgMFBi6avHlBNpCxvVJywFSp+506xUZlPBtGRv6377ZooHkOcZCuzYJkL6Tx/LP+CUlssN/o944P/cGvlEA47Wpwy4wMPunS/x5fGf1+sJ4wz6b/LAAAAAElFTkSuQmCC" />
        </CDropdownToggle>
        <CDropdownMenu className="scrollbar1 select-app-more" placement="bottom-end">
          <CNavItem className='select-app-more-body'>
            <ul className="block-item-app">
              {GenListApp}
            </ul>
          </CNavItem>
        </CDropdownMenu>
      </CDropdown>
    </>
  )
}

function mapState(state) {
  const { lstapp } = state;
  return { lstapp };
}

const connectedLoginedPage = connect(mapState)(TheHeaderDropDownListApp);
export default connectedLoginedPage

