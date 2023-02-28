import React from "react"
import BaseComponent from 'src/_components/BaseComponent'
import {
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader,
  CCol,
  CRow
} from '@coreui/react'
import { Uploader, DataTable } from 'src/_components'
import { VIcon } from 'src/_components'
class UploadForm extends BaseComponent {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this)
    this.state = {
      Id: props.match.params.id,
      Data: [],
      Loaded: true
    }
    this.sussessData = this.sussessData.bind(this)
  }
  componentDidMount() {
  }
  sussessData (Data) {
    this.setState({ Loaded: false })
    this.setState({ Data })
    setTimeout(() => {
      this.setState({ Loaded: true })
    }, 100)
  }
  render() {
    const {
      Data
    } = this.state
    const {
      Loaded
    } = this.state
    var datas = (Data || []).filter(e => !e.IsDeleted).map((e, index) => {
      e.STT = index + 1
      return e
    })
    var fields = [
      { key: 'STT', _classes: 'font-weight-bold', _style: { width: '1%' }, },
      {
        key: 'PackageCode',
        label: 'Mã gói',
      },
      {
        key: 'Title',
        label: 'Mã - Tên dịch vụ',
      },
      {
        key: 'ServiceCodeReplace',
        label: 'Mã dịch vụ thay thế',
      },
      {
        key: 'Status',
        label: 'Trạng thái',
      }
    ]
    return (
      <>
        <div>
          <CRow className="justify-content-center">
            <CCol lg={10}>
              <CCard>
                <CCardHeader>
                  Cập nhật dịch vụ thay thế
                </CCardHeader>
                <CCardBody>
                  {Loaded &&
                  <Uploader onReturnList={this.sussessData}/>
                }
                  {datas != null && datas.length > 0 && <div>
                  <hr/>
                  <DataTable
                    results={datas}
                    fields={fields}
                    scopedSlots={{
                      'Title':
                        (item) => (
                          <td>
                            {item.ServiceCode + ' - ' + item.ServiceName}
                          </td>
                        ),
                      'Status':
                        (item) => (
                          <td>
                            {(item.StatusName && item.StatusName.ViMessage) ? item.StatusName.ViMessage : ''}
                          </td>
                        ),
                    }}
                    activePage={1}
                    onActivePageChange={this.pageChange.bind(this)}
                    pages={0}
                  />
                  </div>}
                </CCardBody>
                <CCardFooter>
                  <a className="btn btn-sm btn-info" href="/02062022_VMEC_PMS_template-UpdateServiceReplace.xlsx">Template file <VIcon size={'xl'} name='cilCloudDownload' /></a>
                </CCardFooter>
              </CCard>
            </CCol>
          </CRow>
        </div>
      </>
    );
  }
}
export default UploadForm
