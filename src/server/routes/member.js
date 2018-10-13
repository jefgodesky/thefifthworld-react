import express from 'express'

const passport = require('passport')
const MemberRouter = express.Router()

MemberRouter.post('/login', (passport.authenticate('local', {
  successRedirect: '/dashboard',
  failureRedirect: '/login'
})))

export default MemberRouter
