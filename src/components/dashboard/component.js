import React from 'react'
import PropTypes from 'prop-types'
import Header from '../header/component'
import Footer from '../footer/component'
import Messages from '../messages/component'
import autoBind from 'react-autobind'
import { connect } from 'react-redux'
import config from '../../../config'

/**
 * This component handles the dashboard.
 */

export class Dashboard extends React.Component {
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
        <Header name={loggedInMember.name} />
        <main className='dashboard'>
          <Messages />
          <p><strong>Hello, {loggedInMember.name}.</strong> Welcome to your dashboard. This page gives you a quick summary of the latest things going on in the Fifth World.</p>
          <hr />
          <section className='choices create'>
            <h3>Create Something</h3>
            <p>Add something new to the Fifth World.</p>
            <ul>
              <li><a href='/new' className='button'>Add a Page</a></li>
              <li><a disabled title='Coming soon' className='button'>Add a Family</a></li>
              <li><a disabled title='Coming soon' className='button'>Add a Character</a></li>
              <li><a disabled title='Coming soon' className='button'>Add a Place</a></li>
              <li><a disabled title='Coming soon' className='button'>Write a Story</a></li>
              <li><a href='/upload' className='button'>Upload a File</a></li>
              <li><a disabled title='Coming soon' className='button'>Upload Art</a></li>
            </ul>
          </section>
          <section className='member'>
            <h3>Your Membership</h3>
            <ul>
              <li>
                <a href={`/member/${loggedInMember.id}/edit`} className='button'>Your Profile</a>
                <p>Update your name, email, and password, and decide what you want to share about your activity on the Fifth World.</p>
              </li>
              <li>
                <a href={`/connect`} className='button'>Connect</a>
                <p>Connect other services like Facebook, Twitter, Patreon, Google, or Github, so you can use them to log in.</p>
              </li>
              <li>
                <a href={`/invite`} className='button'>Invitations</a>
                <p>Invite your friends to join the Fifth World, and see a list of all the members that you invited.</p>
              </li>
              <li>
                <a href={`https://discord.gg/${config.discord.code}`} className='button'>Chat</a>
                <p>Join the Fifth World Discord server to chat with other members.</p>
              </li>
            </ul>
          </section>
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

Dashboard.propTypes = {
  loggedInMember: PropTypes.object
}

export default connect(mapStateToProps)(Dashboard)
