import React from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CInput,
  CInputGroup,
  CInputGroupAppend,
  CInputGroupText,
  CRow
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { InputPassword } from 'src/_components'
import i18n from 'src/i18n'
import { connect } from 'react-redux';
import ReCAPTCHA from "react-google-recaptcha"
import { AccountService } from 'src/_services';
import { history } from 'src/_helpers';
import { userActions } from 'src/_actions';
const recaptchaRef = React.createRef()
class LoginPage extends React.Component {
  constructor(props) {
    super(props)
    // reset login status
    // history.push('dashboard');

    this.state = {
      username: '',
      password: '',
      submitted: false,
      hasCaptcha: false,
      countErr: 0,
      captcha: ''
    };

    this.handleChange = this.handleChange.bind(this);
    this.onChangeRecaptcha = this.onChangeRecaptcha.bind(this);
    this.onErroredRecaptcha = this.onErroredRecaptcha.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  onErroredRecaptcha() {
    if (recaptchaRef && recaptchaRef.current) recaptchaRef.current.reset()
  }
  onChangeRecaptcha(captcha) {
    this.setState({ captcha });
  }
  handleChange(e) {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  }
  // componentDidMount() {
  //   this.getCaptcha()
  // }
  getCaptcha() {
    new AccountService().find('account/ShowCaptcha').then(hasCaptcha => {
      this.setState({ hasCaptcha });
    })
  }
  componentDidMount() {
    let m = window.location.hash.toString().split('?');
    const queryParams = new URLSearchParams(m[1])
    const token = queryParams.get("token")
    localStorage.setItem('Token', JSON.stringify(token));
    console.log(localStorage.getItem('Token'));
    var value = localStorage.getItem('Token');
    if(value == "null" ){
      new AccountService().getUrlRedirect().then(
        response => {
       window.location.href = response.url;
        },
        error => {
        
        }
      );
    }
    else{
      history.push('/Dashboard')
    }
   

  }
  handleSubmit(e) {
    e.preventDefault();
    this.setState({ submitted: true });
    const { username, password, countErr, captcha, hasCaptcha } = this.state;
    if ((hasCaptcha || countErr > 3) && !captcha) return false
    if (username && password) {
      this.props.login(username, password, captcha);
      setTimeout(() => {
        this.setState({ countErr: countErr + 1 });
        this.onErroredRecaptcha()
      }, 500);
    }
  }

  render() {
    // const { loggingIn } = this.props;
    const { username, password, hasCaptcha, countErr } = this.state;
    return (
      <div className="c-app c-default-layout flex-row align-items-center login-page">
        <CContainer>
          <CRow className="justify-content-center">
            <CCol md="8">
              <CCardGroup>
                <CCard className="p-4">
                  <CCardBody>
                    <CForm onSubmit={this.handleSubmit}>
                      <h1>PMS - {i18n.t('Đăng nhập')}</h1>
                      <p className="text-muted">{i18n.t('Sử dụng tài khoản AD để đăng nhập')}</p>
                      <CInputGroup className="mb-3">
                        <CInput type="text" autoComplete="true" placeholder="Username" name="username" value={username} onChange={this.handleChange} />
                        <CInputGroupAppend>
                          <CInputGroupText>
                            <CIcon name="cil-user" />
                          </CInputGroupText>
                        </CInputGroupAppend>
                      </CInputGroup>
                      <div className="mb-3">
                        <InputPassword type="password" autoComplete="true" placeholder="Password" name="password" value={password} onChange={this.handleChange} />
                      </div>
                      {(hasCaptcha || countErr > 3) ?
                        <ReCAPTCHA
                          sitekey="6Le-TpgUAAAAAFuVBMGirRLgBR9WmzuyYeB5Fu3b"
                          onChange={this.onChangeRecaptcha}
                          onErrored={this.onErroredRecaptcha}
                          ref={recaptchaRef}
                        />
                        :
                        ''
                      }
                      <CRow>
                        <CCol xs="6">
                          <CButton type="submit" color="primary" className="px-4">{i18n.t('Đăng nhập')}</CButton>
                        </CCol>
                        <CCol xs="6" className="text-right">
                        </CCol>
                      </CRow>
                    </CForm>
                  </CCardBody>
                </CCard>
                <CCard className="d-md-down-none" style={{ width: '44%' }}>
                  <CCardBody className="">
                    <div>
                      <div className="text-center">
                        <img src={'images/logo.png'} alt="logo" className="c-logo-img" />
                        <hr />
                      </div>
                      <p>- {i18n.t('Tên đăng nhập Sử dụng account AD(là account đăng nhập vào máy tính với những máy Join domain Vingroup)')}</p>
                      <p>- {i18n.t('Mật khẩu Mật khẩu account AD')}</p>
                      <p>{i18n.t('Trường hợp không rõ Account AD của mình hoặc không đăng nhập được, vui lòng liên hệ bộ phận IT của đơn vị để kiểm tra')}</p>
                      <p><a href="https://vingroupjsc.sharepoint.com/sites/DR-VinMec/vmkht/vmcntt/tltk/Forms/Items.aspx?RootFolder=%2Fsites%2FDR-VinMec%2Fvmkht%2Fvmcntt%2Ftltk%2Fbieumau%2Ftlhdsd%2Fhdpms&FolderCTID=0x012000C7D06E1583C27D4D87181C7B29A9A99C&View=%7B65FA7BCF-5F5E-47E6-8FC4-5D87B2E98534%7D&OR=Teams-HL&CT=1641803175637&sourceId=¶ms=%7B%22AppName%22%3A%22Teams-Desktop%22%2C%22AppVersion%22%3A%2227%2F21110108719%22%7D" target="_blank"> <span className="badge badge-noti navbar-badge animation-s" ><i className="fa fa-fw fa-question" aria-hidden="true"></i></span>Hướng dẫn sử dụng</a></p>
                    </div>
                  </CCardBody>
                </CCard>
              </CCardGroup>
            </CCol>
          </CRow>
        </CContainer>
      </div>
    )
  }
}

function mapState(state) {
  const { loggingIn } = state.authentication;
  return { loggingIn };
}

const actionCreators = {
  login: userActions.login,
  logout: userActions.logout
};

const connectedLoginPage = connect(mapState, actionCreators)(LoginPage);
export default connectedLoginPage