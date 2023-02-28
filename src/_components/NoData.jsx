import React from 'react'
export const NoData = ({ children })  => {
  return (
    <>
      {children || <div className="no-data">Không có dữ liệu</div>}
    </>
  )
}
