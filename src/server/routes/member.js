import express from 'express'

const passport = require('passport')
const MemberRouter = express.Router()

MemberRouter.post('/login', (passport.authenticate('local', {
  successRedirect: '/login-route',
  failureRedirect: '/login'
})))

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
