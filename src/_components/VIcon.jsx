
import CIcon from '@coreui/icons-react'
import { freeSet } from '@coreui/icons'
console.log(freeSet)
export const VIcon = (props) => (
  <><CIcon {...props}  content={freeSet[props.name]} /></>
)