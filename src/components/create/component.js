import React from 'react'
import PropTypes from 'prop-types'
import Header from '../header/component'
import Footer from '../footer/component'
import Messages from '../messages/component'
import Form from '../form/component'
import Error401 from '../error-401/component'
import autoBind from 'react-autobind'
import { connect } from 'react-redux'

/**
 * This component handles creating new pages.
 */

export class Create extends React.Component {
  constructor (props) {
    super(props)
    autoBind(this)
  }

  render () {
    const { loggedInMember } = this.props
    if (!loggedInMember) {
      return (
        <Error401 />
      )
    } else {
      return (
        <React.Fragment>
          <Header name={loggedInMember.name} />
          <main className='wiki'>
            <Messages />
            <h1>Create a New Page</h1>
            <Form />
          </main>
          <Footer />
        </React.Fragment>
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
    loggedInMember: state.MemberLogin
  }
}

Create.propTypes = {
  loggedInMember: PropTypes.object
}

export default connect(mapStateToProps)(Create)
