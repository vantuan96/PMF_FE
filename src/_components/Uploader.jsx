import React, { Component } from 'react';
import Dropzone from 'react-dropzone';
import { VIcon, Loading } from 'src/_components'
import { uuidv4, isJson } from 'src/_helpers'
import { confirmAlert } from 'react-confirm-alert'
import { UploadService } from 'src/_services'
import {
  CButton
} from '@coreui/react'
import clsx from 'clsx'
const imageTypes = [
  'png', 'jpg', 'jpeg', 'gif'
]
const fileTypes = [
  'docx', 'xlsx', 'xls', 'doc', 'json', 'txt', 'csv', 'pdf', 'mp3', 'mp4', 'zip', 'html', 'rar'
]
export class Uploader extends Component {
  constructor(props) {
    super(props);
    this.onDrop = (files) => {
      var acceptedFiles = files.map(file => {
        // this.sendFile(file)
        return Object.assign(file, {
          preview: this.getPreviewWithFile(file),
          id: uuidv4(),
          msg: 'uploading'
        })
      })
      if (this.props.multiple) {
        this.setState({ files: [...this.state.files, ...acceptedFiles] })
      } else {
        this.setState({ files: [...acceptedFiles] })
      }
      this.sendFiles()
    };
    var files = []
    if (props.value) {
      if (typeof props.value === 'object') {
        files = props.value || []
      }
      else if (isJson(props.value)) {
        files = JSON.parse(props.value)
      }
      else {
        files = [props.value]
      }
    }
    this.state = {
      uploadFiles: [],
      files: files.map(e => {
        return {
          name: uuidv4(),
          preview: e,
          id: uuidv4(),
          msg: 'done',
          url: e
        }
      })
    };
    this.handleClick = this.handleClick.bind(this)
    this.removeAll = this.removeAll.bind(this)
  }
  sendFiles() {
    var files = this.state.files
    Promise.all(files.map(file => {
      return this.sendFile(file)
    })).then((fileUploaded) => {
      this.onChangeEvent()
    })
  }
  onReturnList(data) {
    if (this.props.onReturnList) this.props.onReturnList(data)
  }
  sendFile(file) {
    return new UploadService().upload(file).then((fileUploaded) => {
      file.url = fileUploaded

      this.fileStatus(file, 'done')
      if (fileUploaded.returnList) this.onReturnList(fileUploaded.returnList)
    })
      .catch((e) => {
        this.fileStatus(file, 'error')
      })
  }
  fileStatus(file, status) {
    var files = this.state.files
    files.map(e => {
      if (file.id === e.id) {
        e.msg = status
        e.url = file.url
      }
      return e
    })
    this.setState({ files })
  }
  getExtFile(fileName) {
    var arr = fileName.split('.')
    return arr[arr.length - 1].toLowerCase()
  }
  getPreviewWithFile(file) {
    var fileType = this.getExtFile(file.name)
    if (imageTypes.includes(fileType)) return URL.createObjectURL(file)
    if (fileTypes.includes(fileType)) return `images/files/${fileType}.png`
    return `images/files/file.png`
  }
  onChangeEvent() {
    if (this.props.applyCallback) this.props.applyCallback(this.state.files.map(e => {
      return e.url
    }), this.props.name)
  }
  handleClick(file) {
    if (this.props.mediaLibraryMode) return
    confirmAlert({
      customUI: () => <div className="react-image-viewer-body"><img src={file.preview} alt="img" /></div>,
      closeOnEscape: true,
      closeOnClickOutside: true
    });
  }
  removeAll() {
    confirmAlert({
      title: 'Confirm to Remove All',
      message: 'Are you sure to do this.',
      buttons: [
        {
          label: 'Yes',
          onClick: () => this.removeFile()
        },
        {
          label: 'No'
        }
      ]
    })
  }
  removeClick(file) {
    confirmAlert({
      title: 'Confirm to Remove',
      message: 'Are you sure to do this.',
      buttons: [
        {
          label: 'Yes',
          onClick: () => this.removeFile(file)
        },
        {
          label: 'No'
        }
      ]
    });
  }
  removeFile(file) {
    if (file) {
      var files = this.state.files.filter(e => e.id !== file.id)
      this.setState({ files })
    } else {
      this.setState({ files: [] })
    }
    setTimeout(() => {
      this.onChangeEvent()
    }, 100);
  }
  render() {
    const {
      files
    } = this.state
    return (
      <>
        <section className={clsx({
          vdropzone: true
        })}>
          <Dropzone onDrop={this.onDrop}>
            {({ getRootProps, getInputProps }) => (
              <div {...getRootProps({
                className: 'vdropzonex'
              })}>
                <input {...getInputProps({ accept: (this.props.accept || '*'), multiple: this.props.multiple })} />
                <div className="vdropzone-placeholder">
                  <p style={{position:'absolute',bottom: 0}}>Kéo thả hoặc chọn file để upload</p>
                  <div><VIcon size={'xl'} name='cilCloudUpload' /></div>
                </div>
              </div>
            )}
          </Dropzone>
        </section>
        {!this.props.mediaLibraryMode && <div>
          {(files && files.length > 1) ? <p className="pointer" onClick={() => this.removeAll()}> Clear all</p> : ''}
        </div>}
      </>
    )
  }
}
