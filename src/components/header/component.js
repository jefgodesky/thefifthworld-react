import React from 'react'
import PropTypes from 'prop-types'
import config from '../../../config'

/**
 * This component handles the home page.
 */

export class Header extends React.Component {
  /**
   * The render function
   * @returns {string} - The rendered output.
   */

  render () {
    const { addClasses, skipBranding, skipNav, name } = this.props
    const account = name
      ? [
        <li key={1}><a href='/dashboard'>{name}</a></li>,
        <li key={2}><a href='/logout'>Logout</a></li>
      ]
      : (<li><a href='/login'>Login</a></li>)
    let titleClasses = []
    if (this.props.credit) titleClasses = [ 'has-credit' ]
    if (this.props.title && this.props.title.length > 40) titleClasses = [ ...titleClasses, 'long' ]
    const title = this.props.title
      ? (<h1 className={titleClasses.join(' ')}>{this.props.title}</h1>)
      : null
    const header = this.props.header
      ? { backgroundImage: `url("https://s3.${config.aws.region}.amazonaws.com/${config.aws.bucket}/website/images/top.png"), url("${this.props.header}")` }
      : null

    let arr = []
    if (addClasses && Array.isArray(addClasses)) {
      arr = addClasses
    } else if (addClasses) {
      arr = [ addClasses ]
    }
    const classes = arr.length > 0 ? arr.join(' ') : null

    const nav = skipNav
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

    const branding = skipBranding
      ? null
      : (
        <h1 className='brand'>
          <a href='/'>
            <img src='https://s3.amazonaws.com/thefifthworld/website/images/wordmark.white.svg' alt='The Fifth World' />
          </a>
        </h1>
      )

    const credit = this.props.credit
      ? (<h2 className='credit'>By {this.props.credit}</h2>)
      : null

    return (
      <header style={header} className={classes}>
        <nav className='account'>
          <ul>
            {account}
          </ul>
        </nav>
        {branding}
        {title}
        {credit}
        {nav}
      </header>
    )
  }
}

Header.propTypes = {
  addClasses: PropTypes.oneOfType([ PropTypes.string, PropTypes.array ]),
  credit: PropTypes.string,
  header: PropTypes.string,
  name: PropTypes.string,
  skipBranding: PropTypes.bool,
  skipNav: PropTypes.bool,
  title: PropTypes.string
}

export default Header
