import React from 'react'
import { connect } from 'react-redux';
const VLink = ({children, user}) => {
  return (
    <>
      {children}
    </>
  )
}

function mapState(state) {
  const { user } = state.authentication;
  return { user };
}

const connectedLoginedPage = connect(mapState)(VLink);
export default connectedLoginedPage
