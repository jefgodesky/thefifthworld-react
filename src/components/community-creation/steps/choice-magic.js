import React from 'react'
import PropTypes from 'prop-types'

/**
 * This component asks about the community's relationship to magic.
 */

export default class CommunityCreationChoiceMagic extends React.Component {
  /**
   * The render function
   * @returns {string} - The rendered output.
   */

  render () {
    return (
      <React.Fragment>
        <h2>How do you feel about magic?</h2>
        <p><a href='/magic'>Magic</a> involves the use of rituals, symbols, actions, and gestures to interact with and manipulate non-ordinary reality. Many such non-ordinary realities exist, particularly within our perception, but not every community relates to magic the same way.</p>
        <form action='/create-community' method='POST'>
          <input type='hidden' name='community' value={this.props.id} />
          <input type='hidden' name='choice' value='magic' />
          <ul className='checkboxes'>
            <li>
              <input type='radio' name='magic' id='open' value='open' />
              <label htmlFor='open'>We all have access to magic, to one degree or another. Some people get really good with it, like any other skill, but no one has an exclusive claim to it.</label>
            </li>
            <li>
              <input type='radio' name='magic' id='secret' value='secret' />
              <label htmlFor='secret'>Only special people have access to magic &mdash; people marked by peculiar birth or circumstances, or from particular magical bloodlines.</label>
            </li>
          </ul>
          <button>Next</button>
        </form>
      </React.Fragment>
    )
  }
}

CommunityCreationChoiceMagic.propTypes = {
  id: PropTypes.string
}
