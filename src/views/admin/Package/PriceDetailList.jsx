import React from "react"
import { Package } from "src/_services";
import BaseComponent from 'src/_components/BaseComponent'
import {
  CButton,
} from '@coreui/react'
import {
  Loading,
  DataTable,
  CurrencyText
} from 'src/_components'
import { history, hasPermissions } from 'src/_helpers';
class PriceDetailList extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {
      query: {
        pageNumber: 1,
        PageSize: process.env.REACT_APP_PAGE_SIZE
      }
    }
  }
  componentDidMount() {
    this.getData()
  }
  pageChange(newPage, oldpage) {
    if (this.state.query.pageNumber !== newPage && !oldpage) {
      this.updateStateQuery('pageNumber', newPage)
      setTimeout(() => {
        this.getData()
      })
    }
  }
  getData() {
    this.loading(true)
    new Package().find('PricePolicySite/' + this.props.PackageId)
      .then(response => {
        if (response.entities) {
          this.setState({
            Results: response.entities.map((item, index) => {
              item.STT = index + 1
              item.SiteName = item.Site ? item.Site.ApiCode : ''
              item.Time = (item.StartAt || '~~') + ' - ' + (item.EndAt || '~~')
              item.Notes = item.Notes || ''
              // item.PkgAmount = <CurrencyText value={item.PkgAmount} />
              // item.PkgAmountForeign = <CurrencyText value={item.PkgAmountForeign} />
              return item
            })
          });
        } else {
          this.setState({ Results: [] })
        }
        this.setState({ pages: 1 });
        this.loading(false)
      })
  }
  render() {
    const { isloading, Results, query, pages } = this.state
    if (isloading) return (<Loading />)
    var fields = [
      { key: 'STT', _classes: 'font-weight-bold', _style: { width: '1%' }, },
      {
        key: 'SiteName',
        label: 'Cơ sở',
        _style: { width: '1%', whiteSpace: 'nowrap' },
      },
      {
        key: 'PolicyCode',
        label: 'Chính sách giá',
        _style: { width: '1%', whiteSpace: 'nowrap' },
      },
      {
        key: 'PkgAmount',
        label: 'Người Việt Nam (VNĐ)',
        _style: { width: '1%', whiteSpace: 'nowrap' },
      },
      {
        key: 'PkgAmountForeign',
        label: 'Người nước ngoài (VNĐ)',
        _style: { width: '1%', whiteSpace: 'nowrap' },
      },
      {
        key: 'Time',
        label: 'Thời gian áp dụng',
        _style: { width: '200px', whiteSpace: 'nowrap' },
      },
      {
        key: 'Notes',
        label: 'Ghi chú',
        sorter: false,
        filter: false
      }
    ]
    return (
      <>
        {(Results && Results.length) ?
          <div className="click-table">
            <div className="mb-2 text-right">
            {hasPermissions(['ADMINPACKAGE_PRICEPOLICYDETAILAPI']) && <CButton to={`/admin/package/${this.props.PackageId}/price-policy/${Results[0].PolicyCode}/view`} type="button" color="info">Xem chi tiết giá gói</CButton>}
            </div>
            <DataTable
              onRowClick={(item) => history.push(`/admin/package/${this.props.PackageId}/price-policy/${item.PolicyCode}/view`)}
              results={Results}
              fields={fields}
              scopedSlots={{
                'PkgAmount':
                  (item) => (
                    <td>
                      <CurrencyText value={item.PkgAmount} />
                    </td>
                  ),
                  'Notes':
                  (item) => (
                    <td>
                      {item.Notes ? item.Notes.ViMessage : ''}
                    </td>
                  ),
                'PkgAmountForeign':
                  (item) => (
                    <td>
                      <CurrencyText value={item.PkgAmountForeign} />
                    </td>
                  )
              }}
              activePage={query.pageNumber}
              onActivePageChange={this.pageChange.bind(this)}
              pages={pages}
            />
          </div>
          :
          <div>
            <p className="text-center">Chưa thiết lập giá gói</p>
            {hasPermissions(['ADMINPACKAGE_CREATEORUPDATEPRICEPOLICYAPI']) && <CButton to={'/admin/price-policy/' + this.props.PackageId + '/form/new'} className="float-right" type="button" color="info">Thiết lập giá gói</CButton>}
          </div>
        }
      </>
    )
  }
}
export default PriceDetailList
