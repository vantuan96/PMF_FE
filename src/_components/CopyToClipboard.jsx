const CopyToClipboard = ({children}) => {
  const onCopyToClipboard = (e) => {
    const el = document.createElement('textarea')
    el.value = this.PID
    el.setAttribute('readonly', '')
    el.style.position = 'absolute'
    el.style.left = '-9999px'
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
  }
  return (
    <>
      <span onDoubleClick={() => onCopyToClipboard()}>{children}</span>
    </>
  )
}

export default CopyToClipboard
