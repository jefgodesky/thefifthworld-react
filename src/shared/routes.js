/* global __isClient__ */

import Create from '../components/create/component'
import Dashboard from '../components/dashboard/component'
import Explore from '../components/explore/component'
import ForgotPassphrase from '../components/forgot-passphrase/component'
import Home from '../components/home/component'
import Invitations from '../components/invitations/component'
import Join from '../components/join/component'
import MemberLogin from '../components/member-login/component'
import MemberProfile from '../components/member-profile/component'
import OAuth2Connect from '../components/oauth-connect/component'
import Upload from '../components/upload/component'

const routes = [
  {
    path: '/',
    exact: true,
    component: Home
  },
  {
    path: '/login',
    exact: true,
    component: MemberLogin
  },
  {
    path: '/dashboard',
    exact: true,
    component: Dashboard
  },
  {
    path: '/invite',
    exact: true,
    component: Invitations
  },
  {
    path: '/connect',
    exact: true,
    component: OAuth2Connect
  },
  {
    path: '/join',
    exact: true,
    component: Join
  },
  {
    path: '/forgot-passphrase',
    exact: true,
    component: ForgotPassphrase
  },
  {
    path: '/member/:id',
    exact: true,
    component: MemberProfile
  },
  {
    path: '/member/:id/edit',
    exact: true,
    component: MemberProfile
  },
  {
    path: '/welcome',
    exact: true,
    component: MemberLogin
  },
  {
    path: '/welcome/:id',
    exact: true,
    component: MemberProfile
  },
  {
    path: '/new',
    exact: true,
    component: Create
  },
  {
    path: '/upload',
    exact: true,
    component: Upload
  },
  {
    path: '/explore',
    exact: true,
    component: Explore
  }
]

/*
 * On the server, add a `load` property to each route that uses a component
 * that has a static `load` function. This lets us auto-load these methods so
 * that they can be executed just because they exist, without having to add
 * them explicitly to each route individually.
 */

if (!__isClient__) {
  routes.forEach(route => {
    if (route.component && route.component.load && (typeof route.component.load === 'function')) {
      route.load = route.component.load
    }
  })
}

export default routes
