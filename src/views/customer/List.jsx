import React from 'react';
import BaseComponent from 'src/_components/BaseComponent'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CButtonGroup,
  CLabel,
  CForm,
  CButton
} from '@coreui/react'
import {
  SiteSelect,
  InputSelect,
  Loading,
  InputText,
  VIcon,
  DataTable,
  ServiceAutosuggest
} from 'src/_components'
import { Gender } from 'src/_constants'
import { dateToString, hasPermissions } from 'src/_helpers'

import {PackageStatus} from 'src/_constants'
import { PatientService } from 'src/_services'
class CustomerList extends BaseComponent {
  constructor(props) {
    super(props);
    this.defaultFilter = {
      Search: '',
      Statuses: '*',
      Sites: '*',
      ContractOwner: ''
    }
    this.state = {
      Results: null,
      pages: 1,
      query: this.defaultFilter,
      groups: [],
      selectedAll: false,
      total: 0,
      sites: [],
      loaded: false
    };

    this.handleChange = this.handleChange.bind(this);
  }
  componentDidUpdate(prevProps, prevState, snapshot) {
    console.log('componentDidUpdate', prevProps, prevState, snapshot)
    if (this.props.location !== prevProps.location) {
      this.getData()
    }
  }
  async componentDidMount() {
    this.getData()
  }
  
  getData() {
    this.setState({ loaded: false });
    this.queryToState()
    setTimeout(() => {
      var query = { ...this.state.query, Limited: -1 }
      if (query.Sites && query.Sites === '*') query.Sites = null
      if (query.Statuses && query.Statuses === '*') query.Statuses = null
      new PatientService(query).getPackage()
        .then(response => {
          this.setState({ Results: response.Results.map((e, index) => {
            e.STT = index + 1
            return {...e.PatientInformation, ...e}
          }) });
          var bonus = 1
          if ((response.Count % process.env.REACT_APP_PAGE_SIZE) === 0) {
            bonus = 0
          }
          this.setState({ Count: response.Count });
          this.setState({ pages: parseInt(response.Count / process.env.REACT_APP_PAGE_SIZE) + bonus });
          setTimeout(() => {
            this.setState({ loaded: true });
          }, 100);
        }).catch(e => {
          setTimeout(() => {
            this.setState({ loaded: true });
          }, 100);
          this.setState({ Results: [] });
        })
    }, 10)
  }
  
  render() {
    const { Results, Count, query, pages, loaded } = this.state;
    if (!loaded) return <Loading />
    return (
      <CRow>
        <CCol xl={12}>
          <CCard>
            <CCardHeader>
              <CForm onSubmit={this.handleFilterSubmit.bind(this)}>
                <div className="d-flex flex-wrap">
                  <div className="filter-item zindex-106">
                    <CLabel>PID/ Tên Khách hàng:</CLabel>
                      <div className="controls">
                        <InputText name="Search" value={query.Search} placeholder="Nhập PID/ Tên Khách hàng" size="16" type="text" onChange={this.handleChange} />
                      </div>
                  </div>
                  <div className="filter-item zindex-105">
                    <CLabel htmlFor="appendedInputButton">Mã gói:</CLabel>
                    <div className="controls">
                      <ServiceAutosuggest objKey="Code" defaultValue={query.PackageCode} name="PackageCode" onChange={this.handleChange}/>
                    </div>
                  </div>
                  <div className="filter-item zindex-104">
                    <CLabel htmlFor="appendedInputButton">Tên gói:</CLabel>
                    <div className="controls">
                      <ServiceAutosuggest objKey="Name" defaultValue={query.PackageName} name="PackageName" onChange={this.handleChange}/>
                    </div>
                  </div>
                  <div className="filter-item zindex-103">
                    <CLabel htmlFor="appendedInputButton">Nơi kích hoạt gói:</CLabel>
                      <div className="controls">
                        <SiteSelect
                          name="Sites"
                          defaultValue={query.Sites}
                          applyCallback={this.handleChange}
                          isMulti={true}
                          hasSelectAll={true}
                        />
                      </div>
                  </div>
                  <div className="filter-item zindex-102">
                    <CLabel htmlFor="appendedInputButton">Trạng thái gói:</CLabel>
                      <div className="controls">
                        <InputSelect
                          name="Statuses"
                          options={PackageStatus}
                          defaultValue={query.Statuses || []}
                          applyCallback={this.handleChange}
                          isMulti={true}
                          hasSelectAll={true}
                        />
                      </div>
                  </div>
                  <div className="filter-item zindex-101">
                    <CLabel htmlFor="appendedInputButton">Nhân viện phụ trách:</CLabel>
                    <div className="controls">
                      <InputText
                        name="ContractOwner"
                        placeholder="Nhập Nhân viện phụ trách"
                        defaultValue={query.ContractOwner}
                        onChange={this.handleChange}
                      />
                    </div>
                  </div>
                  <div className="filter-item">
                    <label className="hidden-elm">Action:</label>
                    <div className="controls">
                      <CButtonGroup>
                        <CButton color="secondary" type="submit"><VIcon size={'sm'} name='cilSearch' /> Tìm kiếm</CButton>
                        <CButton color="warning" to={`/Customer/List?v=${new Date().getTime()}`}>Xóa</CButton>
                      </CButtonGroup>
                    </div>
                  </div>
                </div>
              </CForm>
            </CCardHeader>
            <CCardBody>
              {Results && <div className="click-table p-0 fix-pagination">
                <DataTable
                  className="m-0"
                  results={Results}
                  total={Count}
                  fields={[
                    { key: 'STT', _classes: 'font-weight-bold', _style: { width: '1%', textAlign: 'right' }, },
                    {
                      key: 'PID',
                      label: 'PID',
                      _style: { width: '1%', whiteSpace: 'nowrap' },
                    },
                    {
                      key: 'FullName',
                      label: 'Họ và tên',
                    },
                    {
                      key: 'Mobile',
                      label: 'SĐT',
                    },
                    {
                      key: 'DateOfBirth',
                      label: 'Ngày sinh',
                      _style: { width: '1%', whiteSpace: 'nowrap' },
                    },
                    {
                      key: 'Gender',
                      label: 'Giới tính',
                      _style: { width: '1%',},
                    },
                    {
                      key: 'ContractOwnerFullName',
                      label: 'Nhân viên phụ trách',
                      sorter: false,
                      filter: false
                    },
                    {
                      key: 'Package',
                      label: 'Mã - Tên gói',
                      sorter: false,
                      filter: false
                    },
                    {
                      key: 'Site',
                      label: 'Nơi kích hoạt gói',
                      sorter: false,
                      filter: false
                    },
                    {
                      key: 'Status',
                      label: 'Trạng thái',
                      sorter: false,
                      filter: false,
                      _style: { width: '1%', whiteSpace: 'nowrap' },
                    },
                    {
                      key: 'Time',
                      label: 'Thời gian áp dụng',
                      sorter: false,
                      filter: false
                    },
                    {
                      key: 'action',
                      label: '',
                      sorter: false,
                      filter: false,
                      _style: { width: '1%', whiteSpace: 'nowrap'}
                    }
                  ]}
                  scopedSlots={{
                    'action':
                      (item) => (
                        <td className="nowrap">
                          {hasPermissions(['ADMINPATIENTINPACKAGE_PATIENTINPACKAGEINFODETAILAPI']) && <CButton title="Xem chi tiết" color="secondary" to={"/Customer/Detail/" + item.Id + "/" + item.PID} size="sm"><i className="fa fa-fw fa-eye" aria-hidden="true"></i></CButton>} {" "}
                          {hasPermissions(['ADMINPATIENTINPACKAGE_REGISTERPACKAGEAPI']) && <CButton title="Đăng ký gói" color="warning" to={"/Customer/Register-Form/new?Pid=" + item.PID} size="sm"><i className="fa fa-fw fa-plus" aria-hidden="true"></i></CButton>}
                        </td>
                      ),
                    'STT':
                      (item) => (
                        <td className="text-right" onDoubleClick={e => hasPermissions(['ADMINPATIENTINPACKAGE_PATIENTINPACKAGEINFODETAILAPI']) && this.props.history.push("/Customer/Detail/" + item.Id + "/" + item.PID)}>
                          {item.STT}
                        </td>
                      ),
                    'PID':
                      (item) => (
                        <td className="nowrap" onDoubleClick={e => hasPermissions(['ADMINPATIENTINPACKAGE_PATIENTINPACKAGEINFODETAILAPI']) && this.props.history.push("/Customer/Detail/" + item.Id + "/" + item.PID)}>
                          {item.PID}
                        </td>
                      ),
                    'Address':
                      (item) => (
                        <td onDoubleClick={e => hasPermissions(['ADMINPATIENTINPACKAGE_PATIENTINPACKAGEINFODETAILAPI']) && this.props.history.push("/Customer/Detail/" + item.Id + "/" + item.PID)}>
                          {item.Address}
                        </td>
                      ),
                    'FullName':
                      (item) => (
                        <td className="" onDoubleClick={e => hasPermissions(['ADMINPATIENTINPACKAGE_PATIENTINPACKAGEINFODETAILAPI']) && this.props.history.push("/Customer/Detail/" + item.Id + "/" + item.PID)}>
                          {item.FullName}
                        </td>
                      ),
                    'DateOfBirth':
                      (item) => (
                        <td className="nowrap" onDoubleClick={e => hasPermissions(['ADMINPATIENTINPACKAGE_PATIENTINPACKAGEINFODETAILAPI']) && this.props.history.push("/Customer/Detail/" + item.Id + "/" + item.PID)}>
                          {dateToString(item.DateOfBirth)}
                        </td>
                      ),
                    'Mobile':
                      (item) => (
                        <td className="" onDoubleClick={e => hasPermissions(['ADMINPATIENTINPACKAGE_PATIENTINPACKAGEINFODETAILAPI']) && this.props.history.push("/Customer/Detail/" + item.Id + "/" + item.PID)}>
                          {item.Mobile}
                        </td>
                      ),
                    'Gender':
                      (item) => (
                        <td onDoubleClick={e => hasPermissions(['ADMINPATIENTINPACKAGE_PATIENTINPACKAGEINFODETAILAPI']) && this.props.history.push("/Customer/Detail/" + item.Id + "/" + item.PID)}>
                          {Gender[item.Gender]}
                        </td>
                      ),
                      'Site':
                      (item) => (
                        <td onDoubleClick={e => hasPermissions(['ADMINPATIENTINPACKAGE_PATIENTINPACKAGEINFODETAILAPI']) && this.props.history.push("/Customer/Detail/" + item.Id + "/" + item.PID)}>
                          {item.Site.ApiCode}
                        </td>
                      ),
                      'Package':
                      (item) => (
                        <td onDoubleClick={e => hasPermissions(['ADMINPATIENTINPACKAGE_PATIENTINPACKAGEINFODETAILAPI']) && this.props.history.push("/Customer/Detail/" + item.Id + "/" + item.PID)}>
                          {item.Package.PackageCode} - {item.Package.PackageName}
                        </td>
                      ),
                      'ContractOwnerFullName':
                      (item) => (
                        <td onDoubleClick={e => hasPermissions(['ADMINPATIENTINPACKAGE_PATIENTINPACKAGEINFODETAILAPI']) && this.props.history.push("/Customer/Detail/" + item.Id + "/" + item.PID)}>
                          {item.ContractOwner && <>{item.ContractOwnerFullName} ({item.ContractOwner})</>}
                        </td>
                      ),
                      
                      'Time':
                      (item) => (
                        <td onDoubleClick={e => hasPermissions(['ADMINPATIENTINPACKAGE_PATIENTINPACKAGEINFODETAILAPI']) && this.props.history.push("/Customer/Detail/" + item.Id + "/" + item.PID)}>
                          {dateToString(item.StartAt)} - {dateToString(item.EndAt)}
                        </td>
                      ),
                      'Status':
                      (item) => (
                        <td onDoubleClick={e => hasPermissions(['ADMINPATIENTINPACKAGE_PATIENTINPACKAGEINFODETAILAPI']) && this.props.history.push("/Customer/Detail/" + item.Id + "/" + item.PID)}>
                          {(PackageStatus.find(e => e.value === '' + item.Status) || {}).label}
                        </td>
                      )
                  }}
                  activePage={query.pageNumber}
                  onActivePageChange={this.pageChange.bind(this)}
                  pages={pages}
                />
              </div>}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    )
  }
}
export default CustomerList