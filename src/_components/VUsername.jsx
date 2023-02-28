import ReactTooltip from "react-tooltip"
import { AccountService } from 'src/_services'
import React, { useState } from 'react'
import { VIcon } from 'src/_components'
const Loading = () => {
  return (
    <div className="spinner-border-sm spinner-border" role="status">
      <span className="sr-only">Loading...</span>
    </div>
  )
}
export const VUsername = ({ children }) => {
  var id = new Date().getTime() + '_x'
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState(null);
  const getUser = () => {
    if (user) return
    setIsLoading(true)
    new AccountService({ Username: children }).noLoading().noError().find('user/info')
      .then(response => {
        setIsLoading(false)
        setUser(response);
      }).catch(() => {
        setIsLoading(false)
      })
  }
  return (
    <>
      <label className="label-h" data-tip data-for={id} onMouseEnter={() => getUser(true)}>
        {children} {isLoading && <Loading />} <VIcon size={'sm'} name={'cilInfo'} />
      </label>
      <ReactTooltip id={id} type="info">
        <div className="v-tootip">
          <div className="v-tootip-header">Thông tin người dùng</div>
          <div className="v-tootip-body">
            <div><label>Username:</label> {children}</div>
            <div><label>Họ và tên:</label> {user ? user.Fullname : 'NA'}</div>
            <div><label>SĐT:</label> {user ? user.Mobile : 'NA'}</div>
            <div><label>Chức danh:</label> {user ? user.Title : 'NA'}</div>
            <div><strong>Phòng ban:</strong> {user ? user.Department : 'NA'}</div>
          </div>
        </div>
      </ReactTooltip>
    </>
  )
}
