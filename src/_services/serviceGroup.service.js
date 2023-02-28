import BaseService from './base.service'

export class ServiceGroupService extends BaseService {
  /**
   * The constructor for the ArtistService.
   *
   * @param {Object} parameters The query parameters.
   */
  constructor (parameters = {}) {
    super('admin/ServiceGroup', parameters)
  }
}