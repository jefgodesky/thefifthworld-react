import { Strategy as LocalStrategy } from 'passport-local'
import Member from './models/member'

import db from './db'

const auth = passport => {
  passport.serializeUser((user, done) => {
    done(null, user.getId())
  })

  passport.deserializeUser(async (id, done) => {
    const member = await Member.get(id, db)
    done(null, member)
  })

  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'passphrase',
    passReqToCallback: true
  }, async (req, email, passphrase, done) => {
    const notFound = 'Email/passphrase not found'
    const matches = await Member.find({ email }, db)
    return (!Array.isArray(matches) && matches.checkPass(passphrase))
      ? done(null, matches)
      : done(null, false, notFound)
  }))
}

export default auth
