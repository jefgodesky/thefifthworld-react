import { combineReducers } from 'redux'

import Error from '../components/error/reducers'
import Invitations from '../components/invitations/reducers'
import MemberLogin from '../components/member-login/reducers'
import MemberProfile from '../components/member-profile/reducers'
import Messages from '../components/messages/reducers'
import OAuth2Connect from '../components/oauth-connect/reducers'
import Page from '../components/page/reducers'

const reducers = {
  Error,
  Invitations,
  MemberLogin,
  MemberProfile,
  Messages,
  OAuth2Connect,
  Page
}

export default combineReducers(reducers)
