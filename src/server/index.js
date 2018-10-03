import express from 'express'
import cors from 'cors'

import React from 'react'
import { renderToString } from 'react-dom/server'
import { matchPath, StaticRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'

import db from './db'
import reducers from '../shared/reducers'
import routes from '../shared/routes'
import ssr from './ssr'

import Router from '../components/router/component'

// Initialize server
const server = express()
server.use(cors())
server.use(express.static('public'))

// Sends the response
const respond = (req, res, store) => {
  const markup = renderToString(
    <Provider store={store}>
      <StaticRouter location={req.url} context={{}}>
        <Router />
      </StaticRouter>
    </Provider>
  )
  res.send(ssr(markup, {}, store))
}

// GET requests
server.get('*', (req, res) => {
  const store = createStore(reducers, applyMiddleware(thunk))
  const route = routes.find(route => matchPath(req.url, route))
  if (route && route.load) {
    route.load(route, req.url, db, store.dispatch)
      .then(() => {
        respond(req, res, store)
      })
      .catch(err => {
        console.error(err)
      })
  } else {
    respond(req, res, store)
  }
})

// Start listening
server.listen(3000, () => {
  console.log('Listening on port 3000...')
})
