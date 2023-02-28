import { alertConstants } from '../_constants';
const initialState = []
export function alert(state = initialState, action) {
  var newState = Object.assign([], state)
  switch (action.type) {
    case alertConstants.SUCCESS:
      newState.push({
        type: 'toast-success',
        message: action.message
      })
      return newState;
    case alertConstants.ERROR:
      newState.push({
        type: 'toast-danger',
        message: action.message
      })
      return newState;
    case alertConstants.INFO:
      newState.push({
        type: 'toast-info',
        message: action.message
      })
      return newState;
    case alertConstants.CLEAR:
      return [];
    default:
      return state
  }
}