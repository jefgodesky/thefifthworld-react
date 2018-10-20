import React from 'react'
import Header from '../header/component'
import Footer from '../footer/component'
import PatreonLink from '../patreon-link/component'
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
        <Header />
        <main>
          <p>This is the homepage.</p>
          <hr />
          <PatreonLink />
        </main>
        <Footer />
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
