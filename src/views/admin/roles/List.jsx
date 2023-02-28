import React from 'react';
import {
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
import { RoleService } from 'src/_services'
import BaseComponent from 'src/_components/BaseComponent'
import {
  hasPermissions
} from 'src/_helpers'
class Roles extends BaseComponent {
  constructor(props) {
    super(props);
    this.defaultFilter = {
      Search: ''
    }
    this.state = {
      Results: null,
      pages: 1,
      query: this.defaultFilter
    };
    this.handleChange = this.handleChange.bind(this)
  }
  componentDidMount() {
    this.getData()
  }
  getData() {
    this.queryToState()
    setTimeout(() => {
      new RoleService(this.state.query).all()
        .then(response => {
          this.setState({ Results: response.Results });
          var bonus = 1
          if ((response.Count % process.env.REACT_APP_PAGE_SIZE) === 0) {
            bonus = 0
          }
          this.setState({ pages: parseInt(response.Count / process.env.REACT_APP_PAGE_SIZE) + bonus });
        })
    }, 100)
  }
  componentDidUpdate(prevProps, prevState, snapshot) {
    console.log('componentDidUpdate', prevProps, prevState, snapshot)
    if (this.props.location !== prevProps.location) {
      this.getData()
    }
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
                          <CInput  autoComplete="off" id="appendedInputButton" name="Search" value={query.Search} placeholder="Type to search" size="16" type="text" onChange={this.handleChange} />
                          <CInputGroupAppend>
                            <CButton color="secondary" type="submit"><VIcon size={'sm'} name='cilSearch' /> Tìm kiếm</CButton>
                          </CInputGroupAppend>
                        </CInputGroup>
                      </div>
                    </CFormGroup>
                  </CCol>
                  <CCol xs="5"></CCol>
                  <CCol xs="3">
                    {hasPermissions('ADMINROLE_CREATEROLEAPI') &&
                      <CFormGroup>
                        <CLabel htmlFor="appendedInputButton"></CLabel>
                        <div className="controls text-right">
                          <CButton color="warning" to="/roles/new"><VIcon size={'sm'} name='cilUserPlus' /> Tạo mới</CButton>
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
                  { key: 'ViName', label: 'Tên', _classes: 'font-weight-bold', style: { width: '1%' }, },
                  {
                    key: 'show_details',
                    label: '-/-',
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
                // onRowClick={(item) => this.props.history.push(`/roles/${item.Id}`)}
                scopedSlots={{
                  'show_details':
                    (item) => (
                      <td>
                        <CButton
                          color="primary"
                          size="sm"
                          onClick={() => this.props.history.push(`/roles/${item.Id}`)}
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
export default Roles