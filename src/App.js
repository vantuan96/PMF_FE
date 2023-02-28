import React, { Component } from 'react';
import { connect } from 'react-redux';
import { HashRouter, Route, Switch } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { alertActions } from './_actions';
import { history } from './_helpers';
import {
  CToast,
  CToastBody,
  CToastHeader,
  CToaster
} from '@coreui/react'
import './scss/style.scss';
import "@kenshooui/react-multi-select/dist/style.css"
import 'react-confirm-alert/src/react-confirm-alert.css'
import "react-table/react-table.css";
import "react-table-hoc-fixed-columns/lib/styles.css";
import 'src/plugins/axios'
import i18n from 'src/i18n'
import '@fortawesome/fontawesome-free/css/all.min.css';
const loading = (
  <div className="pt-3 text-center">
    <div className="sk-spinner sk-spinner-pulse"></div>
  </div>
)

// Containers
const TheLayout = React.lazy(() => import('./containers/TheLayout'));

// Pages
const Login = React.lazy(() => import('./views/pages/login'));
const Register = React.lazy(() => import('./views/pages/register/Register'));
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'));
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'));

class App extends Component {
  constructor(props) {
    super(props);
    history.listen(() => {
      // this.props.clearAlerts()
    })
  }
  
  render() {
    const { alert } = this.props;
    return (
      <HashRouter>
        <CToaster position={'top-right'}>
          {
            alert.map((toast, key) => {
              return (
                <CToast
                  key={'toast' + key}
                  show={true}
                  autohide={5000}
                  fade={true}
                  className={toast.type}
                >
                  <CToastHeader closeButton={true}>
                    {i18n.t('Thông báo')}
                  </CToastHeader>
                  <CToastBody>
                    {toast.message}
                  </CToastBody>
                </CToast>
              )
            })
          }
        </CToaster>
        <React.Suspense fallback={loading}>
          <Switch>
            <Route exact path="/login" name="Login Page" render={props => <Login {...props} />} />
            <Route exact path="/register" name="Register Page" render={props => <Register {...props} />} />
            <Route exact path="/404" name="Page 404" render={props => <Page404 {...props} />} />
            <Route exact path="/500" name="Page 500" render={props => <Page500 {...props} />} />
            <Route path="/" name="Home" render={props => <TheLayout {...props} />} />
          </Switch>
        </React.Suspense>
      </HashRouter>
    );
  }
}
function mapState(state) {
  const { alert } = state;
  return { alert };
}

const actionCreators = {
  clearAlerts: alertActions.clear
};
const connectedApp = connect(mapState, actionCreators)(App);
export default withTranslation()(connectedApp);
