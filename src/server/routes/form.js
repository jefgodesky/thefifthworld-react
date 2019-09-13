import express from 'express'
import { escape as SQLEscape } from 'sqlstring'
import db from '../db'

const FormRouter = express.Router()

// POST /save-form
FormRouter.post('/save-form', async (req, res) => {
  const { form } = req.body
  delete req.body.form
  try {
    await db.run(`INSERT INTO responses (form, data) VALUES (${SQLEscape(form)}, ${SQLEscape(JSON.stringify(req.body))});`)
    res.redirect(`${req.headers.referer}?msg=save-form-received`)
  } catch (err) {
    res.redirect(`${req.headers.referer}?msg=save-form-failed`)
  }
})

export default FormRouter
