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
 * This component handles the OAuth2 connections page.
 */

class OAuth2Connect extends React.Component {
  constructor (props) {
    super(props)
    autoBind(this)
  }

  /**
   * This is a static function used on the server to load data from the
   * database for the OAuth2 connections page.
   * @param req {Object} - The request object from Express.
   * @param db {Pool} - A database connection to query.
   * @param store {Object} - A Redux store object.
   */

  static async load (req, db, store) {
    if (!__isClient__ && req.user && store.dispatch && (typeof store.dispatch === 'function')) {
      const member = await Member.get(req.user.id, db)
      const services = await member.getAuth(db)
      store.dispatch(actions.load(services))
    }
  }

  /**
   * Renders the rows of the table displaying which OAuth2 services the member
   * has connected.
   * @param services {Array} = An array of strings defining all of the
   *   possible services that a member can connect.
   * @returns {Array} - A JSX array to render the rows of the table.
   */

  renderRows (services) {
    const jsx = []
    services.forEach(service => {
      const id = service.toLowerCase()
      const connected = this.props.connections.indexOf(id) > -1
      const status = connected ? 'Connected' : 'Not connected'
      const button = connected
        ? <a href={`/disconnect/${id}`} className='button'>Disconnect</a>
        : <a href={`/connect/${id}`} className='button'>Connect</a>
      jsx.push(
        <tr key={id}>
          <td>{service}</td>
          <td>{status}</td>
          <td className='actions'>{button}</td>
        </tr>
      )
    })
    return jsx
  }

  /**
   * The render function
   * @returns {string} - The rendered output.
   */

  render () {
    const rows = this.renderRows([ 'Patreon', 'Discord', 'Google', 'Facebook', 'Twitter' ])

    return (
      <React.Fragment>
        <Header />
        <main className='connections'>
          <nav className='breadcrumbs'>
            <ul>
              <li><a href='/dashboard'>Dashboard</a></li>
            </ul>
          </nav>
          <Messages />
          <p>If you use any of these services or networks, you can connect your account there to your Fifth World membership so that you can use them to log in next time.</p>
          <table>
            <thead>
              <tr>
                <th>Service</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows}
            </tbody>
          </table>
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
    connections: state.OAuth2Connect
  }
}

OAuth2Connect.propTypes = {
  connections: PropTypes.array
}

export default connect(mapStateToProps)(OAuth2Connect)
