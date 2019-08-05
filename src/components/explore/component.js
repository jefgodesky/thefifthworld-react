/* global __isClient__ */

import React from 'react'
import PropTypes from 'prop-types'
import Header from '../header/component'
import Footer from '../footer/component'
import Map from '../map/component'
import autoBind from 'react-autobind'
import { connect } from 'react-redux'
import * as actions from './actions'

/**
 * This component handles the invitations page.
 */

export class Explore extends React.Component {
  constructor (props) {
    super(props)
    autoBind(this)
    this.state = {
      isClient: false
    }
  }

  /**
   * This method is called when the component mounts. This only happenss on the
   * client, so this is an easy place to distinguish client-side from server-
   * side activity.
   */

  componentDidMount () {
    this.setState({ isClient: true })
  }

  /**
   * This method returns the content to use when the component is loaded on the
   * client side (i.e., the enhanced experience).
   * @returns {*} - JSX for the enhanced experience.
   */

  renderClient () {
    return (<Map places={this.props.places} />)
  }

  /**
   * This method renders the content to use when the component is loaded on the
   * server side (i.e., the base experience).
   * @returns {*} - JSX for the base experience.
   */

  static renderServer () {
    return (
      <main>
        <h1>Explore</h1>
        <p>Choose a continent:</p>
        <ul>
          <li><a href='/africa'>Africa</a></li>
          <li><a href='/north-america'>North America</a></li>
          <li><a href='/south-america'>South America</a></li>
          <li><a href='/antarctica'>Antarctica</a></li>
          <li><a href='/eurasia'>Eurasia</a></li>
          <li><a href='/oceania'>Oceania</a></li>
        </ul>
      </main>
    )
  }

  /**
   * This is a static function used on the server to load data from the
   * database. If the requested records are found, then an action is
   * dispatched that adds those records to the Redux state.
   * @param req {Object} - The request object from Express.
   * @param db {Pool} - A database connection to query.
   * @param store {Object} - A Redux store object.
   */

  static async load (req, db, store) {
    if (!__isClient__) {
      const records = await db.run('SELECT title, path, lat, lon FROM pages WHERE type="Place" AND lat IS NOT NULL and lon IS NOT NULL')
      store.dispatch(actions.load(records))
    }
  }

  /**
   * The render function
   * @returns {string} - The rendered output.
   */

  render () {
    const { loggedInMember } = this.props
    const { isClient } = this.state
    const content = isClient ? this.renderClient() : Explore.renderServer()

    return (
      <React.Fragment>
        <Header
          name={loggedInMember && loggedInMember.name ? loggedInMember.name : null}
          addClasses={[ 'fullpage' ]}
          skipBranding
          skipNav />
        {content}
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
    places: state.Explore
  }
}

Explore.propTypes = {
  loggedInMember: PropTypes.object,
  places: PropTypes.array
}

export default connect(mapStateToProps)(Explore)
