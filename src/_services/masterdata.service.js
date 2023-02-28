import BaseService from './base.service'

export class MasterDataService extends BaseService {
  /**
   * The constructor for the ArtistService.
   *
   * @param {Object} parameters The query parameters.
   */
  constructor (parameters = {}) {
    super('admin', parameters)
  }
  sites () {
    return this.find('site')
  }
  specialties () {
    return this.find('Category')
  }
}

