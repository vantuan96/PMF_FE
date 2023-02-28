import { hasPermissions } from "src/_helpers"
export function Permissions({ className, action, mode, ...rest }) {
  const hasPermission = hasPermissions(action)
  if (!action || hasPermission) return <div className={`${className || ''} check-permissions`} {...rest} />;
  if (mode === 'show') {
    return <div className={`${className || ''} check-permissions no-permission`} {...rest} />;
  }
  return ''
}
