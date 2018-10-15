import express from 'express'

const passport = require('passport')
const MemberRouter = express.Router()

MemberRouter.post('/login', (passport.authenticate('local', {
  successRedirect: '/login-route',
  failureRedirect: '/login'
})))

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

export default MemberRouter
