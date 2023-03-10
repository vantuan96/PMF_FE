import {
  CForm,
  CInput,
  CRow,
  CCol,
  CButton,
  CCard,
  CCardHeader,
  CBadge,
  CDropdown, CDropdownToggle, CDropdownMenu, CDropdownItem, CCardBody
} from '@coreui/react'
import BaseComponent from 'src/_components/BaseComponent'
import { Package } from "src/_services";
import {
  hasPermissions
} from 'src/_helpers'
import { Loading, SiteSelect, VIcon, PackageGroupSelect, InputSelect, DataTable } from 'src/_components'
const getBadge = IsDeleted => {
  return IsDeleted ? 'success' : 'danger'
}
class PackageAdmin extends BaseComponent {
  constructor(props) {
    super(props)
    this.defaultFilter = {
      Keyword: '',
      Groups: '*',
      Sites: '*',
      Status: '2',
      SetPrice: '2'
    }
    this.state = {
      loading: true,
      query: {
      }
    };
    this.handleChange = this.handleChange.bind(this);
  }
  componentDidUpdate(prevProps) {
    if (this.props.location !== prevProps.location) {
      this.getData()
    }
  }
  componentDidMount() {
    this.getData()
  }
  getData() {
    this.setState({ loading: true })
    this.queryToState()
    setTimeout(() => {
      var query = { ...this.state.query, Limited: -1 }
      if (query.Status && query.Status === '2') query.Status = -1
      if (query.SetPrice && query.SetPrice === '2') query.SetPrice = -1
      if (query.Sites && query.Sites === '*') query.Sites = null
      if (query.Groups && query.Groups === '*') query.Groups = null
      new Package(query).all()
        .then(response => {
          this.setState({
            Results: response.Results.map((item, index) => {
              item.STT = index + 1
              return item
            })
          });
          var bonus = 1
          if ((response.Count % process.env.REACT_APP_PAGE_SIZE) === 0) {
            bonus = 0
          }
          this.setState({ pages: parseInt(response.Count / process.env.REACT_APP_PAGE_SIZE) + bonus });
          this.setState({ loading: false })
          this.setState({ Count: response.Count })
        })
    }, 100);
  }
  getSite (item) {
    var sitess = item.Sites.filter(e => e.length)
    var arr = []
    sitess.forEach(sites => {
      arr = arr.concat(sites.filter(f => f).map(f => f.Name))
    })
    return [...new Set(arr)].join(', ')
  }
  table() {
    const { Results, query, pages, Count } = this.state;
    return (<CCardBody className="click-table fix-pagination">
      <DataTable
        total={Count}
        results={Results}
        fields={[
          { key: 'STT', _classes: 'font-weight-bold', _style: { width: '1%' }, },
          {
            key: 'Title',
            label: 'M?? - T??n g??i',
          },
          {
            key: 'Group',
            label: 'Nh??m g??i',
          },
          {
            key: 'Sites',
            label: 'Ph???m vi ??p d???ng',
          },
          {
            key: 'IsActived',
            label: 'Tr???ng th??i g??i',
            _style: { width: '1%', whiteSpace: 'nowrap' },
          },
          {
            key: 'IsPriceSetted',
            label: '???? thi???t l???p gi??',
            _style: { width: '1%', whiteSpace: 'nowrap' },
          },
          {
            key: 'show_details',
            label: '',
            _style: { width: '1%', whiteSpace: 'nowrap' },
            sorter: false,
            filter: false
          }
        ]}
        scopedSlots={{
          'STT':
            (item) => (
              <td className="text-right" onDoubleClick={e => this.props.history.push("/admin/Package/" + item.Id + '/view')}>
                {item.STT}
              </td>
            ),
          'IsActived':
            (item) => (
              <td onDoubleClick={e => this.props.history.push("/admin/Package/" + item.Id + '/view')}>
                <CBadge color={getBadge(item.IsActived)}>
                  {item.IsActived ? '??ang s??? d???ng' : '???? kh??a'}
                </CBadge>
              </td>
            ),
          'Title':
            (item) => (
              <td onDoubleClick={e => this.props.history.push("/admin/Package/" + item.Id + '/view')}>
                {item.Code + ' - ' + item.Name}
              </td>
            ),
          'IsPriceSetted':
            (item) => (
              <td onDoubleClick={e => this.props.history.push("/admin/Package/" + item.Id + '/view')}>
                <CBadge color={getBadge(item.IsPriceSetted)}>
                  {item.IsPriceSetted ? '???? thi???t l???p gi??' : 'Ch??a thi???t l???p gi??'}
                </CBadge>
              </td>
            ),
          'Group':
            (item) => (
              <td onDoubleClick={e => this.props.history.push("/admin/Package/" + item.Id + '/view')}>
                {item.PackageGroup ? (item.PackageGroup.Code + ' - ' + item.PackageGroup.Name) : 'N/A'}
              </td>
            ),
          'Sites':
            (item) => (
              <td onDoubleClick={e => this.props.history.push("/admin/Package/" + item.Id + '/view')}>
                {this.getSite(item)}
              </td>
            ),
          'show_details':
            (item) => (
              <td>
                {this.btnEdit(item)}
              </td>
            )
        }}
        activePage={query.pageNumber}
        onActivePageChange={this.pageChange.bind(this)}
        pages={pages}
      />
    </CCardBody>)
  }
  btnEdit(item) {
    return (
      <CDropdown className="dropdown-sm">
        <CDropdownToggle color="info" size="sm">
          <i className="fa fa-fw fa-bars" aria-hidden="true"></i>
        </CDropdownToggle>
        <CDropdownMenu>
          {hasPermissions(['ADMINPACKAGE_GETPACKAGEDETAILAPI']) && <CDropdownItem to={"/admin/Package/" + item.Id + '/view'}>Xem</CDropdownItem>}
          {hasPermissions(['ADMINPACKAGE_UPDATEPACKAGEAPI']) && <CDropdownItem to={"/admin/Package/" + item.Id}>S???a</CDropdownItem>}
          {hasPermissions(['ADMINPACKAGE_CREATEORUPDATEPRICEPOLICYAPI']) && <CDropdownItem to={"/admin/price-policy/" + item.Id + '/form/new'}>Thi???t l???p gi??</CDropdownItem>}
          {/* {hasPermissions(['ADMINPACKAGE_GETPACKAGEDETAILAPI']) && <CDropdownItem disabled>Copy g??i</CDropdownItem>} */}
          {hasPermissions(['ADMINPACKAGE_DELETEPACKAGEAPI']) && <CDropdownItem divider />}
          {hasPermissions(['ADMINPACKAGE_DELETEPACKAGEAPI']) && <CDropdownItem disabled>X??a</CDropdownItem>}
        </CDropdownMenu>
      </CDropdown>
    )
  }
  filterForm() {
    const { query } = this.state
    return (
      <>
        <CCardHeader>
          <CForm onSubmit={this.handleFilterSubmit.bind(this)}>
            <div className="d-flex flex-wrap">
              <div className="filter-item">
                <label>M?? - T??n g??i:</label>
                <CInput autoComplete="off" maxLength="250" name="Keyword" value={query.Keyword} placeholder="M?? - T??n g??i" type="text" onChange={this.handleChange} />
              </div>
              <div className="filter-item">
                <label>Nh??m g??i:</label>
                <PackageGroupSelect
                  hasSelectAll={true}
                  isMulti={true}
                  name="Groups"
                  defaultValue={query.Groups}
                  applyCallback={this.handleChange}
                />
              </div>
              <div className="filter-item">
                <label>Ph???m vi ??p d???ng:</label>
                <SiteSelect
                  hasSelectAll={true}
                  isMulti={true}
                  name="Sites"
                  defaultValue={query.Sites}
                  applyCallback={this.handleChange}
                />
              </div>
              <div className="filter-item">
                <label>Tr???ng th??i g??i:</label>
                <InputSelect name="Status" options={[{ value: '2', label: 'T???t c???'}, { value: '1', label: '??ang s??? d???ng' }, { value: '0', label: '???? kh??a' }]} defaultValue={query.Status} applyCallback={this.handleChange} />
              </div>
              <div className="filter-item">
                <label>Tr???ng th??i thi???t l???p gi??:</label>
                <InputSelect name="SetPrice" options={[{ value: '2', label: 'T???t c???'}, { value: '1', label: '???? thi???t l???p' }, { value: '0', label: 'Ch??a thi???t l???p' }]} defaultValue={query.SetPrice} applyCallback={this.handleChange} />
              </div>
              <div className="filter-item">
                <label className="hidden-elm">Action:</label>
                <div>
                  <CButton className="nowrap" color="info" type="submit"><VIcon size={'sm'} name='cilSearch' /> T??m ki???m</CButton>
                </div>
              </div>
              <div className="flex-grow-1">
                <label className="hidden-elm">Action:</label>
                <div className="text-right">
                {hasPermissions(['ADMINPACKAGE_CREATEPACKAGEAPI']) && <CButton className="nowrap" color="success" to="/admin/Package/new"><VIcon size={'sm'} name='cilPlus' /> Th??m m???i</CButton>}
                <CButton color="warning" to={'/admin/Package/?v=' + new Date().getTime()}>X??a t??m ki???m</CButton>
                </div>
              </div>
            </div>
          </CForm>
        </CCardHeader>
      </>
    )
  }
  render() {
    const { loading } = this.state;
    if (loading) return (<Loading />)
    return (
      <>
        <CRow>
          <CCol xl={12}>
            <CCard>
              {this.filterForm()}
              {this.table()}
            </CCard>
          </CCol>
        </CRow>
      </>
    )
  }
}
export default PackageAdmin