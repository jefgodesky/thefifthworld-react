import React from 'react'
import PropTypes from 'prop-types'
import Map from '../map/component'
import Page from '../../shared/models/page'
import autoBind from 'react-autobind'
import { connect } from 'react-redux'
import axios from 'axios'
import config from '../../../config'
import { canWrite } from '../../shared/permissions'
import renderOptions from '../../shared/options'
import { get, formatDate, getFileSizeStr } from '../../shared/utils'

/**
 * This component handles viewing a page.
 */

export class View extends React.Component {
  constructor (props) {
    super(props)
    autoBind(this)

    const likes = get(this.props, 'page.likes')
    const member = get(this.props, 'loggedInMember.id')
    this.state = {
      likes,
      liked: likes && member && Array.isArray(likes) ? likes.indexOf(member) > -1 : false
    }
  }

  /**
   * This method is called when a user likes the page. Uses optimistic
   * feedback, meaning it shows the "like" as having processed immediately,
   * though it may need to change that if the request comes back with a
   * problem.
   * @param event {Object} - The event object.
   * @returns {Promise<void>} - A Promise that resolves once a call to the
   *   /like endpoint has completed.
   */

  async like (event) {
    event.preventDefault()
    const path = get(this.props, 'page.path')
    const id = get(this.props, 'loggedInMember.id')
    const before = { liked: this.state.liked, likes: this.state.likes }
    if (path) {
      const res = await axios.get(`${path}/like`)
      this.setState({ liked: true, likes: [ ...this.state.likes, id ] })
      if (res.status !== 200) {
        this.setState({ liked: before.liked, likes: before.likes })
      }
    }
  }

  /**
   * This method is called when a user unlikes the page. Uses optimistic
   * feedback, meaning it shows the "unlike" as having processed immediately,
   * though it may need to change that if the request comes back with a
   * problem.
   * @param event {Object} - The event object.
   * @returns {Promise<void>} - A Promise that resolves once a call to the
   *   /unlike endpoint has completed.
   */

  async unlike (event) {
    event.preventDefault()
    const path = get(this.props, 'page.path')
    const id = get(this.props, 'loggedInMember.id')
    const before = { liked: this.state.liked, likes: this.state.likes }
    if (path) {
      const res = await axios.get(`${path}/unlike`)
      this.setState({ liked: false, likes: this.state.likes.filter(like => like !== id) })
      if (res.status !== 200) {
        this.setState({ liked: before.liked, likes: before.likes })
      }
    }
  }

  /**
   * If this is an art page, this method renders the art.
   * @returns {null|*} - Either the JSX to render the art, or null if this is
   *   not an art page.
   */

  renderArt () {
    if (this.props.page.file && this.props.page.type && (this.props.page.type === 'Art')) {
      return (
        <a
          href={`https://s3.${config.aws.region}.amazonaws.com/${config.aws.bucket}/${this.props.page.file.name}`}
          className='art'>
          <img
            src={`https://s3.${config.aws.region}.amazonaws.com/${config.aws.bucket}/${this.props.page.file.name}`}
            alt={this.props.page.title} />
        </a>
      )
    } else {
      return null
    }
  }

  /**
   * If the page is a place, renders a map marking its location.
   * @returns {null|*} - `null` if the page is not a place, or JSX to render
   *   a map indicating where the place is if it is one.
   */

  renderMap () {
    if (this.props.page && this.props.page.type && (this.props.page.type === 'Place')) {
      const place = {
        lat: this.props.page.lat,
        lon: this.props.page.lon
      }
      return (
        <div className='map'>
          <Map place={place} />
        </div>
      )
    } else {
      return null
    }
  }

  /**
   * If this is a file page, this method renders the file.
   * @returns {null|*} - Either the JSX to render the file, or null if this is
   *   not a file page.
   */

  renderFile () {
    if (this.props.page.file && this.props.page.type && (this.props.page.type === 'File')) {
      const filesize = this.props.page && this.props.page.file && this.props.page.file.size
        ? getFileSizeStr(this.props.page.file.size)
        : '0 B'
      return (
        <a href={`https://s3.${config.aws.region}.amazonaws.com/${config.aws.bucket}/${this.props.page.file.name}`} className='download'>
          <span className='label'>{this.props.page.file.name}</span>
          <span className='details'>{this.props.page.file.mime}; {filesize}</span>
        </a>
      )
    } else {
      return null
    }
  }

  /**
   * If this is an older version of the page, this method renders a notice to
   * that effect.
   * @returns {null|*} - Either the JSX to render the notice, or null if this
   *   is not an older version of the page.
   */

  renderOld (permissions) {
    if (this.props.page.version) {
      const rollback = this.props.page.version && permissions.edit
        ? (<a href={`${this.props.page.path}/rollback/${this.props.page.version.id}`} className='button'>Roll back to this version</a>)
        : null
      return (
        <aside>
          <p>This shows an older version of this page, last edited by <a href={`/member/${this.props.page.version.editor.id}`}>{this.props.page.version.editor.name}</a> on <span dangerouslySetInnerHTML={{ __html: formatDate(this.props.page.version.timestamp) }} />.</p>
          <p className='actions'>
            {rollback}
            <a href={this.props.page.path} className='button secondary'>See current version</a>
          </p>
        </aside>
      )
    } else {
      return null
    }
  }

  /**
   * Renders the options to like or unlike the page, and how many people have
   * liked it.
   * @returns {null|*} - The JSX for the like/unlike options, or null if the
   *   person viewing the page is not a logged-in member.
   */

  renderLike () {
    if (this.props.loggedInMember) {
      const path = get(this.props, 'page.path')
      const action = this.state.liked
        ? (<a href={path + '/unlike'} onClick={this.unlike}>Unlike</a>)
        : (<a href={path + '/like'} onClick={this.like}>Like</a>)
      const count = this.state.likes.length === 1
        ? `1 like`
        : `${this.state.likes.length} likes`
      return (
        <React.Fragment>
          <p className='likes'>
            {action}
            {count}
          </p>
        </React.Fragment>
      )
    } else {
      return null
    }
  }

  /**
   * The render function
   * @returns {string} - The rendered output.
   */

  render () {
    const { loggedInMember, page } = this.props
    const par = Page.getParent(page)
    const chapter = page && page.curr && page.curr.body
      ? Page.getTag(page.curr.body, 'Chapter', true)
      : undefined
    const __html = page.type === 'Chapter' && par.type === 'Novel'
      ? chapter
        ? `<h1>${chapter}. ${page.title}</h1>\n${page.html}`
        : `<h1>${page.title}</h1>\n${page.html}`
      : page.html
    const permissions = {
      edit: canWrite(loggedInMember, page)
    }

    return (
      <React.Fragment>
        {this.renderArt()}
        {this.renderMap()}
        {this.renderOld(permissions)}
        {this.renderFile()}
        <div className='wiki-body' dangerouslySetInnerHTML={{ __html }} />
        {this.renderLike()}
        {renderOptions(page.path, permissions, 'view')}
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
