import { userConstants } from '../_constants';
import { UserService, AccountService } from '../_services';
import { alertActions } from './';
import { history } from '../_helpers';
export const userActions = {
  login,
  logout,
  register,
  getAll,
  delete: _delete,
  getInfo,
  listApp
};
function login(username, password, captcha) {
  return dispatch => {
    dispatch(request({ username }));
    new AccountService().login(username, password, captcha)
      .then(
        response => {
          localStorage.setItem('Token', JSON.stringify(response.Token));
          dispatch(success(response.Token));
          dispatch(alertActions.success('Đăng nhập thành công'));
          setTimeout(() => {
            history.push('/Dashboard')
          }, 1000)
        },  
        error => {
          dispatch(failure(error.toString()));
          //dispatch(alertActions.error('Thông tin đăng nhập không đúng'));
        }
      );
  };

  function request(response) { return { type: userConstants.LOGIN_REQUEST, response } }
  function success(response) { return { type: userConstants.LOGIN_SUCCESS, response } }
  function failure(error) { return { type: userConstants.LOGIN_FAILURE, error } }
}
function getInfo() {
  return dispatch => {
    // dispatch(request({}));
    new AccountService().getInfo()
      .then(
        user => {
          dispatch(success(user));
        },
        error => {
          logout()
        }
      );
  };
  // function request(user) { return { type: userConstants.REGISTER_REQUEST, user } }
  function success(user) { return { type: userConstants.GET_INFO_USER, user } }
}
function logout() {
  localStorage.clear();
  new AccountService().logout().then(
    response => {
   console.log(response);

   sessionStorage.clear();
   window.location.href =  response.url;
    },
    error => {
    
    }
  );;
      
  // new AccountService().logout().then();
    return { type: userConstants.LOGOUT };
}

function register(user) {
  return dispatch => {
    dispatch(request(user));

    UserService.register(user)
      .then(
        user => {
          dispatch(success());
          history.push('/login');
          dispatch(alertActions.success('Registration successful'));
        },
        error => {
          dispatch(failure(error.toString()));
          dispatch(alertActions.error(error.toString()));
        }
      );
  };

  function request(user) { return { type: userConstants.REGISTER_REQUEST, user } }
  function success(user) { return { type: userConstants.REGISTER_SUCCESS, user } }
  function failure(error) { return { type: userConstants.REGISTER_FAILURE, error } }
}

function getAll() {
  return dispatch => {
    dispatch(request());

    UserService.getAll()
      .then(
        users => dispatch(success(users)),
        error => dispatch(failure(error.toString()))
      );
  };

  function request() { return { type: userConstants.GETALL_REQUEST } }
  function success(users) { return { type: userConstants.GETALL_SUCCESS, users } }
  function failure(error) { return { type: userConstants.GETALL_FAILURE, error } }
}

// prefixed function name with underscore because delete is a reserved word in javascript
function _delete(id) {
  return dispatch => {
    dispatch(request(id));

    UserService.delete(id)
      .then(
        user => dispatch(success(id)),
        error => dispatch(failure(id, error.toString()))
      );
  };

  function request(id) { return { type: userConstants.DELETE_REQUEST, id } }
  function success(id) { return { type: userConstants.DELETE_SUCCESS, id } }
  function failure(id, error) { return { type: userConstants.DELETE_FAILURE, id, error } }
}

function listApp(){
  return dispatch => {
    // dispatch(request());
    new AccountService().listApp()
      .then(
        listApp => {
          dispatch(success(listApp));
        },
        error => {
        
        }
      );
      // function request(response) { return { type: userConstants.LOGIN_REQUEST, response } }
      function success(listApp) { return { type: userConstants.LIST_APP, listApp } }
      // function failure(error) { return { type: userConstants.LOGIN_FAILURE, error } }
}
}