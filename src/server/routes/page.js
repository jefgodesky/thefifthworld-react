import express from 'express'
import Page from '../../shared/models/page'
import db from '../db'
import es from '../../shared/es'

const PageRouter = express.Router()

// POST /new-wiki
PageRouter.post('/new-wiki', async (req, res) => {
  if (req.user) {
    const page = await Page.create(req.body, req.user, 'Initial text', db, es)
    res.redirect(page.path)
  } else {
    res.redirect('/login')
  }
})

export default PageRouter
