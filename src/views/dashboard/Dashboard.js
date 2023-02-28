import React from 'react'
import {
} from '@coreui/react'
import {
  getDefaultPage,
  history
} from 'src/_helpers'
// import CIcon from '@coreui/icons-react'

// import {
//   Permissions
// } from 'src/_components'
const Dashboard = () => {
  const defaultPage = getDefaultPage()
  history.push(defaultPage)
  return (
    <>
      <h1>PMS Project V0.0.1</h1>
    </>
  )
}

export default Dashboard
