import React, { useState } from 'react'
import {
  CToast,
  CToastBody,
  CToastHeader
} from '@coreui/react'
const Notification = () => {
  setToasts([
    ...toasts, 
    { position, autohide: autohide && autohideValue, closeButton, fade }
  ])
  const [toasts, setToasts] = useState([
    { position: 'static'},
    { position: 'static'},
    { position: 'top-right', autohide: 5000 }
  ])

  const toasters = (()=>{
    return toasts.reduce((toasters, toast) => {
      toasters[toast.position] = toasters[toast.position] || []
      toasters[toast.position].push(toast)
      return toasters
    }, {})
  })()


  return (
    <template sm="12" lg="6">
      {Object.keys(toasters).map((toasterKey) => (
        <CToaster
          position={toasterKey}
          key={'toaster' + toasterKey}
        >
          {
            toasters[toasterKey].map((toast, key)=>{
            return(
              <CToast
                key={'toast' + key}
                show={true}
                autohide={toast.autohide}
                fade={toast.fade}
              >
                <CToastHeader closeButton={toast.closeButton}>
                  Toast title
                </CToastHeader>
                <CToastBody>
                  {`This is a toast in ${toasterKey} positioned toaster number ${key + 1}.`}
                </CToastBody>
              </CToast>
            )
          })
          }
        </CToaster>
      ))}
    </template>
  )
}

export default Notification
