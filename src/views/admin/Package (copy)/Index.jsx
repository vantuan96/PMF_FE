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
    const { Results, query, pages } = this.state;
    return (<CCardBody>
      <DataTable
        results={Results}
        fields={[
          { key: 'STT', _classes: 'font-weight-bold', _style: { width: '1%' }, },
          {
            key: 'Title',
            label: 'Mã - Tên gói',
          },
          {
            key: 'Group',
            label: 'Nhóm gói',
          },
          {
            key: 'Sites',
            label: 'Phạm vi áp dụng',
          },
          {
            key: 'IsActived',
            label: 'Trạng thái gói',
            _style: { width: '1%', whiteSpace: 'nowrap' },
          },
          {
            key: 'IsPriceSetted',
            label: 'Đã thiết lập giá',
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
          'IsActived':
            (item) => (
              <td>
                <CBadge color={getBadge(item.IsActived)}>
                  {item.IsActived ? 'Đang hoạt động' : 'Đã khóa'}
                </CBadge>
              </td>
            ),
          'Title':
            (item) => (
              <td>
                {item.Code + ' - ' + item.Name}
              </td>
            ),
          'IsPriceSetted':
            (item) => (
              <td>
                <CBadge color={getBadge(item.IsPriceSetted)}>
                  {item.IsPriceSetted ? 'Đã thiết lập giá' : 'Chưa thiết lập giá'}
                </CBadge>
              </td>
            ),
          'Group':
            (item) => (
              <td>
                {item.PackageGroup ? (item.PackageGroup.Code + ' - ' + item.PackageGroup.Name) : 'N/A'}
              </td>
            ),
          'Sites':
            (item) => (
              <td>
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
          <CDropdownItem to={"/admin/Package/" + item.Id + '/view'}>Xem</CDropdownItem>
          <CDropdownItem to={"/admin/Package/" + item.Id}>Sửa</CDropdownItem>
          <CDropdownItem to={"/admin/price-policy/" + item.Id + '/form/new'}>Thiết lập giá</CDropdownItem>
          <CDropdownItem disabled>Copy gói</CDropdownItem>
          <CDropdownItem divider />
          <CDropdownItem disabled>Xóa</CDropdownItem>
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
                <label>Mã - Tên gói:</label>
                <CInput autoComplete="off" maxLength="250" name="Keyword" value={query.Keyword} placeholder="Mã - Tên gói" type="text" onChange={this.handleChange} />
              </div>
              <div className="filter-item">
                <label>Nhóm gói:</label>
                <PackageGroupSelect
                  hasSelectAll={true}
                  isMulti={true}
                  name="Groups"
                  defaultValue={query.Groups}
                  applyCallback={this.handleChange}
                />
              </div>
              <div className="filter-item">
                <label>Phạm vi áp dụng:</label>
                <SiteSelect
                  hasSelectAll={true}
                  isMulti={true}
                  name="Sites"
                  defaultValue={query.Sites}
                  applyCallback={this.handleChange}
                />
              </div>
              <div className="filter-item">
                <label>Trạng thái gói:</label>
                <InputSelect name="Status" options={[{ value: '2', label: 'Tất cả'}, { value: '1', label: 'Đang hoạt động' }, { value: '0', label: 'Đã khóa' }]} defaultValue={query.Status} applyCallback={this.handleChange} />
              </div>
              <div className="filter-item">
                <label>Trạng thái thiết lập giá:</label>
                <InputSelect name="SetPrice" options={[{ value: '2', label: 'Tất cả'}, { value: '1', label: 'Đã thiết lập' }, { value: '0', label: 'Chưa thiết lập' }]} defaultValue={query.SetPrice} applyCallback={this.handleChange} />
              </div>
              <div className="filter-item">
                <label className="hidden-elm">Action:</label>
                <div>
                  <CButton className="nowrap" color="info" type="submit"><VIcon size={'sm'} name='cilSearch' /> Tìm kiếm</CButton>
                </div>
              </div>
              <div className="flex-grow-1">
                <label className="hidden-elm">Action:</label>
                <div className="text-right"><CButton className="nowrap" color="success" to="/admin/Package/new"><VIcon size={'sm'} name='cilPlus' /> Thêm mới</CButton> <CButton color="warning" to={'/admin/Package/?v=' + new Date().getTime()}>Xóa tìm kiếm</CButton></div>
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