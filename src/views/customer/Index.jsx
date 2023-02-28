import React from 'react';
import BaseComponent from 'src/_components/BaseComponent'
import { CFade } from "@coreui/react";
import { Switch, Route } from "react-router-dom";
const CustomerList = React.lazy(() => import('./List'));
const CustomerHis = React.lazy(() => import('./Register/Search'));
const CustomerDetail = React.lazy(() => import('./Detail/Index'));

class Customers extends BaseComponent {
  render() {
    return (
      <Switch>
        <Route
          name="Danh sách khách hàng"
          path="/Customer"
          exact={true}
          render={props => (
            <CFade>
              <CustomerList
                {...props}
              />
            </CFade>
          )}
        />
        <Route
          name="Danh sách khách hàng"
          path="/Customer/List"
          exact={true}
          render={props => (
            <CFade>
              <CustomerList
                {...props}
              />
            </CFade>
          )}
        />
        <Route
          name="Tìm kiếm khách hàng"
          exact={true}
          path="/Customer/Search"
          render={props => (
            <CFade>
              <CustomerHis
                {...props}
              />
            </CFade>
          )}
        />
        <Route
          name="Xem chi tiết"
          exact={true}
          path="/Customer/Detail/:id"
          render={props => (
            <CFade>
              <CustomerDetail
                {...props}
              />
            </CFade>
          )}
        />
      </Switch>

    )
  }
}
export default Customers