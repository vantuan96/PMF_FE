import React, { Component } from 'react';
import {
  TheContent,
  TheFooter,
  TheHeader
} from './index'
import { connect } from 'react-redux';
import { userActions } from 'src/_actions';
import { Loading } from 'src/_components';
import ScrollToTopBtn from "src/_components/ScrollToTop";
import { UserService } from '../_services';
import {
	CButton,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
} from '@coreui/react'
// const TheLayout = (props) => {
//   console.log('here')
//   if (!props.user) props.getInfo();
//   return (
//     !props.user ? <Loading/> :
//     <div className="c-app c-default-layout">
//       {/* <TheSidebar/> */}
//       <div className="c-wrapper">
//         <TheHeader/>
//         <div className="c-body">
//           <TheContent/>
//         </div>
//         <TheFooter/>
//       </div>
//     </div>
//   )
// }

class TheLayout extends Component {
  constructor(props) {
    super(props);
    if (!props.user) props.getInfo()
  }
  setModal () {
    new UserService().update('/IsReadNofify/' + this.props.user.Notify.Id)
      .then(() => {
        this.props.getInfo()
      })
  }
  notiPopup () {
    if (this.props.user !== null && this.props.user !== undefined && this.props.user.Notify && this.props.user.Notify.Id !== null) {
      document.body.classList.add('CModal-Is-Open')
    } else {
      document.body.classList.remove('CModal-Is-Open')
    }
    return (<CModal
      show={this.props.user !== null && this.props.user !== undefined && this.props.user.Notify && this.props.user.Notify.Id !== null}
      size="xl"
      color="primary"
      closeOnBackdrop={false}
      className="no-scroll"
    >
      <CModalHeader className="text-center" closeButton={false}>
        <h3 className="text-center font-bold">{this.props.user.Notify.Subject}</h3>
      </CModalHeader>
      <CModalBody>
        <div dangerouslySetInnerHTML={{__html: this.props.user.Notify.Content}}></div>
      </CModalBody>
      <CModalFooter>
        <CButton
          color="secondary"
          onClick={() => this.setModal()}
        >Đã đọc</CButton>
      </CModalFooter>
    </CModal>)
  }
  render() {
    console.log(this.props.user)
    return (
      !this.props.user ? <Loading/> :
      <>
        {this.notiPopup()}
        <div className="c-app c-default-layout">
          {/* <TheSidebar/> */}
          <div className="c-wrapper">
            <TheHeader/>
            <div className="c-body">
              <TheContent/>
            </div>
            <TheFooter/>
            <ScrollToTopBtn />
          </div>
        </div>
      </>
    )
  }
}


function mapState(state) {
  console.log(state);   
  const { user } = state.authentication;
  return { user };
}

const actionCreators = {
  getInfo: userActions.getInfo
};
const connectedLoginedPage = connect(mapState, actionCreators)(TheLayout);
export default connectedLoginedPage
