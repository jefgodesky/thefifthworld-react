import { combineReducers } from 'redux'

import Dashboard from '../components/dashboard/reducers'
import MemberLogin from '../components/member-login/reducers'
import MemberProfile from '../components/member-profile/reducers'
import Messages from '../components/messages/reducers'
import Page from '../components/page/reducers'

const reducers = {
  Dashboard,
  MemberLogin,
  MemberProfile,
  Messages,
  Page
}

export default combineReducers(reducers)
