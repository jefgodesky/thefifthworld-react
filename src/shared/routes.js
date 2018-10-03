/* global __isClient__ */

import Home from '../components/home/component'
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
    path: '/member/:id',
    exact: true,
    component: MemberProfile
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
