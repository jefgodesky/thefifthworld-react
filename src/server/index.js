import '../../node_modules/regenerator-runtime/runtime'

import express from 'express'
import compression from 'compression'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import passport from 'passport'
import cors from 'cors'
import helmet from 'helmet'

import React from 'react'
import { renderToString } from 'react-dom/server'
import { matchPath, StaticRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'

import config from '../../config/index'
import auth from './auth'
import db from './db'
import reducers from '../shared/reducers'
import routes from '../shared/routes'
import ssr from './ssr'

import MemberRouter from './routes/member'
import Router from '../components/router/component'

// Initialize server
const server = express()
server.use(compression())
server.use(cookieParser())
server.use(bodyParser.urlencoded({ extended: true }))
server.use(bodyParser.json())
server.use(cors())
server.use(helmet())
server.use(express.static('public'))

// Set up session store
const session = require('express-session')
const MySQLStore = require('express-mysql-session')(session)
const sessionStore = new MySQLStore({
  host: config.db.host,
  port: config.db.port || 3306,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database
})

server.use(session({
  key: 'thefifthworld_session',
  secret: config.sessionSecret,
  store: sessionStore,
  resave: true,
  saveUninitialized: true
}))

// Set up Passport
server.use(passport.initialize())
server.use(passport.session())
auth(passport)

// Other-than-GET responses
server.use('/', MemberRouter)

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
