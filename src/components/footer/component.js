import React from 'react'
import autoBind from 'react-autobind'
import { connect } from 'react-redux'

/**
 * This component handles the home page.
 */

class Footer extends React.Component {
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
      <footer>
        <nav>
          <ul>
            <li><a href='/explore'>Explore</a></li>
            <li><a href='/stories'>Read</a></li>
            <li><a href='/rpg'>Play</a></li>
          </ul>
        </nav>

        <p className='copyleft'>
          <span className='icons'>
            <img src='https://s3.amazonaws.com/thefifthworld/website/images/cc.svg' alt='Creative Commons' />
            <img src='https://s3.amazonaws.com/thefifthworld/website/images/by.svg' alt='Attribution' />
            <img src='https://s3.amazonaws.com/thefifthworld/website/images/sa.svg' alt='Share-Alike' />
          </span>
          <em>The Fifth World</em> is licensed under a <a href='http://creativecommons.org/licenses/by-sa/4.0/deed.en_US'>Creative Commons Attribution-ShareAlike 4.0 International License</a>.
        </p>
      </footer>
    )
  }
}

/**
 * Maps Redux state to the component's props.
 * @returns {Object} - The component's new props.
 */

const mapStateToProps = () => {
  return {}
}

export default connect(mapStateToProps)(Footer)
