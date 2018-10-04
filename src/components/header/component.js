import React from 'react'
import autoBind from 'react-autobind'
import { connect } from 'react-redux'

/**
 * This component handles the home page.
 */

class Header extends React.Component {
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
      <header>
        <h1>The Fifth World</h1>
      </header>
    )
  }
}

/**
 * Maps Redux state to the component's props.
 * @returns {Object} - The component's new props.
 */

const mapStateToProps = () => {
  return {}
}

export default connect(mapStateToProps)(Header)
