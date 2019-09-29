import React from 'react'
import PropTypes from 'prop-types'

/**
 * This component handles the part in community creation where you select where
 * the community's territory lies.
 */

export class CommunityCreationLocate extends React.Component {
  /**
   * The render function
   * @returns {string} - The rendered output.
   */

  render () {
    // Temporary BS because this is just a placeholder right now and we're not
    // yet using the props we'll need later.
    if (this.props.js) console.log('has js')
    if (this.props.dispatch) console.log(this.props.dispatch)

    return (
      <React.Fragment>
        <p>Lorem ipsum</p>
      </React.Fragment>
    )
  }
}

CommunityCreationLocate.propTypes = {
  dispatch: PropTypes.func,
  js: PropTypes.bool
}

export default CommunityCreationLocate
