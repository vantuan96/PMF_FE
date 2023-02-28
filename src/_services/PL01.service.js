import BaseService from './base.service'

export class Pl01Service extends BaseService {
  /**
   * The constructor for the ArtistService.
   *
   * @param {Object} parameters The query parameters.
   */
  constructor (parameters = {}) {
    super('report/pl01', parameters)
  }
}