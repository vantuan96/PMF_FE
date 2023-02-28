import {
  CListGroupItem, CListGroup,
  CButton
} from '@coreui/react'
import BaseComponent from 'src/_components/BaseComponent'
import { Package } from "src/_services";
import { Loading } from 'src/_components'
import { CFade } from "@coreui/react";
import { Switch, Route } from "react-router-dom";
import ViewDetail from './View'
import clsx from 'clsx'
const getIcon = type => {
  return type ? 'fa fa-fw fa-angle-double-left' : 'fa fa-fw fa-angle-double-right'
}
const getIcon2 = type => {
  return type ? 'fa fa-fw fa-minus' : 'fa fa-fw fa-plus'
}
class PricePolicyAdmin extends BaseComponent {
  constructor(props) {
    super(props)
    this.state = {
      Results: null,
      Expand: true,
      isShowItemExpire: false
    };
  }
  componentDidUpdate(prevProps) {
    // if (this.props.location !== prevProps.location) {
    //   this.getData()
    // }
  }
  componentDidMount() {
    this.getData()
  }
  getData() {
    this.loading(true)
    new Package().find('PricePolicyCode/' + this.props.match.params.id)
      .then(response => {
        this.setState({
          Results: response.Results.map((item, index) => {
            item.STT = index + 1
            return item
          })
        });
        if (response.Results.length === 0) this.props.history.push(`/admin/price-policy/${this.props.match.params.id}/form/new`)
        if (response.Results.length && !this.props.location.pathname.includes('view')) this.props.history.push(`/admin/package/${this.props.match.params.id}/price-policy/${response.Results[0].Code}/view`)
      })
  }
  itemsIsExpireDate() {
    const { Results, isShowItemExpire } = this.state;
    var items = Results.filter(f => f.IsExpireDate)
    if (items.length === 0) return ''
    return (
      <>
        <CListGroupItem href="#" color="light" className="nowrap" onClick={() => this.setState({ isShowItemExpire: !isShowItemExpire })}>
          <i className={getIcon2(isShowItemExpire)} aria-hidden="true"></i><span className="text-danger">{'CS Hết hiệu lực'}</span>
        </CListGroupItem>
        {isShowItemExpire && <>
        {items.filter(f => f.IsExpireDate).map(e => {
          return (<CListGroupItem to={`/admin/package/${this.props.match.params.id}/price-policy/${e.Code}/view`}  color="light" className="pl-4 nowrap">
            <i className="fa fa-fw fa-minus hidden-elm" aria-hidden="true"></i>{e.Code}
          </CListGroupItem>)
        })}</>
        }
      </>
    )
  }
  render() {
    const { Results, Expand } = this.state;
    if (!Results) return (<Loading />)
    return (
      <div className="d-flex h100">
        <div className={clsx({
          'menu-left': true,
          'mr-3': true,
          'd-flex': true,
          expand: Expand
        })}>
          <div className="d-flex align-items-start flex-column">
            <div className="mb-auto w100">
              <div className="text-right">
                <CButton
                  title="Xem Danh sách Chính sách giá"
                  variant={'outline'}
                  color={'primary'}
                  size={'sm'}
                  className="m-2"
                  onClick={() => this.setState({ Expand: !Expand })}
                >
                  <i className={getIcon(Expand)} aria-hidden="true"></i>
                </CButton>
              </div>
              {Expand &&
                <CListGroup>
                  {Results.filter(f => !f.IsExpireDate).map(e => {
                    return (<CListGroupItem to={`/admin/package/${this.props.match.params.id}/price-policy/${e.Code}/view`} color="light">
                      {e.Code}
                    </CListGroupItem>)
                  })}
                  {this.itemsIsExpireDate()}
                </CListGroup>
              }
            </div>
            {Expand && ""}
          </div>
        </div>
        <div className="flex-grow-1">
          <Switch>
            <Route
              exact={true}
              name='viewdetail'
              path="/admin/package/:id/price-policy/:itemId/view"
              render={props => (
                <CFade>
                  <ViewDetail {...props} Expand={Expand}  />
                </CFade>
              )}
            />
          </Switch>
        </div>
      </div>
    )
  }
}
export default PricePolicyAdmin