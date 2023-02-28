import BaseService from '../base.service'
export class PricePolicy extends BaseService {
  /**
   * The constructor for the ArtistService.
   *
   * @param {Object} parameters The query parameters.
   */
  constructor(parameters = {}) {
    super('admin/Package/PricePolicy', parameters)
  }
  calculate (data) {
    return this.update('calculatePrice', data)
  }
  calculateDetail (data) {
    return this.update('calculateDetail', data)
  }
}