import BaseService from './base.service'

export class ServiceService extends BaseService {
  /**
   * The constructor for the ArtistService.
   *
   * @param {Object} parameters The query parameters.
   */
  constructor (parameters = {}) {
    super('admin/Service', parameters)
  }
}

