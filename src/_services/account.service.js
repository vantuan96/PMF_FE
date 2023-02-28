import BaseService from './base.service'
import { go2Login } from 'src/_helpers'
export class AccountService extends BaseService {
  /**
   * The constructor for the ArtistService.
   *
   * @param {Object} parameters The query parameters.
   */
  constructor (parameters = {}) {
    super('api/', parameters)
  }
  login (username, password, captcha) {
    return this.submit('post', `/${this.endpoint}account/login`, {username, password, captcha})
  }
  getInfo () {
    this.noError()
    return this.submit('get', `${this.endpoint}user/`)
  }
  getUrlRedirect(){
    this.noError()
    return this.submit('get', `${this.endpoint}account/RedirectUrl`,"")
  }
  logout () {
    localStorage.removeItem('Token');
    // console.log(localStorage.getItem('Token'));
     return this.submit('get', `/${this.endpoint}account/Logout`, "");

    //  go2Login()
  }
  listApp(){
    var postUrl  = process.env.REACT_APP_BASE_API_URL;  
    return this.submit('get', `${postUrl}api/MemberShip/GetListManageAppFE`, "");
  }
}