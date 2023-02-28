import { submenuConstants } from '../_constants';
const initialState = []
export function submenu(state = initialState, action) {
  var newState = Object.assign([], state)
  switch (action.type) {
    case submenuConstants.ADD:
      newState.push(action.item)
      return newState;
    case submenuConstants.NEW:
      newState = action.items
      return newState;
    case submenuConstants.CLEAR:
      return [];
    default:
      return state
  }
}