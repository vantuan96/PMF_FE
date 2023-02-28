import BaseService from './base.service'

class RuleGroupService extends BaseService {
  /**
   * The constructor for the ArtistService.
   *
   * @param {Object} parameters The query parameters.
   */
  constructor (parameters = {}) {
    super('admin/Service/RuleGroup', parameters)
  }
}

export default RuleGroupService
