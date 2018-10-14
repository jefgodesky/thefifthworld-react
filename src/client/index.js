import '../../node_modules/regenerator-runtime/runtime'

import React from 'react'
import { hydrate } from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import reducers from '../shared/reducers'

import Router from '../components/router/component'

if (window.__INITIAL_STATE__) {
  const init = window.__INITIAL_STATE__
  delete window.__INITIAL_STATE__
  const devTools = window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
  const store = (devTools !== undefined)
    ? createStore(reducers, init, compose(applyMiddleware(thunk), devTools))
    : createStore(reducers, init, applyMiddleware(thunk))

  hydrate(
    <Provider store={store}>
      <BrowserRouter>
        <Router />
      </BrowserRouter>
    </Provider>,
    document.querySelector('body > main')
  )
}
