/* global __isClient__ */

import React from 'react'
import PropTypes from 'prop-types'
import Header from '../header/component'
import Footer from '../footer/component'
import Messages from '../messages/component'
import autoBind from 'react-autobind'
import { connect } from 'react-redux'

import Member from '../../server/models/member'
import * as actions from './actions'

/**
 * This component handles the dashboard.
 */

class Dashboard extends React.Component {
  constructor (props) {
    super(props)
    autoBind(this)
  }

  /**
   * This is a static function used on the server to load data from the
   * database for the dashboard.
   * @param req {Object} - The request object from Express.
   * @param db {Pool} - A database connection to query.
   * @param store {Object} - A Redux store object.
   */

  static async load (req, db, store) {
    if (!__isClient__ && req.user && store.dispatch && (typeof store.dispatch === 'function')) {
      const invited = await Member.getInvited(req.user.id, db)
      if (invited.length > 0) {
        store.dispatch(actions.load({ invited }))
      }
    }
  }

  getInvitations () {
    const invitations = []
    if (this.props.dashboard && this.props.dashboard.invited && Array.isArray(this.props.dashboard.invited)) {
      this.props.dashboard.invited.forEach((invitation, i) => {
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
        <main>
          <Messages />
          <aside>
            <p>Hello, {this.props.loggedInMember.name}. Welcome to your dashboard. This page gives you a quick summary of the latest things going on in the Fifth World.</p>
          </aside>
          <p className='actions'>
            <a href={`/member/${this.props.loggedInMember.id}`} className='button'>View Your Profile</a>
            <a href={`/member/${this.props.loggedInMember.id}/edit`} className='button'>Change Your Profile</a>
          </p>
          <section id='invitations'>
            <h1>Invitations</h1>
            {invitations}
            {invitationCount > 0 &&
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
          </section>
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
    dashboard: state.Dashboard,
    loggedInMember: state.MemberLogin
  }
}

Dashboard.propTypes = {
  dashboard: PropTypes.object,
  loggedInMember: PropTypes.object
}

export default connect(mapStateToProps)(Dashboard)
