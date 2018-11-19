import { combineReducers } from 'redux'

import Invitations from '../components/invitations/reducers'
import MemberLogin from '../components/member-login/reducers'
import MemberProfile from '../components/member-profile/reducers'
import Messages from '../components/messages/reducers'
import Page from '../components/page/reducers'

const reducers = {
  Invitations,
  MemberLogin,
  MemberProfile,
  Messages,
  Page
}

export default combineReducers(reducers)
