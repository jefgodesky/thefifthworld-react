import React from 'react'
import autoBind from 'react-autobind'
import Header from '../header/component'
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
        <Header />
        <main>
          <p>This is the homepage.</p>
        </main>
      </React.Fragment>
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

export default connect(mapStateToProps)(Home)
