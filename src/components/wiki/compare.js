import React from 'react'
import PropTypes from 'prop-types'
import autoBind from 'react-autobind'
import { diffWordsWithSpace } from 'diff'
import { connect } from 'react-redux'
import { get, dedupe, formatDate } from '../../shared/utils'
import renderOptions from './options'
import { canWrite } from '../../shared/permissions'

/**
 * This component handles comparing two versions of a wiki page.
 */

export class CompareWiki extends React.Component {
  constructor (props) {
    super(props)
    autoBind(this)

    this.fieldLabels = {
      'title': 'Title',
      'path': 'Path',
      'parent': 'Parent',
      'body': 'Body',
      'permissions': 'Permissions'
    }
  }

  /**
   * Selects the versions to be compared.
   */

  getVersions () {
    const page = this.props.page
    if (page) {
      const raw = {
        a: get(page, 'params.a'),
        b: get(page, 'params.b')
      }
      const aid = raw.a ? parseInt(raw.a) : null
      const bid = raw.b ? parseInt(raw.b) : null
      const a = page && aid ? page.changes.filter(v => v.id === aid).shift() : null
      const b = page && bid ? page.changes.filter(v => v.id === bid).shift() : null
      return {
        before: a.id < b.id ? a : b,
        after: a.id > b.id ? a : b
      }
    } else {
      return null
    }
  }

  /**
   * Generates diff.
   * @param versions {Object} - An object with `before` and `after` properties
   *   specifying the two objects to compare.
   * @returns {Object} - An object with data specifying the differences between
   *   the two objects for each content field.
   */

  getDiff (versions) {
    const { before, after } = versions
    const diff = {}
    const allFields = dedupe([
      ...Object.keys(before.content),
      ...Object.keys(after.content)
    ])

    allFields.forEach(field => {
      if (this.fieldLabels[field]) {
        const beforeVal = before.content[field] ? `${before.content[field]}` : ''
        const afterVal = after.content[field] ? `${after.content[field]}` : ''
        const d = diffWordsWithSpace(beforeVal, afterVal)
        const words = d.map(part => {
          if (part.added) {
            return `<ins>${part.value}</ins>`
          } else if (part.removed) {
            return `<del>${part.value}</del>`
          } else {
            return part.value
          }
        })

        diff[field] = {
          diff: d,
          before: before.content[field],
          after: words.join('')
        }
      }
    })

    return diff
  }

  /**
   * Generates comparison table.
   * @param permissions {Object} - An object defining the permissions that the
   *   currently logged-in member viewing the page has for it.
   * @returns {string} - The rendered comparison table.
   */

  getComparison (permissions) {
    const versions = this.getVersions()
    const rows = []
    const diff = this.getDiff(versions)

    Object.keys(diff).forEach(field => {
      const label = this.fieldLabels[field] ? this.fieldLabels[field] : field
      rows.push(
        <tr key={`${field}-title`}>
          <th colSpan='2'>{label}</th>
        </tr>
      )

      rows.push(
        <tr key={`${field}-comparison`}>
          <td className='before' dangerouslySetInnerHTML={{ __html: diff[field].before }} />
          <td className='after' dangerouslySetInnerHTML={{ __html: diff[field].after }} />
        </tr>
      )
    })

    const beforeEditor = (<a href={`/member/${versions.before.editor.id}`}>{versions.before.editor.name}</a>)
    const beforeTime = (<span dangerouslySetInnerHTML={{ __html: formatDate(new Date(versions.before.timestamp)) }} />)
    const afterEditor = (<a href={`/member/${versions.after.editor.id}`}>{versions.after.editor.name}</a>)
    const afterTime = (<span dangerouslySetInnerHTML={{ __html: formatDate(new Date(versions.after.timestamp)) }} />)
    const afterRollback = versions.after.id !== this.props.page.changes[0].id
      ? (<a href={`${this.props.page.path}/rollback/${versions.after.id}`}>Roll back to this version</a>)
      : (<span className='current-version'>Current version</span>)
    const rollback = permissions.edit
      ? (
        <tr>
          <th><a href={`${this.props.page.path}/rollback/${versions.before.id}`}>Roll back to this version</a></th>
          <th>{afterRollback}</th>
        </tr>
      )
      : null

    return (
      <table className='diff'>
        <thead>
          <tr>
            <th>Version created by {beforeEditor} on {beforeTime}</th>
            <th>Version created by {afterEditor} on {afterTime}</th>
          </tr>
          <tr className='commit-messages'>
            <th>{versions.before.msg}</th>
            <th>{versions.after.msg}</th>
          </tr>
          {rollback}
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>
    )
  }

  /**
   * The render function
   * @returns {string} - The rendered output.
   */

  render () {
    const permissions = {
      edit: canWrite(this.props.loggedInMember, this.props.page)
    }

    const comparison = this.getComparison(permissions)
    const options = renderOptions(this.props.page.path, permissions)

    return (
      <React.Fragment>
        <h1>{this.props.page.title}</h1>
        {comparison}
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

CompareWiki.propTypes = {
  loggedInMember: PropTypes.object,
  page: PropTypes.object
}

export default connect(mapStateToProps)(CompareWiki)
