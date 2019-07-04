import React from 'react'
import PropTypes from 'prop-types'
import Header from '../header/component'
import Footer from '../footer/component'
// import Map from '../map/component'
import autoBind from 'react-autobind'
import { connect } from 'react-redux'

/**
 * This component handles the invitations page.
 */

export class Explore extends React.Component {
  constructor (props) {
    super(props)
    autoBind(this)
  }

  /**
   * The render function
   * @returns {string} - The rendered output.
   */

  render () {
    const { loggedInMember } = this.props

    return (
      <React.Fragment>
        <Header name={loggedInMember && loggedInMember.name ? loggedInMember.name : null} />
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
    loggedInMember: state.MemberLogin
  }
}

Explore.propTypes = {
  loggedInMember: PropTypes.object
}

export default connect(mapStateToProps)(Explore)
