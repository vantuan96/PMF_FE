import {
  CInput
} from '@coreui/react'

export const InputText = (props) => {
  return (
    <>
      <CInput autoComplete="off" {...props}/>
    </>
  )
}