import React from 'react'
import { Route, Switch } from 'react-router-dom'
import routes from '../../shared/routes'

import Page from '../page/component'

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
        <Route component={Page} />
      </Switch>
    )
  }
}

export default Router
