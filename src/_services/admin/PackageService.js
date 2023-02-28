import BaseService from '../base.service'
export class PackageService extends BaseService {
  /**
   * The constructor for the ArtistService.
   *
   * @param {Object} parameters The query parameters.
   */
  constructor(parameters = {}) {
    super('admin/Package/Service', parameters)
  }
}