import React from 'react'
import PropTypes from 'prop-types'
import autoBind from 'react-autobind'
import { connect } from 'react-redux'

/**
 * This component handles the home page.
 */

class Home extends React.Component {
  constructor (props) {
    super(props)
    autoBind(this)
  }

  /**
   * The render function
   * @returns {string} - The rendered output.
   */

  render () {
    return (
      <React.Fragment>
        <h1>Home</h1>
        <p>Hello, {this.props.name}</p>
      </React.Fragment>
    )
  }
}


/**
 * Maps Redux state to the component's props.
 * @param state - The state from Redux.
 * @returns {Object} - The component's new props.
 */

const mapStateToProps = state => {
  return {
    name: state.MemberLogin.name
  }
}

Home.propTypes = {
  loggedIn: PropTypes.number
}

export default connect(mapStateToProps)(Home)

