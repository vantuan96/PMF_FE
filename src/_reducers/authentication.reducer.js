import { userConstants } from '../_constants';

let user = JSON.parse(localStorage.getItem('user'));
let token = localStorage.getItem('Token');
const initialState = token ? { loggedIn: true, user, token } : {};

export function authentication(state = initialState, action) {
  let newState = {...state}
  switch (action.type) {
    case userConstants.LOGIN_REQUEST:
      return {
        loggingIn: true,
        user: action.user
      };
    case userConstants.GET_INFO_USER:
      console.log(action.user)
      newState.user = action.user
      return newState
    case userConstants.LOGIN_SUCCESS:
      return {
        loggedIn: true,
        token: action.response
      };
    case userConstants.LOGIN_FAILURE:
      return {};
    case userConstants.LOGOUT:
      return {};
    default:
      return state
  }
}