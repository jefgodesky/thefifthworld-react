import { Strategy as LocalStrategy } from 'passport-local'
import Member from './models/member'

import db from './db'

const auth = passport => {
  passport.serializeUser((user, done) => {
    done(null, user)
  })

  passport.deserializeUser((user, done) => {
    done(null, user)
  })

  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'passphrase'
  }, (email, passphrase, done) => {
    const notFound = 'Email/passphrase not found'
    Member.find({ email }, db)
      .then(matches => {
        if (!Array.isArray(matches) && matches.checkPass(passphrase)) {
          done(null, matches)
        } else {
          done(null, false, notFound)
        }
      })
      .catch(() => {
        done(null, false, notFound)
      })
  }))
}

export default auth
