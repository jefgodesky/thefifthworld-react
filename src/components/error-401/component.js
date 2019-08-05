import React from 'react'
import PropTypes from 'prop-types'
import Header from '../header/component'
import Footer from '../footer/component'
import autoBind from 'react-autobind'
import { connect } from 'react-redux'

/**
 * This component handles a 404 error page.
 */

export class Error401 extends React.Component {
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
          title='Unauthorized' />
        <main>
          <h2>Error 401</h2>
          <p>Only members have access to this page. You might just need to <a href='/login'>log in</a>. If you haven&rsquo;t become a member, <a href='/about/membership'>you can find out more about how to become one</a>.</p>
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

Error401.propTypes = {
  loggedInMember: PropTypes.object
}

export default connect(mapStateToProps)(Error401)
