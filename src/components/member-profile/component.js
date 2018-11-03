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

import * as actions from './actions'
import Member from '../../shared/models/member'

/**
 * This component handles the member profile page.
 */

class MemberProfile extends React.Component {
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
        store.dispatch(actions.load(member))
      }
    }
  }

  renderForm (firstTime = false) {
    const name = firstTime ? '' : this.props.member.getName ? this.props.member.getName() : this.props.member.name
    const front = firstTime
      ? (<p><strong>Welcome to the Fifth World!</strong> First tell us a little bit about yourself. Then add a <em>passphrase</em> so you can log back in later.</p>)
      : (<Messages />)
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

  renderProfile () {
    const actions = Member.canEdit(this.props.member, this.props.loggedInMember)
      ? (<p className='actions'><a href={`/member/${this.props.member.id}/edit`} className='button'>Edit Profile</a></p>)
      : (<React.Fragment />)
    return (
      <React.Fragment>
        <Header />
        <main className='profile'>
          <h1>{this.props.member.name}</h1>
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
