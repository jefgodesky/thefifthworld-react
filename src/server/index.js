import '../../node_modules/regenerator-runtime/runtime'

import express from 'express'
import compression from 'compression'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import passport from 'passport'
import cors from 'cors'
import helmet from 'helmet'
import fileUpload from 'express-fileupload'

import React from 'react'
import { renderToString } from 'react-dom/server'
import { matchPath, StaticRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'

import config from '../../config'
import auth from './auth'
import db from './db'
import parse from './parse'
import reducers from '../shared/reducers'
import routes from '../shared/routes'
import getMarkup from './ssr'
import { login } from '../components/member-login/actions'
import { load as loadPage } from '../components/page/actions'
import { load } from '../components/messages/actions'
import { throwError } from '../components/error/actions'
import { parseTag } from './parse/tags'

import Member from '../shared/models/member'
import Page from '../shared/models/page'
import MemberRouter from './routes/member'
import PageRouter from './routes/page'
import FormRouter from './routes/form'
import CommunityCreationRouter from './routes/community-creation'
import Router from '../components/router/component'

// Initialize server
const server = express()
server.use(compression())
server.use(cookieParser())
server.use(bodyParser.urlencoded({ extended: true }))
server.use(bodyParser.json())
server.use(cors())
server.use(helmet())
server.use(fileUpload())
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
server.use('/create-community', CommunityCreationRouter)
server.use('/', MemberRouter)
server.use('/', FormRouter)
server.use('/', PageRouter)

// Sends the response
const respond = (req, res, store) => {
  const markup = renderToString(
    <Provider store={store}>
      <StaticRouter location={req.url} context={{}}>
        <Router />
      </StaticRouter>
    </Provider>
  )

  const state = store.getState()
  const { description, image, type } = state.Page
  let title = state.Page.title

  // If this is a chapter in a novel, concatenate novel and chapter info to
  // generate the page title.
  const par = Page.getParent(state.Page)
  if (type === 'Chapter' && par.type === 'Novel') {
    const chapter = parseTag(state.Page.curr.body, 'Chapter', true)
    if (chapter) {
      title = `${par.title} - Chapter ${chapter} - ${title}`
    } else {
      title = `${par.title} - ${title}`
    }
  }

  const meta = {
    title,
    description,
    og: {
      image,
      url: `https://${req.get('host')}${req.originalUrl}`
    },
    twitter: {
      image
    }
  }

  res.send(getMarkup(markup, meta, store))
}

const redirector = (req, res, next) => {
  const restricted = [
    '/dashboard',
    '/connect',
    '/invite',
    '/create-community'
  ]

  const isRestricted = restricted.reduce((acc, curr) => {
    return acc || req.originalUrl.startsWith(curr)
  }, false)

  if (req.user && req.originalUrl === '/login') {
    res.redirect('/dashboard')
  } else if (!req.user && isRestricted) {
    res.redirect('/login')
  } else {
    next()
  }
}

// GET requests
server.get('*', redirector, async (req, res) => {
  const store = createStore(reducers, applyMiddleware(thunk))
  const route = routes.find(route => matchPath(req.url, route))
  if (req.user) {
    const loginObj = Object.assign({}, req.user)
    delete loginObj.password
    store.dispatch(login(loginObj))
    const messages = await Member.getMessages(req.user.id, req.url, db)
    if (messages) store.dispatch(load(messages))
  }

  if (req.session.error) {
    const page = req.session.error.content
    page.curr = { body: page.body }
    store.dispatch(loadPage(page))
    store.dispatch(throwError(req.session.error.errors))
    req.session.error = null
  }

  if (route) {
    if (route.load) await route.load(req, db, store)
    respond(req, res, store)
  } else {
    const commands = ['edit', 'history', 'compare']
    const query = req.originalUrl.split('?')
    let path = query[0]
    const parts = path.split('/')
    let command = null
    let version = null
    if (parts[parts.length - 2] === 'v') {
      version = parseInt(parts.pop())
      command = parts.pop()
      path = parts.join('/')
    } else if (parts.length > 2 && commands.indexOf(parts[parts.length - 1]) > -1) {
      command = parts.pop()
      path = parts.join('/')
    }

    const params = {}
    if (query[1]) {
      query[1].split('&').forEach(pair => {
        const param = pair.split('=')
        params[param[0]] = param[1]
      })
    }

    const page = await Page.get(path, db)
    if (page) {
      let curr = page.getContent()
      if (command === 'v' && version) {
        const match = page.changes.filter(v => v.id === version)
        if (match.length > 0) {
          if (match[0].id === page.changes[0].id) {
            command = null
            version = null
          } else {
            version = match[0]
            curr = version.content
          }
        }
      }

      if (!page.canRead(req.user)) res.status(401)

      page.curr = curr
      page.html = curr && curr.body ? await parse(curr.body, db, path) : ''
      page.lineage = await page.getLineage(db)
      page.command = command
      page.params = params
      if (command === 'v' && version) {
        page.version = version
      }
      store.dispatch(loadPage(page))
    } else {
      res.status(404)
    }
    respond(req, res, store)
  }
})

// Start listening
server.listen(config.port, () => {
  console.log(`Listening on port ${config.port}...`)
})
