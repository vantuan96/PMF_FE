import React from 'react';
import BaseComponent from 'src/_components/BaseComponent'
import {
  CCard,
  CCardHeader,
  CCol,
  CRow,
  CFormGroup,
  CLabel,
  CButton,
  CButtonGroup,
  CForm
} from '@coreui/react'
import { VIcon, VDatePicker, Loading, DataTable, InputText } from 'src/_components'
import { dateToString } from 'src/_helpers'
import { PatientService } from 'src/_services'
import { Gender } from 'src/_constants'

class CustomerHis extends BaseComponent {
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
      sites: [],
      loaded: true
    };

    this.handleChange = this.handleChange.bind(this);
  }
  componentDidUpdate(prevProps, prevState, snapshot) {
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
      if (!this.state.query.Pid && !this.state.query.Name && !this.state.query.Mobile && !this.state.query.Birthday) {
        this.setState({ loaded: true });
        this.setState({ Results: null });
        return false
      }
      new PatientService(this.state.query).all()
        .then(response => {
          this.setState({
            Results: response.Results.map((e, index) => {
              e.STT = index + 1
              if (e.DateOfBirth) e.DateOfBirth = dateToString(e.DateOfBirth)
              return e
            })
          });
          var bonus = 1
          if ((response.Count % process.env.REACT_APP_PAGE_SIZE) === 0) {
            bonus = 0
          }
          this.setState({ pages: parseInt(response.Count / process.env.REACT_APP_PAGE_SIZE) + bonus });
          setTimeout(() => {
            this.setState({ loaded: true });
          }, 100);
        })
    }, 10)
  }
  handleFilterSubmit(e) {
    if (!this.state.query.Pid && !this.state.query.Name && !this.state.query.Mobile && !this.state.query.Birthday) {
      e.preventDefault()
      this.alert('L???i', 'Vui l??ng ch???n ??t nh???t m???t gi?? tr??? t??m ki???m');
      return false
    }
    if (e) {
      this.updateStateQuery('pageNumber', 1)
      e.preventDefault()
    }
    setTimeout(() => {
      this.updateUrlSearch()
    }, 100)
  }
  render() {
    const { Results, query, pages, loaded } = this.state;
    if (!loaded) return <Loading />
    return (
      <CRow>
        <CCol xl={12}>
          <CCard>
            <CCardHeader>
              <CForm onSubmit={this.handleFilterSubmit.bind(this)}>
                <CRow>
                  <CCol xs="3">
                    <CFormGroup>
                      <CLabel htmlFor="appendedInputButton">PID:</CLabel>
                      <div className="controls">
                        <InputText name="Pid" value={query.Pid} placeholder="Nh???p PID" size="16" type="text" onChange={this.handleChange} />
                      </div>
                    </CFormGroup>
                  </CCol>
                  <CCol xs="3">
                    <CFormGroup>
                      <CLabel htmlFor="appendedInputButton">H??? v?? t??n:</CLabel>
                      <div className="controls">
                        <InputText name="Name" value={query.Name} placeholder="Nh???p t??n Kh??ch h??ng" size="16" type="text" onChange={this.handleChange} />
                      </div>
                    </CFormGroup>
                  </CCol>
                 {/* <CCol xs="3">
                    <CFormGroup>
                      <CLabel htmlFor="appendedInputButton">S??? ??i???n tho???i:</CLabel>
                      <div className="controls">
                        <InputText name="Mobile" value={query.Mobile} placeholder="Nh???p S??? ??i???n tho???i" size="16" type="text" onChange={this.handleChange} />
                      </div>
                    </CFormGroup>
                  </CCol>*/}
                  <CCol xs="3">
                    <CFormGroup>
                      <CLabel htmlFor="appendedInputButton">Ng??y sinh:</CLabel>
                      <div className="controls">
                        <VDatePicker name="Birthday" value={query.Birthday} placeholder=" / /" size="16" type="text" onChange={this.handleChange} />
                      </div>
                    </CFormGroup>
                  </CCol>
                </CRow>
                <div>
                  <CFormGroup className="float-right">
                    <div className="controls">
                      <CButtonGroup>
                        <CButton color="secondary" type="submit"><VIcon size={'sm'} name='cilSearch' /> T??m ki???m</CButton>
                        <CButton color="warning" to={"/Customer/Search?v=" + (new Date().getTime())}>X??a</CButton>
                      </CButtonGroup>
                    </div>
                  </CFormGroup>
                </div>
              </CForm>
            </CCardHeader>
            
            {Results && <div className="click-table p-0 fix-pagination">
              <DataTable
                className="m-0"
                results={Results}
                fields={[
                  { key: 'STT', _classes: 'font-weight-bold', _style: { width: '1%', textAlign: 'right' }, },
                  {
                    key: 'PID',
                    label: 'PID',
                    _style: { width: '1%', whiteSpace: 'nowrap' },
                  },
                  {
                    key: 'FullName',
                    label: 'H??? v?? t??n',
                  },
                  {
                    key: 'Mobile',
                    label: 'S??T',
                  },
                  {
                    key: 'DateOfBirth',
                    label: 'Ng??y sinh',
                    _style: { width: '1%', whiteSpace: 'nowrap' },
                  },
                  {
                    key: 'Gender',
                    label: 'Gi???i t??nh',
                    _style: { width: '1%', whiteSpace: 'nowrap', textAlign: 'right' },
                  },
                  {
                    key: 'Address',
                    label: '?????a ch???',
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
                  'STT':
                    (item) => (
                      <td className="text-right" onDoubleClick={e => this.props.history.push(`/Customer/Register-Form/new?Pid=${item.PID}`)}>
                        {item.STT}
                      </td>
                    ),
                  'PID':
                    (item) => (
                      <td onDoubleClick={e => this.props.history.push(`/Customer/Register-Form/new?Pid=${item.PID}`)} className="nowrap">
                        {item.PID}
                      </td>
                    ),
                  'Address':
                    (item) => (
                      <td onDoubleClick={e => this.props.history.push(`/Customer/Register-Form/new?Pid=${item.PID}`)}>
                        {item.Address}
                      </td>
                    ),
                  'FullName':
                    (item) => (
                      <td onDoubleClick={e => this.props.history.push(`/Customer/Register-Form/new?Pid=${item.PID}`)} className="nowrap">
                        {item.FullName}
                      </td>
                    ),
                  'DateOfBirth':
                    (item) => (
                      <td onDoubleClick={e => this.props.history.push(`/Customer/Register-Form/new?Pid=${item.PID}`)} className="nowrap">
                        {item.DateOfBirth}
                      </td>
                    ),
                  'Mobile':
                    (item) => (
                      <td onDoubleClick={e => this.props.history.push(`/Customer/Register-Form/new?Pid=${item.PID}`)} className="nowrap">
                        {item.Mobile}
                      </td>
                    ),
                  'Gender':
                    (item) => (
                      <td onDoubleClick={e => this.props.history.push(`/Customer/Register-Form/new?Pid=${item.PID}`)} className="text-right">
                        {Gender[item.Gender]}
                      </td>
                    ),
                    'action':
                      (item) => (
                        <td className="nowrap ">
                          <CButton title="????ng k?? g??i" color="warning" to={"/Customer/Register-Form/new?Pid=" + item.PID} size="sm"><i className="fa fa-fw fa-plus" aria-hidden="true"></i></CButton>
                        </td>
                      ),
                }}
                activePage={query.pageNumber}
                onActivePageChange={this.pageChange.bind(this)}
                pages={pages}
              />
            </div>}
          </CCard>
        </CCol>
      </CRow>
    )
  }
}
export default CustomerHis