/* global __isClient__ */

import React from 'react'
import PropTypes from 'prop-types'
import Header from '../header/component'
import Footer from '../footer/component'
import Messages from '../messages/component'
import autoBind from 'react-autobind'
import { connect } from 'react-redux'
import config from '../../../config'
import { formatDate } from '../../shared/utils'
import * as actions from './actions'

/**
 * This component handles the dashboard.
 */

export class Dashboard extends React.Component {
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
      const res = await db.run('SELECT p.id, p.title, p.path, q.timestamp FROM pages p, (SELECT page, MAX(timestamp) AS timestamp FROM changes GROUP BY page ORDER BY timestamp DESC LIMIT 10) q WHERE p.id = q.page;')
      if (res.length > 0) {
        const changes = res.map(r => {
          return {
            title: r.title,
            path: r.path,
            timestamp: formatDate(new Date(r.timestamp * 1000))
          }
        })
        store.dispatch(actions.load(changes))
      }
    }
  }

  renderUpdates () {
    const rows = this.props.updates
      ? this.props.updates.map((update, i) => (
        <tr key={i}>
          <td>
            <a href={update.path}>{update.title}</a>
          </td>
          <td className='timestamp' dangerouslySetInnerHTML={{ __html: update.timestamp }} />
        </tr>
      ))
      : []

    return (
      <table className='updates'>
        <tbody>
          {rows}
        </tbody>
      </table>
    )
  }

  /**
   * The render function
   * @returns {string} - The rendered output.
   */

  render () {
    const { loggedInMember } = this.props
    const updates = this.renderUpdates()

    return (
      <React.Fragment>
        <Header name={loggedInMember.name} />
        <main className='dashboard'>
          <Messages />
          <h1>Dashboard</h1>
          <h2>Recent Updates</h2>
          {updates}
          <section className='choices create'>
            <h3>Create Something</h3>
            <p>Add something new to the Fifth World.</p>
            <ul>
              <li><a href='/new' className='button'>Add a Page</a></li>
              <li><a href='/create-community' className='button'>Add a Community</a></li>
              <li><a disabled title='Coming soon' className='button'>Add a Character</a></li>
              <li><a disabled title='Coming soon' className='button'>Add a Place</a></li>
              <li><a disabled title='Coming soon' className='button'>Write a Story</a></li>
              <li><a href='/upload' className='button'>Upload a File</a></li>
              <li><a disabled title='Coming soon' className='button'>Upload Art</a></li>
            </ul>
          </section>
          <section className='member'>
            <h3>Your Membership</h3>
            <ul>
              <li>
                <a href={`/member/${loggedInMember.id}/edit`} className='button'>Your Profile</a>
                <p>Update your name, email, and password, and decide what you want to share about your activity on the Fifth World.</p>
              </li>
              <li>
                <a href={`/connect`} className='button'>Connect</a>
                <p>Connect other services like Facebook, Twitter, Patreon, Google, or Github, so you can use them to log in.</p>
              </li>
              <li>
                <a href={`/invite`} className='button'>Invitations</a>
                <p>Invite your friends to join the Fifth World, and see a list of all the members that you invited.</p>
              </li>
              <li>
                <a href={`https://discord.gg/${config.discord.code}`} className='button'>Chat</a>
                <p>Join the Fifth World Discord server to chat with other members.</p>
              </li>
            </ul>
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
    loggedInMember: state.MemberLogin,
    updates: state.Dashboard
  }
}

Dashboard.propTypes = {
  loggedInMember: PropTypes.object,
  updates: PropTypes.array
}

export default connect(mapStateToProps)(Dashboard)
