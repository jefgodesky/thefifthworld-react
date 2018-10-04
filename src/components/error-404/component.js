import React from 'react'
import PropTypes from 'prop-types'
import autoBind from 'react-autobind'
import Header from '../header/component'
import { connect } from 'react-redux'

/**
 * This component handles a 404 error page.
 */

class Error404 extends React.Component {
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
        <Header />
        <main>
          <p>Sorry, {this.props.name}, could not find that page</p>
        </main>
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
    name: state.Home.name
  }
}

Error404.propTypes = {
  name: PropTypes.string
}

export default connect(mapStateToProps)(Error404)
