import React from 'react'
import PropTypes from 'prop-types'
import Header from '../header/component'
import Footer from '../footer/component'
import autoBind from 'react-autobind'
import { connect } from 'react-redux'

/**
 * This component handles the dashboard.
 */

class Dashboard extends React.Component {
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
          <aside>
            <p>Hello, {this.props.loggedInMember.name}. Welcome to your dashboard. This page gives you a quick summary of the latest things going on in the Fifth World.</p>
          </aside>
          <p className='actions'>
            <a href={`/member/${this.props.loggedInMember.id}`} className='button'>View Your Profile</a>
            <a href={`/member/${this.props.loggedInMember.id}/edit`} className='button'>Change Your Profile</a>
          </p>
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
  const loggedInMember = state.MemberLogin

  return {
    loggedInMember
  }
}

Dashboard.propTypes = {
  loggedInMember: PropTypes.object
}

export default connect(mapStateToProps)(Dashboard)
