import Axios from 'axios'
import { alertActions } from 'src/_actions'
import { store, storage, slugify } from 'src/_helpers'
import { mesageConstants } from 'src/_constants'
import NProgress from 'nprogress'
import { history } from '../_helpers';

class BaseService {
  /**
   * The constructor of the BaseService.
   *
   * @param {string} endpoint   The endpoint being used.
   * @param {Object} parameters The parameters for the request.
   */
  constructor(endpoint, parameters = {}) {
    this.endpoint = endpoint
    this.parameters = parameters
    this.hideLoading = false
    this.hideError = false
  }

  /**
   * Method used to set the query parameters.
   *
   * @param {Object} parameters The given parameters.
   *
   * @returns {BaseService} The instance of the proxy.
   */
  setParameters(parameters) {
    Object.keys(parameters).forEach((key) => {
      this.parameters[key] = parameters[key]
    })

    return this
  }

  /**
   * Method used to set a single parameter.
   *
   * @param {string} parameter The given parameter.
   * @param {*} value The value to be set.
   *
   * @returns {BaseService} The instance of the proxy.
   */
  setParameter(parameter, value) {
    this.parameters[parameter] = value

    return this
  }

  /**
   * Method used to remove all the parameters.
   *
   * @param {Array} parameters The given parameters.
   *
   * @returns {BaseService} The instance of the proxy.
   */
  removeParameters(parameters) {
    parameters.forEach((parameter) => {
      delete this.parameters[parameter]
    })

    return this
  }

  /**
   * Method used to remove a single parameter.
   *
   * @param {string} parameter The given parameter.
   *
   * @returns {BaseService} The instance of the proxy.
   */
  removeParameter(parameter) {
    delete this.parameters[parameter]
    return this
  }
  noLoading() {
    this.hideLoading = true
    return this
  }
  noError() {
    this.hideError = true
    return this
  }
  loading () {
    if (!this.hideLoading) NProgress.start()
  }
  loadingEnd () {
    setTimeout(() => {
      NProgress.done()
    }, 500)
  }
  /**
   * The method used to perform an AJAX-request.
   *
   * @param {string}      requestType The request type.
   * @param {string}      url         The URL for the request.
   * @param {Object|null} data        The data to be send with the request.
   *
   * @returns {Promise} The result in a promise.
   */
  submit(requestType, url, data = null) {
    this.loading()
    // this.setParameter('_currrentUrl', Vue.router.currentRoute.fullPath)
    return new Promise((resolve, reject) => {
      Axios[requestType](url + this.getParameterString(), data, { useCredentails: true })
        .then((response) => {
          this.loadingEnd()
          resolve(response.data)
        })
        .catch(({ response }) => {
          this.loadingEnd()
          this.handleErrorResponse(response)
          reject(response)
        })
    })
  }
  handleErrorResponse(error) {
    if (this.hideError) return
    if (error) {
      switch (error.status) {
        case 400:
          this._404(error.data.ViMessage)
          break;
        case 401:
            this._401(error.data.ViMessage)
            break;
        case 404:
          this._404(error.data.ViMessage)
          break;
        default:
          break;
      }
      store.dispatch(alertActions.error(error.data.ViMessage))
    } else {
      store.dispatch(alertActions.error(mesageConstants.ERROR))
    }
  }
  _404(msg) {
    // history.push({
    //   pathname: '/404',
    //   search: '?error=' + msg
    // })
  }
  _401(msg) {
    history.push({
      pathname: '/login',
      search: '?error=' + msg
    })
  }
  getAllFromStorage(key) {
    return new Promise((resolve) => {
      var fromStorage = storage.get(key)
      if (fromStorage) {
        return resolve(fromStorage)
      } else {
        return this.submit('get', `/${this.endpoint}/`).then((response) => {
          let results = response
          results.map(e => {
            // e.paths = (e.path || '').split('/').filter(e => e)
            e.searchText = slugify(e.Name || e.ViName)
            return e
          })
          response.results = results
          storage.set(key, (response))
          resolve(response)
        })
      }
    })
  }
  /**
   * Method used to fetch all items from the API.
   *
   * @returns {Promise} The result in a promise.
   */
  all() {
    return this.submit('get', `/${this.endpoint}`)
  }

  /**
   * Method used to fetch a single item from the API.
   *
   * @param {int} id The given identifier.
   *
   * @returns {Promise} The result in a promise.
   */
  find(id) {
    return this.submit('get', `/${this.endpoint}/${id}`)
  }

  /**
   * Method used to create an item.
   *
   * @param {Object} item The given item.
   *
   * @returns {Promise} The result in a promise.
   */
  create(item) {
    return this.submit('post', `/${this.endpoint}`, item)
  }
  createOrUpdate(item) {
    if (item.Id) {
      return this.update(item.Id, item)
    }
    return this.submit('post', `/${this.endpoint}`, item)
  }
  /**
   * Method used to update an item.
   *
   * @param {int}    id   The given identifier.
   * @param {Object} item The given item.
   *
   * @returns {Promise} The result in a promise.
   */
  update(id, item) {
    return this.submit('post', `/${this.endpoint}/${id}`, item)
  }
  patch(id, item) {
    return this.submit('patch', `/${this.endpoint}/${id}`, item)
  }
  /**
   * Method used to destroy an item.
   *
   * @param {int} id The given identifier.
   *
   * @returns {Promise} The result in a promise.
   */
  destroy(id) {
    return this.submit('delete', `/${this.endpoint}/${id}`)
  }

  /**
   * Method used to transform a parameters object to a parameters string.
   *
   * @returns {string} The parameter string.
   */
  getParameterString() {
    const keys = Object.keys(this.parameters)
    var parameterStrings = keys
      .filter(key => this.parameters[key] !== null && this.parameters[key] !== undefined)
      .map(key => `${key}=${this.parameters[key]}`)
    return parameterStrings.length === 0 ? '' : `?${parameterStrings.join('&')}`
    // console.log(window.location)
    // parameterStrings.push(`_currentRoute=${window.location.hash}`)
    // const stringified = qs.stringify(this.parameters);
    // return `?${stringified}`
  }
}

export default BaseService
