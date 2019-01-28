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
    if (!this.props.loggedInMember) {
      return (
        <Error401 />
      )
    } else {
      return (
        <React.Fragment>
          <Header />
          <main className='wiki'>
            <Messages />
            <h1>Create a New Wiki Page</h1>
            <p>We use <strong>wiki pages</strong> to describe general parts of the Fifth World, like <a href='/orality'>orality</a> and <a href='/animism'>animism</a>. We also use wiki pages to create books and guides like the <a href='/rpg'>tabletop roleplaying game</a>. If you&rsquo;d like to add a <a href='/new-character'>character</a>, <a href='/new-place'>place</a>, <a href='/new-family'>family</a>, or <a href='/new-story'>story</a> (whether short stories or longer stories that might have multiple chapters), or if you&rsquo;d like to share your <a href='/new-art'>art</a>, we have more specific forms for those things.</p>
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
