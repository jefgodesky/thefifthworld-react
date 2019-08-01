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
    const { addClasses, fullPage, name } = this.props
    const account = name
      ? [
        <li key={1}><a href='/dashboard'>{name}</a></li>,
        <li key={2}><a href='/logout'>Logout</a></li>
      ]
      : (<li><a href='/login'>Login</a></li>)
    const title = this.props.title
      ? (<h1>{this.props.title}</h1>)
      : null
    const header = this.props.header
      ? { backgroundImage: `url(${this.props.header})` }
      : null

    let arr = []
    if (addClasses && Array.isArray(addClasses)) {
      arr = addClasses
    } else if (addClasses) {
      arr = [ addClasses ]
    }
    if (fullPage) {
      arr = [ ...arr, 'fullpage' ]
    }
    const classes = arr.length > 0 ? arr.join(' ') : null

    const nav = fullPage
      ? null
      : (
        <nav>
          <ul>
            <li><a href='/explore'>Explore</a></li>
            <li><a href='/stories'>Read</a></li>
            <li><a href='/rpg'>Play</a></li>
          </ul>
        </nav>
      )

    const branding = fullPage
      ? null
      : (
        <h1 className='brand'>
          <a href='/'>
            <img src='https://s3.amazonaws.com/thefifthworld/website/images/wordmark.white.svg' alt='The Fifth World' />
          </a>
        </h1>
      )

    return (
      <header style={header} className={classes}>
        <nav className='account'>
          <ul>
            {account}
          </ul>
        </nav>
        {branding}
        {title}
        {nav}
      </header>
    )
  }
}

Header.propTypes = {
  addClasses: PropTypes.oneOfType([ PropTypes.string, PropTypes.array ]),
  fullPage: PropTypes.bool,
  header: PropTypes.string,
  name: PropTypes.string,
  title: PropTypes.string
}

export default Header
