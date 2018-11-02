import React from 'react'
import PropTypes from 'prop-types'
import autoBind from 'react-autobind'
import parse from '../../shared/parse'
import { connect } from 'react-redux'

/**
 * This component handles the member profile page.
 */

class Wiki extends React.Component {
  constructor (props) {
    super(props)
    autoBind(this)
  }

  /**
   * The render function
   * @returns {string} - The rendered output.
   */

  render () {
    const __html = parse(this.props.page.changes[0].content.body)
    return (
      <React.Fragment>
        <h1>{this.props.page.title}</h1>
        <div className='wiki-body' dangerouslySetInnerHTML={{ __html }} />
      </React.Fragment>
    )
  }
}

/**
 * Maps Redux state to the component's props.
 * @param state - The state from Redux.
 * @returns {Object} - The component's new props.
 */

const mapStateToProps = state => {
  return {
    page: state.Page
  }
}

Wiki.propTypes = {
  page: PropTypes.object
}

export default connect(mapStateToProps)(Wiki)
