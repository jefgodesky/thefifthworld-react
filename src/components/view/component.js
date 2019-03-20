import React from 'react'
import PropTypes from 'prop-types'
import autoBind from 'react-autobind'
import { connect } from 'react-redux'
import config from '../../../config'
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

    let filesize = '0 B'
    if (this.props.page && this.props.page.file && this.props.page.file.size && this.props.page.file.size < 1000) {
      filesize = `${this.props.page.file.size} B`
    } else if (this.props.page && this.props.page.file && this.props.page.file.size && this.props.page.file.size < 1000000) {
      const kb = this.props.page.file.size / 1000
      filesize = `${Math.round(kb * 10) / 10} kB`
    } else if (this.props.page && this.props.page.file && this.props.page.file.size && this.props.page.file.size < 1000000000) {
      const mb = this.props.page.file.size / 1000000
      filesize = `${Math.round(mb * 10) / 10} MB`
    } else if (this.props.page && this.props.page.file && this.props.page.file.size) {
      const gb = this.props.page.file.size / 1000000000
      filesize = `${Math.round(gb * 10) / 10} GB`
    }

    const file = this.props.page.file && this.props.page.type && (this.props.page.type === 'File')
      ? (
        <a href={`https://s3.${config.aws.region}.amazonaws.com/${config.aws.bucket}/${this.props.page.file.name}`} className='download'>
          <span className='label'>{this.props.page.file.name}</span>
          <span className='details'>{this.props.page.file.mime}; {filesize}</span>
        </a>
      )
      : null

    const art = this.props.page.file && this.props.page.type && (this.props.page.type === 'Art')
      ? (
        <a href={`https://s3.${config.aws.region}.amazonaws.com/${config.aws.bucket}/${this.props.page.file.name}`}>
          <img
            src={`https://s3.${config.aws.region}.amazonaws.com/${config.aws.bucket}/${this.props.page.file.name}`}
            alt={this.props.page.title} />
        </a>
      )
      : null

    return (
      <React.Fragment>
        {art}
        <h1>{this.props.page.title}</h1>
        {old}
        {file}
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
