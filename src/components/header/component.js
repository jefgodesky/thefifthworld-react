import React from 'react'
import PropTypes from 'prop-types'
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
    const account = this.props.loggedInMember
      ? [
        <li key={1}><a href='/dashboard'>{this.props.loggedInMember.name}</a></li>,
        <li key={2}><a href='/logout'>Logout</a></li>
      ]
      : (<li><a href='/login'>Login</a></li>)
    return (
      <header>
        <nav className='account'>
          <ul>
            {account}
          </ul>
        </nav>
        <h1>
          <a href='/'>
            <img src='https://s3.amazonaws.com/thefifthworld/website/images/wordmark.white.svg' alt='The Fifth World' />
          </a>
        </h1>
        <nav>
          <ul>
            <li className='active'><a href='/'>Explore</a></li>
            <li><a href='/stories'>Read</a></li>
            <li><a href='/rpg'>Play</a></li>
          </ul>
        </nav>
      </header>
    )
  }
}

/**
 * Maps Redux state to the component's props.
 * @returns {Object} - The component's new props.
 */

const mapStateToProps = state => {
  const loggedInMember = state.MemberLogin
  return {
    loggedInMember
  }
}

Header.propTypes = {
  loggedInMember: PropTypes.object
}

export default connect(mapStateToProps)(Header)
