import React from 'react';
import {
  CCol,
  CFormGroup,
  CButton,
  CInputGroup,
  CInputGroupAppend,
  CBadge
} from '@coreui/react'
import { VIcon } from 'src/_components'
import BaseComponent from 'src/_components/BaseComponent'
import Select from 'react-select'
import { ServiceCategoriesService, ServiceService } from 'src/_services'

class EditCategory extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {
      ServiceData: props.data,
      allowEdit: false,
      categories: [],
      category: {
      }
    }
    this.handleSelectInputChange = this.handleSelectInputChange.bind(this)
  }
  enableEdit() {
    let allowEdit = this.state.allowEdit
    this.setState({ allowEdit: !allowEdit });
  }
  save() {
    new ServiceService().update(this.state.ServiceData.Id, { ...this.state.ServiceData, Category: this.state.category })
      .then(() => {
        this.enableEdit();
        let serviceData = this.state.ServiceData
        serviceData.Category = this.state.category
        this.setState({ ServiceData: serviceData });
      }).catch(e => {
      })
  }
  getCategories() {
    new ServiceCategoriesService({ query: '' }).getAllFromStorage('_ServiceCategories')
      .then(response => {
        this.setState({
          categories: response.map(e => {
            e.value = e.Id
            e.label = e.ViName || 'N/A'
            return e
          }).filter(e => e.IsConfig)
        })
        let category = response.find(e => (this.state.ServiceData.Category.Id === e.iD)) || {}
        this.setState({ category })
      })
  }
  componentDidMount() {
    console.log('componentDidMount')
    this.getCategories()
  }
  handleSelectInputChange(category) {
    console.log(category)
    this.setState({ category })
  }
  render() {
    const {
      allowEdit,
      ServiceData,
      categories
    } = this.state
    return (
      <>
        {allowEdit ?
          <CFormGroup row>
            <CCol md="12">
              <CInputGroup>
                <div className="input-group-control">
                  <Select
                    options={categories}
                    // value={category}
                    name="HISCode"
                    onChange={this.handleSelectInputChange}
                    defaultValue={categories.filter(e => (ServiceData.Category.Id === e.value))}
                  />
                </div>
                <CInputGroupAppend>
                  <CButton type="button" color="primary" onClick={this.save.bind(this)}>Lưu</CButton>
                </CInputGroupAppend>
              </CInputGroup>
            </CCol>
          </CFormGroup>
          :
          <div className="edit-inline" onClick={this.enableEdit.bind(this)}>
            {ServiceData.Category.ViName ? `${ServiceData.Category.ViName}` : <CBadge color="warning">Chưa phân loại dịch vụ </CBadge>}<VIcon size={'sm'} name='cilLink' />
          </div>
        }
      </>
    )
  }
}
export default EditCategory