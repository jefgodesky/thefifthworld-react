import express from 'express'
import Member from '../../shared/models/member'
import Page from '../../shared/models/page'
import db from '../db'

const PageRouter = express.Router()

// POST /new-wiki
PageRouter.post('/new-wiki', async (req, res) => {
  if (req.user) {
    const page = await Page.create(req.body, req.user, 'Initial text', db)
    res.redirect(page.path)
  } else {
    res.redirect('/login')
  }
})

// POST /autocomplete/title
PageRouter.post('/autocomplete/title', async (req, res) => {
  const results = await Page.autocomplete(req.body.str, db)
  res.json(results)
})

// POST *
PageRouter.post('*', async (req, res) => {
  const query = req.originalUrl.split('?')
  const path = query[0]
  const page = await Page.get(path, db)
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

  res.redirect(path)
})

export default PageRouter
