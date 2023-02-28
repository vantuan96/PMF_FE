import { combineReducers } from 'redux';
import { authentication } from './authentication.reducer';
import { registration } from './registration.reducer';
import { users } from './users.reducer';
import { alert } from './alert.reducer';
import { sidebarShow } from './sidebar.show';
import { submenu } from './submenu.reducer';
 import {lstapp} from './lstapp.reducer';
const rootReducer = combineReducers({
  authentication,
  lstapp,
  registration,
  users,
  alert,
  sidebarShow,
  submenu,

});

export default rootReducer;