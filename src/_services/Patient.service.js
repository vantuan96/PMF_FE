import BaseService from './base.service'

export class PatientService extends BaseService {
  /**
   * The constructor for the ArtistService.
   *
   * @param {Object} parameters The query parameters.
   */
  constructor (parameters = {}) {
    super('admin/Patient', parameters)
  }
  createPackage (formData) {
    return this.submit('post', `/${this.endpoint}/Package`, formData)
  }
  getPackage () {
    return this.submit('get', `/${this.endpoint}/Package`)
  }
}