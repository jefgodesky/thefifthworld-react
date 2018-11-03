import { Strategy as LocalStrategy } from 'passport-local'
import { Strategy as PatreonStrategy } from 'passport-patreon'
import { Strategy as DiscordStrategy } from 'passport-discord'
import { Strategy as GoogleStrategy } from 'passport-google-oauth2'
import { Strategy as FacebookStrategy } from 'passport-facebook'
import { Strategy as TwitterStrategy } from 'passport-twitter'
import Member from '../shared/models/member'

import config from '../../config'
import db from './db'

const handleAuth = async params => {
  if (params.id) {
    const member = await Member.findAuth(params.service, params.id, db)
    if (member) {
      // There's already a member with this ID, so we log her in.
      return params.done(null, member)
    } else if (params.user) {
      // We couldn't find any existing authorization with that ID, but the user
      // is already logged in, so we'll create a new authorization for her.
      await params.user.addAuth(params.service, params.id, params.token, db)
      if (params.name && ((params.user.name === undefined) || (params.user.name === ''))) {
        await params.user.setName(params.name, db)
      }
      return params.done(null, params.user)
    } else {
      // We couldn't find any existing authorization with that ID, and the user
      // isn't logged in. No dice.
      return params.done('UNAUTHORIZED')
    }
  } else {
    return params.done('UNAUTHORIZED')
  }
}

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
    passwordField: 'passphrase'
  }, async (email, passphrase, done) => {
    const notFound = 'Email/passphrase not found'
    const matches = await Member.find({ email }, db)
    return (!Array.isArray(matches) && matches.checkPass(passphrase))
      ? done(null, matches)
      : done(null, false, notFound)
  }))

  passport.use(new PatreonStrategy({
    clientID: config.patreon.id,
    clientSecret: config.patreon.secret,
    callbackURL: config.patreon.callback,
    passReqToCallback: true
  }, async (req, token, secret, profile, done) => {
    return handleAuth({
      service: 'patreon',
      id: profile.id,
      token,
      done,
      user: req.user
    })
  }))

  passport.use(new DiscordStrategy({
    clientID: config.discord.id,
    clientSecret: config.discord.secret,
    callbackURL: config.discord.callback,
    passReqToCallback: true
  }, async (req, token, secret, profile, done) => {
    return handleAuth({
      service: 'discord',
      id: profile.id,
      token,
      done,
      user: req.user
    })
  }))

  passport.use(new GoogleStrategy({
    clientID: config.google.id,
    clientSecret: config.google.secret,
    callbackURL: config.google.callback,
    passReqToCallback: true
  }, async (req, token, secret, profile, done) => {
    return handleAuth({
      service: 'google',
      id: profile.id,
      token,
      done,
      user: req.user,
      name: profile.displayName
    })
  }))

  passport.use(new FacebookStrategy({
    clientID: config.facebook.id,
    clientSecret: config.facebook.secret,
    callbackURL: config.facebook.callback,
    passReqToCallback: true
  }, async (req, token, refresh, profile, done) => {
    return handleAuth({
      service: 'facebook',
      id: profile.id,
      token,
      done,
      user: req.user,
      name: profile.displayName
    })
  }))

  passport.use(new TwitterStrategy({
    consumerKey: config.twitter.key,
    consumerSecret: config.twitter.secret,
    callbackURL: config.twitter.callback,
    passReqToCallback: true
  }, async (req, token, secret, profile, done) => {
    return handleAuth({
      service: 'twitter',
      id: profile.id,
      token,
      done,
      user: req.user
    })
  }))
}

export default auth
