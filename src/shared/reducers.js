import { combineReducers } from 'redux'

import MemberLogin from '../components/member-login/reducers'
import MemberProfile from '../components/member-profile/reducers'

const reducers = {
  MemberLogin,
  MemberProfile
}

export default combineReducers(reducers)
