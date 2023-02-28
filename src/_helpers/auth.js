import { store } from "src/_helpers"

export function getCurrentUserData() {
  return store.getState().authentication.user
}