/* global __isClient__ */

import React from 'react'
import PropTypes from 'prop-types'
import Header from '../header/component'
import Footer from '../footer/component'
import Messages from '../messages/component'
import autoBind from 'react-autobind'
import { connect } from 'react-redux'

import Member from '../../shared/models/member'
import * as actions from './actions'

/**
 * This component handles the invitations page.
 */

class Invitations extends React.Component {
  constructor (props) {
    super(props)
    autoBind(this)
  }

  /**
   * This is a static function used on the server to load data from the
   * database for the invitations page.
   * @param req {Object} - The request object from Express.
   * @param db {Pool} - A database connection to query.
   * @param store {Object} - A Redux store object.
   */

  static async load (req, db, store) {
    if (!__isClient__ && req.user && store.dispatch && (typeof store.dispatch === 'function')) {
      const invited = await Member.getInvited(req.user.id, db)
      if (invited.length > 0) {
        store.dispatch(actions.load(invited))
      }
    }
  }

  /**
   * Returns a table of the people that the member has invited.
   * @returns {Object|null} - JSX for a table displaying the people that the
   *   member has invited, or `null` if the member has not invited anyone.
   */

  getInvitations () {
    const invitations = []
    if (this.props.invitations) {
      this.props.invitations.forEach((invitation, i) => {
        const name = invitation.accepted
          ? (<a href={`/member/${invitation.id}`}>{invitation.name}</a>)
          : invitation.name
        const status = invitation.accepted ? 'Member' : 'Invited'
        invitations.push(
          <tr key={i}>
            <td>{name}</td>
            <td className='status'>{status}</td>
          </tr>
        )
      })
    }

    return invitations.length > 0
      ? (
        <table className='invitations'>
          <thead>
            <tr>
              <th>You invited&hellip;</th>
              <th className='status'>Status</th>
            </tr>
          </thead>
          <tbody>
            {invitations}
          </tbody>
        </table>
      )
      : null
  }

  /**
   * The render function
   * @returns {string} - The rendered output.
   */

  render () {
    const invitationCount = this.props.loggedInMember.admin ? '∞' : this.props.loggedInMember.invitations
    const invitations = this.getInvitations()

    return (
      <React.Fragment>
        <Header />
        <main className='invitations'>
          <nav className='breadcrumbs'>
            <ul>
              <li><a href='/dashboard'>Dashboard</a></li>
            </ul>
          </nav>
          <Messages />
          <h1>Invitations</h1>
          {invitations}
          {(invitationCount === '∞' || invitationCount > 0) &&
          <React.Fragment>
            <h2>Send Invitations</h2>
            <p>You can send invitations to up to <strong>{invitationCount}</strong> more people. Enter each email address on a separate line.</p>
            <form action='/invite' method='post'>
              <textarea name='invitations' placeholder='someone@example.com' />
              <p className='actions'>
                <button>Send Invitations</button>
              </p>
            </form>
          </React.Fragment>
          }
        </main>
        <Footer />
      </React.Fragment>
    )
  }
}

/**
 * Maps Redux state to the component's props.
 * @params state {Object} - The current state.
 * @returns {Object} - The component's new props.
 */

const mapStateToProps = state => {
  return {
    invitations: state.Invitations,
    loggedInMember: state.MemberLogin
  }
}

Invitations.propTypes = {
  invitations: PropTypes.array,
  loggedInMember: PropTypes.object
}

export default connect(mapStateToProps)(Invitations)
