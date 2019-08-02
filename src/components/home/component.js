import React from 'react'
import PropTypes from 'prop-types'
import Header from '../header/component'
import Footer from '../footer/component'
import PatreonLink from '../patreon-link/component'
import autoBind from 'react-autobind'
import { connect } from 'react-redux'

/**
 * This component handles the home page.
 */

export class Home extends React.Component {
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
        <Header
          name={loggedInMember ? loggedInMember.name : null}
          addClasses={[ 'homepage' ]}
          skipNav />
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
 * @params state {Object} - The current state.
 * @returns {Object} - The component's new props.
 */

const mapStateToProps = (state) => {
  return {
    loggedInMember: state.MemberLogin
  }
}

Home.propTypes = {
  loggedInMember: PropTypes.object
}

export default connect(mapStateToProps)(Home)
