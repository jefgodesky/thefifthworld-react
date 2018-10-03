import React from 'react'
import { Route, Switch } from 'react-router-dom'
import routes from '../../shared/routes'

import Error404 from '../error-404/component'

class Router extends React.Component {
  componentDidCatch (err) {
    console.error(err)
  }

  render () {
    return (
      <Switch>
        {routes.map(({ path, exact, component }) => (
          <Route
            key={path}
            path={path}
            exact={exact}
            component={component} />
        ))}
        <Route component={Error404} />
      </Switch>
    )
  }
}

export default Router
