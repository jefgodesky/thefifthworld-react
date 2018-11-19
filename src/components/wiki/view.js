import React from 'react'
import PropTypes from 'prop-types'
import autoBind from 'react-autobind'
import { connect } from 'react-redux'
import { canWrite } from '../../shared/permissions'
import renderOptions from './options'

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
    const __html = this.props.page.wikitext
    const permissions = {
      edit: canWrite(this.props.loggedInMember, this.props.page)
    }
    const options = renderOptions(this.props.page.path, permissions, 'view')
    return (
      <React.Fragment>
        <h1>{this.props.page.title}</h1>
        <div className='wiki-body' dangerouslySetInnerHTML={{ __html }} />
        {options}
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
    loggedInMember: state.MemberLogin,
    page: state.Page
  }
}

Wiki.propTypes = {
  loggedInMember: PropTypes.object,
  page: PropTypes.object
}

export default connect(mapStateToProps)(Wiki)
