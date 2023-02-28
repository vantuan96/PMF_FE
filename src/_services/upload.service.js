import BaseService from "./base.service";
import Axios from 'axios'
export class UploadService extends BaseService {
  /**
   * The constructor for the ArtistService.
   *
   * @param {Object} parameters The query parameters.
   */
  constructor(parameters = {}) {
    super("admin/package/AddOn/UpdateServiceReplace", parameters);
  }
  upload(file) {
    this.loading();
    let formData = new FormData();
    formData.append('data', file);
    return new Promise((resolve, reject) => {
      Axios['post'](`${this.endpoint}/`, formData, {
        useCredentails: true,
        headers: {
          "Content-Type": "multipart/form-data"
        }
      })
        .then(response => {
          this.loadingEnd();
          resolve(response.data);
        })
        .catch(({ response }) => {
          this.loadingEnd();
          this.handleErrorResponse(response);
          reject(response);
        });
    });
  }
}
