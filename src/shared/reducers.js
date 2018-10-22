import { combineReducers } from 'redux'

import Dashboard from '../components/dashboard/reducers'
import MemberLogin from '../components/member-login/reducers'
import MemberProfile from '../components/member-profile/reducers'
import Messages from '../components/messages/reducers'

const reducers = {
  Dashboard,
  MemberLogin,
  MemberProfile,
  Messages
}

export default combineReducers(reducers)
