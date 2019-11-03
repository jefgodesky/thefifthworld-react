import React from 'react'
import PropTypes from 'prop-types'

/**
 * This component tells the user we can finally create the community.
 */

export default class CommunityCreationGenerate extends React.Component {
  /**
   * The render function
   * @returns {string} - The rendered output.
   */

  render () {
    return (
      <React.Fragment>
        <h2>We have everything we need&hellip;</h2>
        <p>Next we&rsquo;ll take everything you&rsquo;ve shared and walk through a simulation of the next 144,000 days &mdash; almost 400 years &mdash; to discover the people of your community in the Fifth World. If you don&rsquo;t like it, you can re-run the simulation (it will remember everything you&rsquo;ve already entered, so you won&rsquo;t need to go through all of that again).</p>
        <form action='/create-community' method='POST'>
          <input type='hidden' name='community' value={this.props.id} />
          <input type='hidden' name='generate' value='true' />
          <button>Begin</button>
        </form>
      </React.Fragment>
    )
  }
}

CommunityCreationGenerate.propTypes = {
  id: PropTypes.string
}
