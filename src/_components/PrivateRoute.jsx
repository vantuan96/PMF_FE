import React from 'react';
import { Route, Redirect } from 'react-router-dom';


export const PrivateRoute = ({ component: Component, ...rest })  => {
  var auth =  localStorage.getItem('Token')  ; 
  if(auth === null){
    auth = "null";
  }
  return (
    <Route {...rest} render={props => (
         auth!= "null" 
            ? <Component {...props} />
            :  <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
        )} />
  )
}