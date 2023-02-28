import React from 'react';
import BaseComponent from 'src/_components/BaseComponent'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CButton,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CForm,
  CLabel,
  CButtonGroup,
  CFormGroup, CInputCheckbox
} from '@coreui/react'
import {
  hasPermissions
} from 'src/_helpers'
import {
  Loading,
  InputText,
  VIcon,
  VDatePicker,
  DataTable
} from 'src/_components'
import { confirmAlert } from 'react-confirm-alert'
import { Gender } from 'src/_constants'
import { PatientService } from "src/_services";
import { dateToString } from 'src/_helpers'
class Child extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {
      Results: null,
      Data: null,
      isOpen: false,
      query: {
        pages: 1,
        total: 0
      },
      selectedPID: []
    };
    this.handleChange = this.handleChange.bind(this);
    this.selectedService = this.selectedService.bind(this)
    this.commit = this.commit.bind(this)
    this.removeConfirm = this.removeConfirm.bind(this)
    this.closeConfirm = this.closeConfirm.bind(this)
  }
  componentDidMount() {
    this.getData()
  }
  pageChange(newPage, oldpage) {
    if (this.state.query.pageNumber !== newPage && !oldpage) {
      this.updateStateQuery('pageNumber', newPage)
      setTimeout(() => {
        this.search()
      })
    }
  }
  validateData () {
    var {selectedPID, Data} = this.state
    console.log(this.props.data.PatientModel)
    var isParrentPid = selectedPID.find(e => e.PID === this.props.data.PatientModel.PID)
    if (isParrentPid) {
      this.alertError('PID đã tồn tại trong gói. Vui lòng chọn lại.');
      return false
    }
    var isHasChilPid = selectedPID.find(e => Data && (Data.map(f => {return f.PatientInformation.PID}).includes(e.PID)))
    if (isHasChilPid) {
      this.alertError('PID đã tồn tại trong gói. Vui lòng chọn lại');
      return false
    }
    return true
  }
  commit (type) {
    var selectedPID = this.state.selectedPID
    if (this.validateData()) {
      new PatientService().update('Package/Children/', {
        PatientInPackageId: this.props.match.params.id,
        Children: selectedPID.map(e => {
          return {
            pid: e.PID,
            IsDeleted: false
          }
        })
      })
        .then(({results}) => {
          if (type === 1) this.close()
          this.getData()
        })
    }
  }
  clearSelectedService() {
    this.setState({
      selectedPID: []
    })
    this.setState({
      selectedAll: false
    })
    if (this.state.Results) {
      var Datas = this.state.Results.map(e => {
        e.selected = false
        return e
      })
      this.setState({
        Results: Datas
      })
    }
  }
  setSelectedPID() {
    var selectedPID = this.state.selectedPID
    this.state.Results.forEach(e => {
      if (e.selected && !selectedPID.find(ser => ser.PID === e.PID)) {
        selectedPID.push(e)
      }
      if (!e.selected && selectedPID.find(ser => ser.PID === e.PID)) {
        selectedPID = selectedPID.filter(ser => ser.PID !== e.PID)
      }
    })
    this.setState({
      selectedPID: selectedPID
    })
  }
  selectedService(event) {
    const { name, value, checked } = event.target;
    var Datas = []
    if (name === 'select-allx') {
      Datas = this.state.Results.map(e => {
        e.selected = checked
        return e
      })
      this.setState({
        selectedAll: checked
      })
    } else {
      Datas = this.state.Results.map(e => {
        if (value === e.PID) e.selected = checked
        return e
      })
    }
    this.setState({
      Results: Datas
    })
    this.setSelectedPID()
  }
  handleFilterSubmit(e) {
    if (e) {
      this.updateStateQuery('pageNumber', 1)
      e.preventDefault()
    }
    setTimeout(() => {
      this.search()
    }, 100)
  }
  handleChange(e) {
    const {
      name,
      value
    } = e.target;
    this.updateStateQuery(name, value)
  }
  updateStateQuery(name, value) {
    var query = {
      ...this.state.query
    }
    query[name] = value
    this.setState({
      query
    })
  }
  search () {
    this.setState({ loaded: false });
    setTimeout(() => {
      if (!this.state.query.Pid && !this.state.query.Name && !this.state.query.Birthday) {
        this.alertError('Vui lòng chọn ít nhất một giá trị tìm kiếm')
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
                e.selected = this.state.selectedPID.filter(ser => ser.PID === e.PID).length !== 0
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
  getData () {
    if (!this.props.data.IsIncludeChild) return
  	new PatientService().find('Package/Children/' + this.props.match.params.id)
      .then(({results}) => {
        this.setState({Data: results})
      })
  }
  closeConfirm () {
    if (this.state.selectedPID && this.state.selectedPID.length) {
      confirmAlert({
        message: 'Bạn chưa lưu dữ liệu. Bạn có chắc chắn muốn hủy?',
        buttons: [
          {
            label: 'Hủy'
          },
          {
            label: 'Đồng ý',
            onClick: () => {
              this.close()
            }
          }
        ]
      });
    } else {
      this.close()
    }
  }
  close () {
    this.setState({isOpen: false, query: {}, Results: null, pages: 1, selectedPID: []})
  }
  removeConfirm(item) {
    confirmAlert({
      title: '',
      message: 'Bạn có chắc chắn xóa PID ' + item.PatientInformation.PID + ' khỏi gói?',
      buttons: [
        {
          label: 'Không'
        },
        {
          label: 'Có',
          onClick: () => {
            new PatientService().update('Package/DeleteChildren/', {
              PIDs: [item.PatientInformation.PID],
              PatientInPackageId: this.props.match.params.id
            }).then(() => {
              this.getData()
            })
          }
        }
      ]
    });
  }
  form () {
    const {isOpen, query, Results, pages, selectedPID} = this.state
    return (
      <CModal
        show={isOpen}
        size="xl"
        color="primary"
        closeOnBackdrop={false}
      >
      <CModalHeader className="text-center">
        <h3 className="text-center font-bold">
          Nhập thông tin con 
        </h3>
        <button className="close" aria-label="Close" onClick={() => this.closeConfirm()}>×</button>
      </CModalHeader>
      {isOpen && (
        <CModalBody className="min-h-70 xauti0">
          <CForm onSubmit={this.handleFilterSubmit.bind(this)}>
            <div className="d-flex flex-wrap">
              <div className="filter-item zindex-106">
                <CLabel>Họ và tên:</CLabel>
                  <div className="controls">
                    <InputText name="Name" value={query.Name} placeholder="Nhập Họ và tên con" size="16" type="text" onChange={this.handleChange} />
                  </div>
              </div>
              <div className="filter-item zindex-106">
                <CLabel>PID:</CLabel>
                  <div className="controls">
                    <InputText name="Pid" value={query.Pid} placeholder="Nhập PID con" size="16" type="text" onChange={this.handleChange} />
                  </div>
              </div>
              <div className="filter-item zindex-106">
                <CLabel>Ngày sinh:</CLabel>
                  <div className="controls">
                    <VDatePicker
                      placeholder=" / /"
                      name="Birthday"
                      value={query.Birthday}
                      onChange={this.handleChange}
                    />
                  </div>
              </div>
              <div className="filter-item">
                <label className="hidden-elm">Action:</label>
                <div className="controls">
                  <CButtonGroup>
                    <CButton color="secondary" type="submit"><VIcon size={'sm'} name='cilSearch' /> Tìm kiếm</CButton>
                  </CButtonGroup>
                </div>
              </div>
            </div>
          </CForm>
          {Results && <div className="click-table p-0">
              <DataTable
                className="m-0"
                results={Results}
                fields={[
                  { key: 'STT', _classes: 'font-weight-bold', _style: { width: '1%', textAlign: 'right' }, },
                  {
                    key: 'action',
                    label: 'Chọn',
                    sorter: false,
                    filter: false,
                    _style: { width: '1%', whiteSpace: 'nowrap', textAlign: 'center' },
                  },
                  {
                    key: 'FullName',
                    label: 'Họ và tên',
                  },
                  {
                    key: 'PID',
                    label: 'PID',
                    _style: { width: '1%', whiteSpace: 'nowrap' },
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
                    _style: { width: '1%', whiteSpace: 'nowrap', textAlign: 'right' },
                  },
                  {
                    key: 'Address',
                    label: 'Địa chỉ',
                    sorter: false,
                    filter: false
                  }
                ]}
                scopedSlots={{
                  'STT':
                    (item) => (
                      <td className="text-right">
                        {item.STT}
                      </td>
                    ),
                  'PID':
                    (item) => (
                      <td className="nowrap">
                        {item.PID}
                      </td>
                    ),
                  'Address':
                    (item) => (
                      <td>
                        {item.Address}
                      </td>
                    ),
                  'FullName':
                    (item) => (
                      <td className="nowrap">
                        {item.FullName}
                      </td>
                    ),
                  'DateOfBirth':
                    (item) => (
                      <td className="nowrap">
                        {item.DateOfBirth}
                      </td>
                    ),
                  'Mobile':
                    (item) => (
                      <td className="nowrap">
                        {item.Mobile}
                      </td>
                    ),
                  'Gender':
                    (item) => (
                      <td className="text-right">
                        {Gender[item.Gender]}
                      </td>
                    ),
                    'action':
                      (item) => (
                        <td className="nowrap text-center">
                          <CFormGroup variant="custom-checkbox">
                            <CInputCheckbox
                              custom
                              id={`inline-checkbox-${item.PID}`}
                              name={`inline-checkbox-${item.PID}`}
                              value={item.PID}
                              checked={item.selected}
                              onChange={this.selectedService}
                            />
                            <CLabel variant="custom-checkbox" htmlFor={`inline-checkbox-${item.PID}`}></CLabel>
                          </CFormGroup>
                        </td>
                      ),
                }}
                activePage={query.pageNumber}
                onActivePageChange={this.pageChange.bind(this)}
                pages={pages}
              />
            </div>}
        </CModalBody>)
      }
      <CModalFooter>
        <CButton
          color="secondary"
          onClick={() => this.closeConfirm()}
        >Hủy</CButton>
        <>
          {
            selectedPID && selectedPID.length
              ?
              <>
                <CButton
                  color="info"
                  onClick={() => this.commit(1)}
                >
                  Thêm ({selectedPID.length}) khách hàng đã chọn <VIcon size={'sm'} name='cilCheckAlt' />
                </CButton>
                {/* <CDropdown className="dropdown-sm">
                  <CDropdownToggle color="info" size="sm">
                    <i className="fa fa-fw fa-bars" aria-hidden="true"></i>
                  </CDropdownToggle>
                  <CDropdownMenu placement="bottom-end">
                    <CDropdownItem>
                      <CButton
                        color="info"
                        onClick={() => this.commit(0)}
                      >
                        Thêm ({selectedPID.length}) khách hàng đã chọn và thêm mới <VIcon size={'sm'} name='cilCheckAlt' />
                      </CButton>
                    </CDropdownItem>
                  </CDropdownMenu>
                </CDropdown> */}
                <CButton
                  color="warning"
                  onClick={() => this.clearSelectedService()}
                >
                  Bỏ chọn<VIcon size={'sm'} name='cilX' />
                </CButton>
              </>
              :
              ''
          }
        </>
      </CModalFooter>
    </CModal>
  )
  }
  render() {
  	const {Data} = this.state
    if (!this.props.data.IsIncludeChild) return (<></>)
    if (Data === null) return <Loading/>
  	return (<>
  		<CCard>
        <CCardHeader>
          <div className="d-flex align-items-center justify-content-between"><b className="fontSize16">Thông tin con</b> {hasPermissions(['ADMINPATIENTINPACKAGE_CREATEORUPDATECHILDRENINPACKAGEAPI']) && <CButton  onClick={() => this.setState({isOpen: true})} title="Thêm thông tin con" color="secondary" size="sm"><i className="fa fa-fw fa-plus" aria-hidden="true"></i></CButton>}</div>
        </CCardHeader>
        <CCardBody>
          {Data.length === 0 ? <div className="text-center">Không có dữ liệu</div> : <table className="table cd-table cd-table-bordered cd-table-bordered">
            <thead className="thead-dark text-center">
              <tr>
                <th className="text-right" width="1" scope="col">STT</th>
                <th className="text-left">PID</th>
                <th className="text-left">Họ và tên</th>
                <th className="text-left">Ngày sinh</th>
                {hasPermissions(['ADMINPATIENTINPACKAGE_DELETECHILDRENINPACKAGEAPI']) && <th className="text-left w1"></th>}
              </tr>
            </thead>
            <tbody>
              {Data.map((item, index) => {
                return (
                  <tr>
                    <td>{index + 1}</td>
                    <td>{item.PatientInformation.PID}</td>
                    <td>{item.PatientInformation.FullName}</td>
                    <td>{dateToString(item.PatientInformation.DateOfBirth)}</td>
                    {hasPermissions(['ADMINPATIENTINPACKAGE_DELETECHILDRENINPACKAGEAPI']) && <td><CButton color="secondary" onClick={() => this.removeConfirm(item)} type="button"><VIcon size={'sm'} name='cilTrash' /></CButton></td>}
                  </tr>
                )
              })}
            </tbody>
          </table>}
        </CCardBody>
        {this.form()}
      </CCard>
  	</>)
  }
}
export default Child