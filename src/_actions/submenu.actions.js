import { submenuConstants } from '../_constants';

export const submenuActions = {
  newmenu,
  add,
  clear
};
function add(item) {
  return { type: submenuConstants.ADD, item };
}
function newmenu(items) {
  return { type: submenuConstants.NEW, items };
}
function clear() {
  return { type: submenuConstants.CLEAR };
}