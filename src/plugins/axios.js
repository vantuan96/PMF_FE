import Axios from 'axios'
Axios.defaults.baseURL = process.env.REACT_APP_API_URL
Axios.defaults.headers.common.Accept = 'application/json'
if (document.getElementsByName('__RequestVerificationToken').length) {
  Axios.defaults.headers.common.RequestVerificationToken = document.getElementsByName('__RequestVerificationToken')[0].value
}
if (document.getElementsByName('__PMSRequestVerificationToken').length) {
  Axios.defaults.headers.common.RequestVerificationToken = document.getElementsByName('__PMSRequestVerificationToken')[0].value
}
Axios.interceptors.response.use(
  response => {
    return response
  },
  (error) => {
    return Promise.reject(error)
  }
)
Axios.interceptors.request.use(config => {
  return config
})
Axios.interceptors.response.use(response => {
  return response
})