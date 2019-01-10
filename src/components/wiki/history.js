import React from 'react'
import PropTypes from 'prop-types'
import autoBind from 'react-autobind'
import { connect } from 'react-redux'
import { canWrite } from '../../shared/permissions'
import { formatDate } from '../../shared/utils'

/**
 * This component handles wiki history pages.
 */

export class WikiHistory extends React.Component {
  constructor (props) {
    super(props)
    autoBind(this)
  }

  /**
   * Returns the JSX array to render the rows of changes.
   * @param hasWritePermission {boolean} - `true` if the logged in member has
   *   write permissions for this page (and so should be able to roll back
   *   commits) or `false` if she does not.
   * @returns {Array} - JSX array to render the rows of changes.
   */

  renderChanges (hasWritePermission) {
    const rows = []
    this.props.page.changes.forEach(change => {
      const a = hasWritePermission
        ? (<input type='radio' name='a' value={change.id} />)
        : null
      const b = hasWritePermission
        ? (<input type='radio' name='b' value={change.id} />)
        : null
      rows.push(
        <tr key={change.id}>
          <td>{a}</td>
          <td>{b}</td>
          <td>{change.msg}</td>
          <td>
            <a
              href={`${this.props.page.path}/v/${change.id}`}
              dangerouslySetInnerHTML={{ __html: formatDate(change.timestamp) }} />
          </td>
          <td>
            <a href={`/member/${change.editor.id}`}>{change.editor.name}</a>
          </td>
        </tr>
      )
    })
    return rows
  }

  /**
   * The render function
   * @returns {string} - The rendered output.
   */

  render () {
    const hasWritePermission = canWrite(this.props.loggedInMember, this.props.page)

    const header = (
      <thead>
        <tr>
          <th />
          <th />
          <th>Summary</th>
          <th>Time</th>
          <th>By</th>
        </tr>
      </thead>
    )

    const body = (
      <tbody>
        {this.renderChanges(hasWritePermission)}
      </tbody>
    )

    const wrapping = hasWritePermission
      ? (
        <form action={`${this.props.page.path}/compare`}>
          <table className='history'>
            {header}
            {body}
          </table>
          <button>Compare</button>
        </form>
      )
      : (
        <table className='history'>
          {header}
          {body}
        </table>
      )

    return (
      <React.Fragment>
        <h1>{this.props.page.title}</h1>
        <p className='back'><a href={this.props.page.path} className='button'>&laquo; Back to current page</a></p>
        {wrapping}
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

WikiHistory.propTypes = {
  loggedInMember: PropTypes.object,
  page: PropTypes.object
}

export default connect(mapStateToProps)(WikiHistory)
