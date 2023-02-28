import BaseService from './base.service'

export class Pl08Service extends BaseService {
  /**
   * The constructor for the ArtistService.
   *
   * @param {Object} parameters The query parameters.
   */
  constructor (parameters = {}) {
    super('report/pl08', parameters)
  }
}