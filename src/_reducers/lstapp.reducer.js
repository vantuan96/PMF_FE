import { userConstants } from '../_constants';
const initialState = []
export function lstapp(state = initialState, action) {
  var newState = Object.assign([], state)
  switch (action.type) {
    case userConstants.LIST_APP:
      // console.log(action.listApp)
      newState = action.listApp
      return newState
    default:
      return state
  }
}
