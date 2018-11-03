import express from 'express'
import { escape as SQLEscape } from 'sqlstring'
import Member from '../../shared/models/member'
import db from '../db'
import sendEmail from '../email'

const passport = require('passport')
const MemberRouter = express.Router()

// POST /login
MemberRouter.post('/login', (passport.authenticate('local', {
  successRedirect: '/login-route',
  failureRedirect: '/login'
})))

// GET /login/patreon
// GET /connect/patreon
MemberRouter.get(
  ['/login/patreon', '/connect/patreon'],
  passport.authenticate('patreon'))

// GET /login/patreon/callback
// GET /connect/patreon/callback
MemberRouter.get(
  ['/login/patreon/callback', '/connect/patreon/callback'],
  passport.authenticate('patreon', {
    successRedirect: '/login-route',
    failureRedirect: '/login'
  }))

// GET /login/discord
// GET /connect/discord
MemberRouter.get(
  ['/login/discord', '/connect/discord'],
  passport.authenticate('discord', { scope: [ 'identify' ] }))

// GET /login/discord/callback
// GET /connect/discord/callback
MemberRouter.get(
  ['/login/discord/callback', '/connect/discord/callback'],
  passport.authenticate('discord', {
    successRedirect: '/login-route',
    failureRedirect: '/login'
  }))

// GET /login/google
// GET /connect/google
MemberRouter.get(
  ['/login/google', '/connect/google'],
  passport.authenticate('google', { scope: [ 'email', 'profile' ] }))

// GET /login/google/callback
// GET /connect/google/callback
MemberRouter.get(
  ['/login/google/callback', '/connect/google/callback'],
  passport.authenticate('google', {
    successRedirect: '/login-route',
    failureRedirect: '/login'
  }))

// GET /login/facebook
// GET /connect/facebook
MemberRouter.get(
  ['/login/facebook', '/connect/facebook'],
  passport.authenticate('facebook', { scope: [ 'email' ] }))

// GET /login/facebook/callback
// GET /connect/facebook/callback
MemberRouter.get(
  ['/login/facebook/callback', '/connect/facebook/callback'],
  passport.authenticate('facebook', {
    successRedirect: '/login-route',
    failureRedirect: '/login'
  }))

// GET /login/twitter
// GET /connect/twitter
MemberRouter.get(
  ['/login/twitter', '/connect/twitter'],
  passport.authenticate('twitter'))

// GET /login/twitter/callback
// GET /connect/twitter/callback
MemberRouter.get(
  ['/login/twitter/callback', '/connect/twitter/callback'],
  passport.authenticate('twitter', {
    successRedirect: '/login-route',
    failureRedirect: '/login'
  }))

// POST /member
MemberRouter.post('/member', async (req, res) => {
  if (req.body.id) {
    const member = await Member.get(req.body.id, db)
    if (member) {
      await member.update(req.body, req.user, db)
      res.redirect(`/member/${req.body.id}`)
    } else {
      res.redirect(`/member/${req.body.id}`)
    }
  } else {
    res.redirect('/member')
  }
})

// POST /welcome
MemberRouter.post('/welcome', async (req, res) => {
  if (req.body.id) {
    const member = await Member.get(req.body.id, db)
    if (member) {
      await member.update(req.body, req.user, db)
      res.redirect('/dashboard')
    } else {
      res.redirect(`/welcome/${req.body.id}`)
    }
  } else {
    res.redirect('/dashboard')
  }
})

// GET /logout
MemberRouter.get('/logout', (req, res) => {
  req.logout()
  res.redirect('/login')
})

// GET /login-route
MemberRouter.get('/login-route', async (req, res) => {
  if (req.user) {
    const member = await Member.get(req.user.id, db)
    const reset = await db.run(`SELECT reset FROM members WHERE id=${member.id};`)
    if (member.password === '') {
      res.redirect(`/welcome/${member.id}`)
    } else if (reset.length > 0 && reset[0].reset === 1) {
      await member.logMessage('warning', 'Please update your passphrase below.', db)
      res.redirect(`/member/${member.id}/edit`)
    } else {
      res.redirect('/dashboard')
    }
  } else {
    res.redirect('/login')
  }
})

// POST /invite
MemberRouter.post('/invite', async (req, res) => {
  if (req.user) {
    const emails = req.body.invitations.split('\n').map(addr => addr.trim()).filter(addr => addr.length > 0)
    await Member.sendInvitations(req.user.id, emails, sendEmail, db)
    res.redirect('/dashboard')
  } else {
    res.redirect('/login')
  }
})

// POST /join
MemberRouter.post('/join', (req, res) => {
  if (req.body.code) {
    res.redirect(`/join/${req.body.code}`)
  } else {
    res.redirect('/join')
  }
})

// GET /join/:code
MemberRouter.get('/join/:code', async (req, res, next) => {
  const member = await Member.acceptInvitation(SQLEscape(req.params.code), db)
  if (member) {
    req.login(member, err => {
      if (err) return next({ error: err, status: 500 })
      res.redirect(`/welcome/${member.getId()}`)
    })
  } else {
    res.redirect('/join')
  }
})

export default MemberRouter
