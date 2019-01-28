import React from 'react'
import PropTypes from 'prop-types'
import autoBind from 'react-autobind'
import { connect } from 'react-redux'
import { canWrite } from '../../shared/permissions'
import renderOptions from '../../shared/options'
import { formatDate } from '../../shared/utils'

/**
 * This component handles viewing a page.
 */

export class View extends React.Component {
  constructor (props) {
    super(props)
    autoBind(this)
  }

  /**
   * The render function
   * @returns {string} - The rendered output.
   */

  render () {
    const __html = this.props.page.html
    const permissions = {
      edit: canWrite(this.props.loggedInMember, this.props.page)
    }
    const options = renderOptions(this.props.page.path, permissions, 'view')

    const rollback = this.props.page.version && permissions.edit
      ? (<a href={`${this.props.page.path}/rollback/${this.props.page.version.id}`} className='button'>Roll back to this version</a>)
      : null
    const old = this.props.page.version
      ? (
        <aside>
          <p>This shows an older version of this page, last edited by <a href={`/member/${this.props.page.version.editor.id}`}>{this.props.page.version.editor.name}</a> on <span dangerouslySetInnerHTML={{ __html: formatDate(this.props.page.version.timestamp) }} />.</p>
          <p className='actions'>
            {rollback}
            <a href={this.props.page.path} className='button secondary'>See current version</a>
          </p>
        </aside>
      )
      : null

    return (
      <React.Fragment>
        <h1>{this.props.page.title}</h1>
        {old}
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

View.propTypes = {
  loggedInMember: PropTypes.object,
  page: PropTypes.object
}

export default connect(mapStateToProps)(View)
