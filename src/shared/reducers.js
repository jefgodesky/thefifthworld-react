import { combineReducers } from 'redux'

import Dashboard from '../components/dashboard/reducers'
import Error from '../components/error/reducers'
import Explore from '../components/explore/reducers'
import Invitations from '../components/invitations/reducers'
import MemberLogin from '../components/member-login/reducers'
import MemberProfile from '../components/member-profile/reducers'
import Messages from '../components/messages/reducers'
import OAuth2Connect from '../components/oauth-connect/reducers'
import Page from '../components/page/reducers'

const reducers = {
  Dashboard,
  Error,
  Explore,
  Invitations,
  MemberLogin,
  MemberProfile,
  Messages,
  OAuth2Connect,
  Page
}

export default combineReducers(reducers)
