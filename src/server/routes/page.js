import express from 'express'
import Member from '../../shared/models/member'
import Page from '../../shared/models/page'
import File from '../../shared/models/file'
import db from '../db'
import { isPopulatedArray } from '../../shared/utils'

const PageRouter = express.Router()

/**
 * Returns an error object based on an SQL error message.
 * @param msg {string} - An SQL error message.
 * @returns {Object} - An error object describing the error.
 */

const getSQLError = (msg) => {
  const dupes = msg.match(/Duplicate entry \'(.+?)\' for key \'(.+?)\'/)
  const verbose = msg.match(/Data too long for column \'(.+?)\' at/)
  if (isPopulatedArray(dupes) && dupes.length > 2) {
    return {
      field: dupes[2],
      code: 'ER_DUP_ENTRY',
      value: dupes[1]
    }
  } else if (isPopulatedArray(verbose) && verbose.length > 1) {
    return {
      field: verbose[1],
      code: 'ER_DATA_TOO_LONG'
    }
  } else {
    return null
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
  const error = { content, errors: [] }

  if (err.sqlMessage) {
    error.errors = [ getSQLError(err.sqlMessage) ]
  }

  const pathMatch = str.match(/Error: (.*?) is a reserved path./)
  if (pathMatch) {
    error.errors = [
      ...error.errors,
      {
        field: 'path',
        code: 'ER_RESERVED_PATH',
        value: pathMatch[1]
      }
    ]
  }

  const tplMatch = str.match(/Error: {{(.*?)}} is used internally. You cannot create a template with that name./)
  if (tplMatch) {
    error.errors = [
      ...error.errors,
      {
        field: 'title',
        code: 'ER_RESERVED_TPL',
        value: tplMatch[1]
      }
    ]
  }

  if (error.errors.length > 0) {
    return error
  } else {
    return null
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

// GET /*?/like
PageRouter.get('/*?/like', async (req, res) => {
  const path = `/${req.params[0]}`
  const page = await Page.get(path, db)
  if (page && req.user) {
    await page.like(req.user.id, db)
    res.redirect(path)
  } else {
    res.redirect('/')
  }
})

// GET /*?/unlike
PageRouter.get('/*?/unlike', async (req, res) => {
  const path = `/${req.params[0]}`
  const page = await Page.get(path, db)
  if (page && req.user) {
    await page.unlike(req.user.id, db)
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
