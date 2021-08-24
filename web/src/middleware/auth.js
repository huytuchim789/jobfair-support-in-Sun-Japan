import _first from 'lodash/first'
import { redirect } from '~/modules/http'

const handle = ({ store, res, args = [], isLast }) => {
  const user = store.getState().get('auth').get('user')
  const userRole = user ? user.get('role') : null
  const isGuest = user === null || user.size === 0

  const role = _first(args) || 'member'
  const hasRole = userRole === role

  if (isGuest || (!hasRole && isLast)) {
    redirect('/login', { res })
  }

  return { continue: true }
}

export default handle
