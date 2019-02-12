import express from 'express'
import Member from '../../shared/models/member'
import Page from '../../shared/models/page'
import db from '../db'

const PageRouter = express.Router()

// POST /new-wiki
PageRouter.post('/new', async (req, res) => {
  if (req.user) {
    try {
      const page = await Page.create(req.body, req.user, 'Initial text', db)
      res.redirect(page.path)
    } catch (err) {
      const extract = err.sqlMessage ? err.sqlMessage.match(/Duplicate entry '(.*)' for key '(.*)'/) : []
      const key = extract.length === 3 ? extract[2] : null
      const val = extract.length === 3 ? extract[1] : null
      req.session.error = Object.assign({}, err, { content: req.body, key, val })
      res.redirect('/new')
    }
  } else {
    res.redirect('/login')
  }
})

// POST /autocomplete/title
PageRouter.post('/autocomplete/title', async (req, res) => {
  const results = await Page.autocomplete(req.body.str, db)
  res.json(results)
})

// GET /*?/rollback/:id
PageRouter.get('/*?/rollback/:id', async (req, res) => {
  const path = `/${req.params[0]}`
  const page = await Page.get(path, db)
  if (page && req.user) {
    await page.rollbackTo(parseInt(req.params.id), req.user, db)
    res.redirect(path)
  } else {
    res.redirect('/')
  }
})

// POST *
PageRouter.post('*', async (req, res) => {
  const query = req.originalUrl.split('?')
  const page = await Page.get(query[0], db)
  const editor = req.user ? await Member.get(req.user.id, db) : null

  if (page && editor) {
    let msg = req.body.message
    delete req.body.message

    const lock = req.body.lock !== undefined
    const unlock = req.body.unlock !== undefined
    const hide = req.body.hide !== undefined
    const unhide = req.body.unhide !== undefined

    if (unlock) {
      req.body.permissions = 774
      if (msg === '') msg = 'Unlocking page'
    }

    if (lock || unhide) {
      req.body.permissions = 744
      if (msg === '') msg = lock ? 'Locking page' : 'Unhiding page'
    }

    if (hide) {
      req.body.permissions = 400
      if (msg === '') msg = 'Hiding page'
    }

    await page.update(req.body, editor, msg, db)
  }

  res.redirect(page.path)
})

export default PageRouter
