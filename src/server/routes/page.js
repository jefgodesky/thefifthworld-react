import express from 'express'
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

export default PageRouter
