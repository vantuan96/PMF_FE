import BaseService from './base.service'

export class UserService extends BaseService {
  /**
   * The constructor for the ArtistService.
   *
   * @param {Object} parameters The query parameters.
   */
  constructor (parameters = {}) {
    super('admin/user', parameters)
  }
  destroy(id) {
    return this.submit('post', `/${this.endpoint}/inactive/${id}`)
  }
}
