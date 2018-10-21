import express from 'express'
import Member from '../models/member'
import db from '../db'

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
      await member.update(req.body, db)
      res.redirect(`/member/${req.body.id}`)
    } else {
      res.redirect(`/member/${req.body.id}`)
    }
  } else {
    res.redirect('/member')
  }
})

// GET /logout
MemberRouter.get('/logout', (req, res) => {
  req.logout()
  res.redirect('/login')
})

// GET /login-route
MemberRouter.get('/login-route', (req, res) => {
  let url = '/dashboard'
  // If this is the user's first time logging in, go to the welcome page
  res.redirect(url)
})

export default MemberRouter
