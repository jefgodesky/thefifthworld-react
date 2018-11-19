/* global __isClient__ */

import CreateWiki from '../components/wiki/create'
import Dashboard from '../components/dashboard/component'
import ForgotPassphrase from '../components/forgot-passphrase/component'
import Home from '../components/home/component'
import Invitations from '../components/invitations/component'
import Join from '../components/join/component'
import MemberLogin from '../components/member-login/component'
import MemberProfile from '../components/member-profile/component'

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
    path: '/new-wiki',
    exact: true,
    component: CreateWiki
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
