import React from 'react'
import { CFooter } from '@coreui/react'
import VLink from 'src/_components/VLink'
const TheFooter = () => {
  return (
    <CFooter fixed={false}>
      <div>
        <a href="https://vinmec.com" target="_blank" rel="noopener noreferrer">Vinmec</a>
        <span className="ml-1">&copy; 2021.</span>
      </div>
      <div className="mfs-auto">
        <span className="mr-1">Powered by</span>
        <VLink><a href="https://vinmec.com" target="_blank" title="TTT" rel="noopener noreferrer">Development Team</a></VLink>
      </div>
    </CFooter>
  )
}

export default React.memo(TheFooter)
