import React from 'react'
import PropTypes from 'prop-types'

/**
 * This component handles the home page.
 */

export class Header extends React.Component {
  /**
   * The render function
   * @returns {string} - The rendered output.
   */

  render () {
    const account = this.props.name
      ? [
        <li key={1}><a href='/dashboard'>{this.props.name}</a></li>,
        <li key={2}><a href='/logout'>Logout</a></li>
      ]
      : (<li><a href='/login'>Login</a></li>)
    const title = this.props.title
      ? (<h1>{this.props.title}</h1>)
      : null
    const header = this.props.header
      ? { backgroundImage: `url(${this.props.header})` }
      : null
    const classes = this.props.addClasses
      ? Array.isArray(this.props.addClasses)
        ? this.props.addClasses.join(' ')
        : this.props.addClasses
      : null

    return (
      <header style={header} className={classes}>
        <nav className='account'>
          <ul>
            {account}
          </ul>
        </nav>
        <h1 className='brand'>
          <a href='/'>
            <img src='https://s3.amazonaws.com/thefifthworld/website/images/wordmark.white.svg' alt='The Fifth World' />
          </a>
        </h1>
        {title}
        <nav>
          <ul>
            <li><a href='/explore'>Explore</a></li>
            <li><a href='/stories'>Read</a></li>
            <li><a href='/rpg'>Play</a></li>
          </ul>
        </nav>
      </header>
    )
  }
}

Header.propTypes = {
  addClasses: PropTypes.oneOfType([ PropTypes.string, PropTypes.array ]),
  header: PropTypes.string,
  name: PropTypes.string,
  title: PropTypes.string
}

export default Header
