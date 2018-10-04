import React from 'react'
import PropTypes from 'prop-types'
import Header from '../header/component'
import Footer from '../footer/component'
import autoBind from 'react-autobind'
import { connect } from 'react-redux'

/**
 * This component handles the login form.
 */

class MemberLogin extends React.Component {
  constructor (props) {
    super(props)
    autoBind(this)
  }

  /**
   * The render function
   * @returns {string} - The rendered output.
   */

  render () {
    const output = this.props.loggedIn ? 'Already logged in' : 'Login'
    return (
      <React.Fragment>
        <Header />
        <main>
          <h2>{output}</h2>
        </main>
        <Footer />
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
    loggedIn: state.MemberLogin.loggedIn
  }
}

MemberLogin.propTypes = {
  loggedIn: PropTypes.number
}

export default connect(mapStateToProps)(MemberLogin)
