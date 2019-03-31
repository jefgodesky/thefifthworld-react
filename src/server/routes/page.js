import express from 'express'
import Member from '../../shared/models/member'
import Page from '../../shared/models/page'
import File from '../../shared/models/file'
import db from '../db'

const PageRouter = express.Router()

/**
 * Returns an error object based on an SQL error message.
 * @param msg {string} - An SQL error message.
 * @param content {Object} - An object with the form content that was submitted
 *   when the SQL error was encountered.
 * @returns {Object} - An error object describing the error.
 */

const getSQLError = (msg, content) => {
  const match = msg.match(/Duplicate entry \'(.+?)\' for key \'(.+?)\'/)
  if (match.length > 2) {
    return {
      field: match[2],
      code: 'ER_DUP_ENTRY',
      value: match[1],
      content
    }
  } else {
    return { content }
  }
}

/**
 * Returns an error object.
 * @param err {Error} - The error object to parse.
 * @param content {Object} - An object with the submitted content.
 * @returns {Object} - An object defining the error.
 */

const getError = (err, content) => {
  const str = err.toString()
  const pathMatch = str.match(/Error: (.*?) is a reserved path./)
  const tplMatch = str.match(/Error: {{(.*?)}} is used internally. You cannot create a template with that name./)

  if (err.sqlMessage) {
    return getSQLError(err.sqlMessage, content)
  } else if (pathMatch) {
    return {
      field: 'path',
      code: 'ER_RESERVED_PATH',
      value: pathMatch[1],
      content
    }
  } else if (tplMatch) {
    return {
      field: 'title',
      code: 'ER_RESERVED_TPL',
      value: tplMatch[1],
      content
    }
  } else {
    console.error(err)
    return {}
  }
}

// POST /new
PageRouter.post('/new', async (req, res) => {
  if (req.user) {
    try {
      const file = req.files && req.files.file ? req.files.file : null
      const thumbnail = req.files && req.files.thumbnail ? req.files.thumbnail : null
      const page = await Page.create(req.body, req.user, 'Initial text', db)
      if (file) await File.upload(file, thumbnail, page, req.user, db)
      res.redirect(page.path)
    } catch (err) {
      req.session.error = getError(err, req.body)
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

    try {
      const file = req.files && req.files.file ? req.files.file : null
      const thumbnail = req.files && req.files.thumbnail ? req.files.thumbnail : null
      await page.update(req.body, editor, msg, db)
      if (file) await File.update(file, thumbnail, page, req.user, db)
      res.redirect(page.path)
    } catch (err) {
      req.session.error = getError(err, req.body)
      res.redirect(`${query[0]}/edit`)
    }
  }
})

export default PageRouter
