import React, { useState } from 'react'
import {
  CInput,
  CInputGroup,
  CInputGroupAppend,
  CInputGroupText
} from '@coreui/react'
import { VIcon } from 'src/_components'
export const InputPassword = (props) => {
  const [inputType, setInputType] = useState(null);
  const showPass = (e) => {
    setInputType(inputType === 'text' ? 'password' : 'text')
  }
  let attrx = {...props, ...{type: inputType || 'password'}}
  return (
    <>
      <CInputGroup>
        <CInput {...attrx}/>
        <CInputGroupAppend>
          <CInputGroupText onClick={() => showPass()} className="pointer">
            <VIcon name="cilLink" />
          </CInputGroupText>
        </CInputGroupAppend>
      </CInputGroup>
    </>
  )
}