/* global __isClient__ */

import React from 'react'
import PropTypes from 'prop-types'
import RouteParser from 'route-parser'
import Header from '../header/component'
import Footer from '../footer/component'
import Messages from '../messages/component'
import Error401 from '../error-401/component'
import autoBind from 'react-autobind'
import { connect } from 'react-redux'
import parse from '../../server/parse'

import * as actions from './actions'
import Member from '../../shared/models/member'

/**
 * This component handles the member profile page.
 */

export class MemberProfile extends React.Component {
  constructor (props) {
    super(props)
    autoBind(this)
  }

  /**
   * This is a static function used on the server to load data from the
   * database through the Member model. If a record is found, then an action is
   * dispatched that adds that record to the Redux state.
   * @param req {Object} - The request object from Express.
   * @param db {Pool} - A database connection to query.
   * @param store {Object} - A Redux store object.
   */

  static async load (req, db, store) {
    if (!__isClient__ && this.path && req.originalUrl && store.dispatch && (typeof store.dispatch === 'function')) {
      const routeParser = new RouteParser(this.path)
      const params = routeParser.match(req.originalUrl)
      if (params.id) {
        const member = await Member.get(params.id, db)
        if (member.bio) member.bioHTML = await parse(member.bio, db)
        store.dispatch(actions.load(member))
      }
    }
  }

  /**
   * Renders the form for a member to change her profile.
   * @param firstTime {boolean} - `true` if this is the member's first time
   *   logging in (in which case we want to render a little extra information).
   *   Defaults to `false`.
   * @returns {*} - JSX to render the form.
   */

  renderForm (firstTime = false) {
    const name = firstTime ? '' : this.props.member.getName ? this.props.member.getName() : this.props.member.name
    const front = firstTime
      ? (<p><strong>Welcome to the Fifth World!</strong> First tell us a little bit about yourself. Then add a <em>passphrase</em> so you can log back in later.</p>)
      : [
        <nav className='breadcrumbs' key='breadcrumbs'>
          <ul>
            <li><a href='/dashboard'>Dashboard</a></li>
          </ul>
        </nav>,
        <Messages key='messages' />
      ]
    const action = firstTime ? '/welcome' : '/member'

    return (
      <React.Fragment>
        <Header />
        <main>
          {front}
          <form method='post' action={action}>
            <input type='hidden' name='id' value={this.props.member.id} />
            <label htmlFor='name'>Name</label>
            <input type='text' name='name' id='name' defaultValue={name} placeholder='What would you like us to call you?' />
            <label htmlFor='email'>Email</label>
            <input type='text' name='email' id='email' defaultValue={this.props.member.email} placeholder='you@example.com' />
            <aside>
              <p>A long, memorable phrase, like a sentence, can provide more security than an arcane string of random letters and numbers that you&rsquo;ll have a hard time remembering. That&rsquo;s why we ask for a pass <em>phrase</em>. We also leave it open in plain text to make it easier for you to come up with and use a stronger one. You can probably check for someone looking over your shoulder more easily than you can check for hackers.</p>
              <p>If you submit this form without providing anything here, your old pass phrase will remain unchanged.</p>
              <div className='form-field'>
                <label htmlFor='password'>Passphrase</label>
                <input type='text' name='password' id='password' placeholder='Enter a secret pass phrase' />
              </div>
            </aside>
            <label htmlFor='bio'>About</label>
            <textarea name='bio' id='bio' defaultValue={this.props.member.bio} />
            <h2>Links</h2>
            <p>If you&lsquo;d like to make it easier for other people to find and follow you on social media or other networks, provide some links here. Any that you provide will be shown on your profile. Anny you choose not to share will simply not appear.</p>
            <label htmlFor='facebook'>Facebook</label>
            <input type='text' name='facebook' id='facebook' placeholder='https://facebook.com/your-username-here' />
            <label htmlFor='twitter'>Twitter</label>
            <input type='text' name='twitter' id='twitter' placeholder='https://twitter.com/your-username-here' />
            <label htmlFor='github'>Github</label>
            <input type='text' name='github' id='github' placeholder='https://github.com/your-username-here' />
            <label htmlFor='patreon'>Patreon</label>
            <input type='text' name='patreon' id='patreon' placeholder='https://patreon.com/your-username-here' />
            <label htmlFor='web'>Website</label>
            <input type='text' name='web' id='web' placeholder='https://yourwebsite.com' />
            <p className='actions'>
              <button>Save</button>
              <a href={`/member/${this.props.member.id}`} className='button secondary'>Cancel</a>
            </p>
          </form>
        </main>
        <Footer />
      </React.Fragment>
    )
  }

  /**
   * Renders the links to be shown on a member's profile.
   * @returns {*} - JSX for the links to be rendered on a member's profile.
   */

  renderLinks () {
    const { facebook, twitter, github, patreon, web } = this.props.member
    const links = []
    if (web) links.push(<li key='web' className='web'><a href={web}>Website</a></li>)
    if (patreon) links.push(<li key='patreon' className='patreon'><a href={patreon}>Patreon</a></li>)
    if (github) links.push(<li key='github' className='github'><a href={github}>Github</a></li>)
    if (facebook) links.push(<li key='facebook' className='facebook'><a href={facebook}>Facebook</a></li>)
    if (twitter) links.push(<li key='twitter' className='twitter'><a href={twitter}>Twitter</a></li>)
    return links.length > 0
      ? (
        <ul className='links'>
          {links}
        </ul>
      )
      : null
  }

  /**
   * Renders the profile page.
   * @returns {*} - JSX for the profile page.
   */

  renderProfile () {
    const actions = Member.canEdit(this.props.member, this.props.loggedInMember)
      ? (<p className='actions'><a href={`/member/${this.props.member.id}/edit`} className='button'>Edit Profile</a></p>)
      : (<React.Fragment />)
    const bio = this.props.member.bio
      ? (<div className='bio' dangerouslySetInnerHTML={{ __html: this.props.member.bioHTML }} />)
      : null

    return (
      <React.Fragment>
        <Header />
        <main className='profile'>
          <h1>{this.props.member.name}</h1>
          {bio}
          {this.renderLinks()}
          {actions}
        </main>
        <Footer />
      </React.Fragment>
    )
  }

  /**
   * The render function
   * @returns {string} - The rendered output.
   */

  render () {
    const canEdit = func => {
      if (Member.canEdit(this.props.member, this.props.loggedInMember)) {
        return func()
      } else {
        return (<Error401 />)
      }
    }

    switch (this.props.match.path) {
      case '/member/:id/edit':
        return canEdit(() => this.renderForm())
      case '/welcome/:id':
        return canEdit(() => this.renderForm(true))
      default:
        return this.renderProfile()
    }
  }
}

/**
 * Maps Redux state to the component's props.
 * @param state - The state from Redux.
 * @returns {Object} - The component's new props.
 */

const mapStateToProps = state => {
  return {
    loggedInMember: state.MemberLogin,
    member: state.MemberProfile
  }
}

MemberProfile.propTypes = {
  loggedInMember: PropTypes.object,
  match: PropTypes.object,
  member: PropTypes.object
}

export default connect(mapStateToProps)(MemberProfile)
