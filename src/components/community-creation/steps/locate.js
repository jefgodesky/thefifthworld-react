import React from 'react'
import PropTypes from 'prop-types'

/**
 * This component handles the part in community creation where you select where
 * the community's territory lies.
 */

export class CommunityCreationLocate extends React.Component {
  /**
   * Function to render the form used when JS fails.
   * @returns {*} - JSX for the form used when JS fails.
   */

  renderManual () {
    return (
      <React.Fragment>
        <h2>Where does your community dwell?</h2>
        <p>Provide latitude and longitude for a place near the center of your community&rsquo;s territory. Normally, wherever you find yourself right now would make for an excellent place to start.</p>
        <form action='/create-community/1' method='POST'>
          <label htmlFor='lat'>Latitude</label>
          <input type='text' name='lat' id='lat' />
          <label htmlFor='lon'>Longitude</label>
          <input type='text' name='lon' id='lon' />
          <button>Next</button>
        </form>
      </React.Fragment>
    )
  }

  /**
   * The render function
   * @returns {string} - The rendered output.
   */

  render () {
    // Temporary BS because this is just a placeholder right now and we're not
    // yet using the props we'll need later.
    if (this.props.js) console.log('has js')
    if (this.props.dispatch) console.log(this.props.dispatch)

    const manual = this.renderManual()

    return (
      <React.Fragment>
        {manual}
      </React.Fragment>
    )
  }
}

CommunityCreationLocate.propTypes = {
  dispatch: PropTypes.func,
  js: PropTypes.bool
}

export default CommunityCreationLocate
