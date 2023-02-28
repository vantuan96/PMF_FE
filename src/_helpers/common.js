import _ from 'lodash';
import { store } from "src/_helpers"
export function go2Login() {
   window.location.hash = '#/login';

    
}
export function sortByKey (arr, key, type) {
  return _.orderBy(arr, [key], [type || 'asc'])
}
export function makeId(length = 10) {
  var result = ''
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  var charactersLength = characters.length
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}
export function convertTreeToList(root) {
  var stack = [], array = [], hashMap = {};
  stack.push(root);

  while(stack.length !== 0) {
      var node = stack.pop();
      if(node.children === null) {
          visitNode(node, hashMap, array);
      } else {
          for(var i = node.children.length - 1; i >= 0; i--) {
              stack.push(node.children[i]);
          }
      }
  }

  return array;
}
function visitNode(node, hashMap, array) {
  if(!hashMap[node.data]) {
      hashMap[node.data] = true;
      array.push(node);
  }
}
export function dataToTree2(list) {
  var map = {}, node, roots = [], i;
  
  for (i = 0; i < list.length; i += 1) {
    list[i].id = list[i].Id;
    list[i].label = list[i].Code + '-' + list[i].Name;
    map[list[i].Id] = i;
    list[i].children = [];
    list[i].path = list[i].Id;
  }
  for (i = 0; i < list.length; i += 1) {
    node = list[i];
    if (node.ParentId) {
      if (list[map[node.ParentId]]) {
        list[i].path = (list[map[node.ParentId]] ? list[map[node.ParentId]].path : '') + '/' + node.Id
        list[map[node.ParentId]].children.push(node);
      }
    } else {
      roots.push(node);
    }
  }
  return roots;
}
export function dataToTree (data, currentNodeId) {
  var result = data.sort( (a,b) => (a.Level > b.Level) ? 1 : ((b.Level > a.Level) ? -1 : 0) ).reduce(
    (acc, curr) => {
      curr.id = curr.Id;
      curr.label = curr.Code + '-' + curr.Name;
      if (acc.parentMap[curr.ParentId]) {
        (acc.parentMap[curr.ParentId].children = acc.parentMap[curr.ParentId].children || []).push(curr)
      } else {
        acc.res.push(curr);
      }
      acc.parentMap[curr.Id] = curr;
      return acc;
    },
    { parentMap: {}, res: [] }
  );
  return result.res
}
export function dynamicSort(property) {
  var sortOrder = 1;
  if (property[0] === "-") {
    sortOrder = -1;
    property = property.substr(1);
  }
  return function (a, b) {
    /* next line works with strings and numbers, 
     * and you may want to customize it to your needs
     */
    var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
    return result * sortOrder;
  }
}
export function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : ((r & 0x3) | 0x8)
    return v.toString(16)
  });
}
export function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
export function compareArrs(x, y) {
  return _.intersection(x, y)
}
export function isSuperman() {
  return store.getState().authentication.user.Username === 'thangdc3'
}

export function hasPermissions(action) {
  if (isSuperman()) return true
  const actions = ['x'].concat(store.getState().authentication.user.Actions)
  let elmAction = action
  if (typeof action !== 'object') {
    elmAction = [action]
  }
  const hasPermission = (compareArrs(actions, elmAction) || []).length > 0
  if (!action || hasPermission) return true;
  return false
}
export function isJson(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}
export function slugify(str) {
  var slug = str.toLowerCase();

  slug = slug.replace(/(à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ)/ig, 'a')
  slug = slug.replace(/(è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ|ë)/ig, 'e')
  slug = slug.replace(/(ì|í|ị|ỉ|ĩ)/ig, 'i')
  slug = slug.replace(/(ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ)/ig, 'o')
  slug = slug.replace(/(ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ)/ig, 'u')
  slug = slug.replace(/(ỳ|ý|ỵ|ỷ|ỹ)/ig, 'y')
  slug = slug.replace(/(đ)/ig, 'd')
  slug = slug.replace(/[^a-zA-Z ]/g, '')

  slug = slug.replace(/ /gi, "-");
  slug = slug.replace(/----/gi, "-");
  slug = slug.replace(/---/gi, "-");
  slug = slug.replace(/--/gi, "-");
  return trimChar(slug, '-')
}
export function trimChar(string, charToRemove) {
  while (string.charAt(0) === charToRemove) {
    string = string.substring(1);
  }

  while (string.charAt(string.length - 1) === charToRemove) {
    string = string.substring(0, string.length - 1);
  }

  return string;
}
export function parseInt(str) {
  const parsed = Number.parseFloat(str)
  if (Number.isNaN(parsed)) {
    return false
  }
  return parsed
}
export function spliNumber(num) {
  var str = (num + '')
  var l = str.length
  return str.substring(0, l - 1)
}
export function JSONParse(str) {
  try {
    return (JSON.parse(str))
  } catch (error) {
    console.log(error)
    return null
  }
}
export function cloneObj(item) {
  return JSONParse(JSON.stringify(item))
}
export function base64ToArrayBuffer(base64) {
  var binaryString = window.atob(base64);
  var binaryLen = binaryString.length;
  var bytes = new Uint8Array(binaryLen);
  for (var i = 0; i < binaryLen; i++) {
      var ascii = binaryString.charCodeAt(i);
      bytes[i] = ascii;
  }
  return bytes;
}
export function saveByteArray(reportName, base64) {
  var byte = base64ToArrayBuffer(base64)
  if (byte != null) {
      var blob = new Blob([byte], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      var link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      //var fileName = reportName.replace(/[^a-zA-Z0-9]/g, "-");
      link.download = reportName;
      link.click();
      return true;
  }
  return false;
};
export function getMenu() {
  return store.getState().authentication.user.Menus || []
}
export function getDefaultPage () {
  var DefaultPage = store.getState().authentication.user.DefaultPage
  return DefaultPage ? DefaultPage.replace('#', '') : '/Customer/List'
}
