import React from 'react';
import BaseComponent from 'src/_components/BaseComponent'
import {
  CBadge,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CDataTable,
  CRow,
  CPagination,
  CInput,
  CFormGroup,
  CLabel,
  CButton,
  CInputGroup,
  CInputGroupAppend,
  CForm
} from '@coreui/react'
import { VIcon } from 'src/_components'
import {
  hasPermissions
} from 'src/_helpers'
import { UserService, SiteService } from 'src/_services'
const getBadge = IsDeleted => {
  return IsDeleted ? 'danger' : 'success'
}
class Users extends BaseComponent {
  constructor(props) {
    super(props);
    this.defaultFilter = {
      Search: ''
    }
    this.state = {
      Results: null,
      pages: 1,
      query: this.defaultFilter,
      groups: [],
      selectedAll: false,
      total: 0,
      sites: []
    };

    this.handleChange = this.handleChange.bind(this);
  }
  componentDidUpdate(prevProps, prevState, snapshot) {
    
    var m = localStorage.getItem("Token");
    console.log('componentDidUpdate', prevProps, prevState, snapshot)
    if (this.props.location !== prevProps.location) {
      this.getData()
    }
  }
  async componentDidMount() {
    var m = localStorage.getItem("Token");
    await this.getSite()
    this.getData()
  }
  async getSite() {
    await new SiteService().getAllFromStorage('_Sites').then(res => {
      this.setState({
        sites: res.map(e => {
          e.value = e.Id
          e.label = e.Name
          return e
        })
      });
      this.setState({ loading: false })
    });
  }
  getData() {
    this.queryToState()
    setTimeout(() => {
      new UserService(this.state.query).all()
        .then(response => {
          this.setState({ Results: response.Results });
          var bonus = 1
          if ((response.Count % process.env.REACT_APP_PAGE_SIZE) === 0) {
            bonus = 0
          }
          this.setState({ pages: parseInt(response.Count / process.env.REACT_APP_PAGE_SIZE) + bonus });
        })
    }, 10)
  }
  render() {
    const { Results, query, pages } = this.state;
    return (
      <CRow>
        <CCol xl={12}>
          <CCard>
            <CCardHeader>
              <CForm onSubmit={this.handleFilterSubmit.bind(this)}>
                <CRow>
                  <CCol xs="4">
                    <CFormGroup>
                      <CLabel htmlFor="appendedInputButton"></CLabel>
                      <div className="controls">
                        <CInputGroup>
                          <CInput id="appendedInputButton" name="Search" value={query.Search} placeholder="Enter username" size="16" type="text" onChange={this.handleChange} />
                          <CInputGroupAppend>
                            <CButton color="secondary" type="submit"><VIcon size={'sm'} name='cilSearch' /> Tìm kiếm</CButton>
                          </CInputGroupAppend>
                        </CInputGroup>
                      </div>
                    </CFormGroup>
                  </CCol>
                  <CCol xs="5"></CCol>
                  <CCol xs="3">
                    {hasPermissions('ADMINUSER_CREATEUSERDETAILAPI') &&
                      <CFormGroup>
                        <CLabel htmlFor="appendedInputButton"></CLabel>
                        <div className="controls text-right">
                          <CButton color="warning" to="/users/new"><VIcon size={'sm'} name='cilUserPlus' /> Tạo mới</CButton>
                        </div>
                      </CFormGroup>
                    }
                  </CCol>
                </CRow>
              </CForm>
            </CCardHeader>
            <CCardBody className="fix-pagination">
              <CDataTable
                items={Results}
                fields={[
                  { key: 'Username', _classes: 'font-weight-bold', _style: { width: '1%' }, },
                  'Fullname', 'Title',
                  {
                    key: 'Roles',
                    label: 'Nhóm người dùng'
                  },
                  {
                    key: 'IsDeleted',
                    label: 'Trạng thái',
                    _style: { width: '1%' }
                  },
                  {
                    key: 'show_details',
                    label: '',
                    _style: { width: '1%' },
                    sorter: false,
                    filter: false
                  }
                ]}
                hover
                // size="sm"
                striped
                // itemsPerPage={process.env.REACT_APP_PAGE_SIZE}
                // activePage={page}
                // clickableRows
                // itemsPerPageSelect
                // onPaginationChange={pageChange}
                // sorter
                bordered
                // onRowClick={(item) => this.props.history.push(`/users/${item.Id}`)}
                scopedSlots={{
                  'Roles':
                    (item) => (
                      <td>
                        {item.ListRoles ? item.ListRoles.map(e => e.RoleName).join(', ') : ''}
                      </td>
                    ),
                  'IsDeleted':
                    (item) => (
                      <td>
                        <CBadge color={getBadge(item.IsDeleted)}>
                          {item.IsDeleted ? 'Đã khóa' : 'Đang hoạt động'}
                        </CBadge>
                      </td>
                    ),
                  'show_details':
                    (item) => (
                      <td>
                        <CButton
                          color="primary"
                          size="vsm"
                          onClick={() => this.props.history.push(`/users/${item.Id}`)}
                        >
                          Xem
                          </CButton>
                      </td>
                    )
                }}
              />
              <div className="c-paginationx">
              <CPagination
                activePage={query.pageNumber}
                onActivePageChange={this.pageChange.bind(this)}
                pages={pages}
                doubleArrows={true}
                align="start"
              />
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    )
  }
}
export default Users