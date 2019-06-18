import React from 'react'
import PropTypes from 'prop-types'
import Header from '../header/component'
import Footer from '../footer/component'
import autoBind from 'react-autobind'
import { connect } from 'react-redux'

/**
 * This component handles a 404 error page.
 */

export class Error404 extends React.Component {
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
        <Header name={loggedInMember ? loggedInMember.name : null} />
        <main>
          <p>Sorry, could not find that page</p>
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

Error404.propTypes = {
  loggedInMember: PropTypes.object
}

export default connect(mapStateToProps)(Error404)
