import React from 'react'
import PropTypes from 'prop-types'
import Header from '../header/component'
import Footer from '../footer/component'
import Messages from '../messages/component'
import Error401 from '../error-401/component'
import Error404 from '../error-404/component'
import Wiki from '../wiki/view'
import autoBind from 'react-autobind'
import { connect } from 'react-redux'
import { canRead } from '../../shared/permissions'

/**
 * This component handles the member profile page.
 */

class Page extends React.Component {
  constructor (props) {
    super(props)
    autoBind(this)
  }

  /**
   * The render function
   * @returns {string} - The rendered output.
   */

  render () {
    if (this.props.page) {
      if (canRead(this.props.loggedInMember, this.props.page)) {
        let component
        switch (this.props.page.type) {
          default: component = (<Wiki />); break
        }

        return (
          <React.Fragment>
            <Header />
            <main>
              <Messages />
              {component}
            </main>
            <Footer />
          </React.Fragment>
        )
      } else {
        return (
          <Error401 />
        )
      }
    } else {
      return (
        <Error404 />
      )
    }
  }
}

/**
 * Maps Redux state to the component's props.
 * @param state - The state from Redux.
 * @returns {Object} - The component's new props.
 */

const mapStateToProps = state => {
  return {
    loggedInMember: state.MemberLogin,
    page: state.Page
  }
}

Page.propTypes = {
  loggedInMember: PropTypes.object,
  page: PropTypes.object
}

export default connect(mapStateToProps)(Page)
