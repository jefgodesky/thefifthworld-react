import React from 'react'
import PropTypes from 'prop-types'
import AwesomeDebouncePromise from 'awesome-debounce-promise'
import autoBind from 'react-autobind'
import axios from 'axios'
import { connect } from 'react-redux'

import Autosuggest from '../autosuggest/component'
import FormActions from '../form-actions/component'
import FormUpload from '../form-upload/component'

import config from '../../../config'
import { get } from '../../shared/utils'
import slugify from '../../shared/slugify'

/**
 * This component handles the create/update form for wiki pages.
 */

export class Form extends React.Component {
  constructor (props) {
    super(props)
    autoBind(this)

    this.state = {
      isClient: false,
      showPath: true,
      file: null,
      thumbnail: null,
      parent: null,
      type: get(this.props, 'page.type'),
      path: get(this.props, 'page.path'),
      title: get(this.props, 'page.title'),
      body: get(this.props, 'page.curr.body'),
      error: this.props.error
    }

    this.debouncedCheckPath = AwesomeDebouncePromise(this.checkPath, 1000)
  }

  /**
   * This method is called once the component is mounted. This only happens in
   * the browser, so this is where we set any state that applies just to
   * in-browser behavior.
   */

  componentDidMount () {
    this.setState({
      isClient: true,
      showPath: false
    })
  }

  /**
   * Checks if a path exists, and sets an error if the path is already in nuse
   * or if the path is invalid.
   * @param path {string} - The path to check
   * @returns {Promise<void>} - A promise that resolves once the path has been
   *   checked and an error has been recorded, if necessary.
   */

  async checkPath (path) {
    const { protocol, hostname, port } = window.location
    const host = port === undefined ? hostname : `${hostname}:${port}`

    try {
      await axios.get(`${protocol}//${host}${path}`)
      const error = {
        problem: 'dupe',
        path
      }
      if (this.state.path && this.state.path !== '/') this.setState({ error })
    } catch (err) {
      const error = (err.response && err.response.status === 404)
        ? false
        : {
          field: 'path',
          code: 'ER_INVALID',
          value: this.state.path
        }
      this.setState({ error })
    }
  }

  /**
   * Sets the path on the form.
   * @param path {string} - The path to set.
   */

  setPath (path) {
    this.debouncedCheckPath(path)
    this.setState({ path })
  }

  /**
   * Renders the commit message field.
   * @returns {Object} - JSX to render the commit message field.
   */

  renderMessageField () {
    if (this.props.page && this.props.page.path) {
      return (
        <React.Fragment>
          <label htmlFor='message'>
            Message
            <p className='note'>Briefly describe the change you’ve made.</p>
          </label>
          <input type='text' name='message' id='message' />
        </React.Fragment>
      )
    } else {
      return (
        <input type='hidden' name='msg' value='Initial text' />
      )
    }
  }

  /**
   * This method is called whenever a user changes the title in the form.
   * @param title {string} - The new title.
   */

  changeTitle (title) {
    this.setState({ title })

    const path = this.state.showPath
      ? this.state.path
      : `${this.state.parent}/${slugify(title)}`
    this.setPath(path)
  }

  /**
   * This method is called whenever a user changes the parent field in the
   * form.
   * @param parent {string} - The new parent value.
   */

  changeParent (parent) {
    this.setState({ parent })
    const path = this.state.showPath
      ? this.state.path
      : `${parent}/${slugify(this.state.title)}`
    this.setPath(path)
  }

  /**
   * Transforms an array returned from an endpoint listing possible matching
   * pages into an array suitable for the Autocomplete component.
   * @param results {Array} - An array of objects to be transformed. It is
   *   expected that these objects will have `title` and `path` properties.
   * @returns {Array} - An array of objects, each with a `name` property equal
   *   to the `title` of the corresponding object in the original array, a
   *   `note` property equal to an HTML string including the `path` property
   *   of the corresponding object in the original array, and a `value`
   *   property equal to the `path` property of the corresponding object in the
   *   original array.
   */

  transformParentSuggestions (results) {
    return results.map(res => {
      return {
        name: res.title,
        note: `<code>${config.root}${res.path}</code>`,
        value: res.path
      }
    })
  }

  /**
   * This method renders the path portion of the form in its "expanded" state,
   * as when a user edits it directly or when there is an error.
   * @returns {*} - The JSX for the path portion of the form in its "expanded"
   *   state.
   */

  renderExpandedPath () {
    const { error } = this.state

    let errMsg = null
    if (error && error.field === 'path' && error.code === 'ER_DUP_ENTRY') {
      errMsg = (
        <p className='error'><a href={error.value} className='path' target='_blank'>{error.value}</a> already exists. Please choose a different path to make this page unique.</p>
      )
    } else if (error && error.field === 'path' && error.code === 'ER_INVALID') {
      errMsg = (
        <p className='error'><span className='path'>{error.value}</span> won&rsquo;t work. Please provide a valid path.</p>
      )
    }

    return (
      <React.Fragment>
        <label htmlFor='path' className={error && error.field === 'path' ? 'error' : null}>
          Path
          <p className='note'>This sets the page&rsquo;s URL. If left blank, it will default to
            a &ldquo;slugified&rdquo; version of the title (e.g., &rdquo;New Page&rdquo; will
            become <code>/new-page</code>)</p>
        </label>
        <input
          type='text'
          name='path'
          id='path'
          onChange={event => this.setPath(event.target.value)}
          placeholder='/example'
          defaultValue={this.state.path} />
        {errMsg}
      </React.Fragment>
    )
  }

  /**
   * This method renders the path portion of the form when it is "collapsed."
   * @returns {*} - The JSX for the path portion of the form in its "collapsed"
   *   state.
   */

  renderCollapsedPath () {
    return (
      <p className='note'>
        <strong>Path:</strong> <code>{this.state.path}</code>
        <a onClick={() => this.setState({ showPath: true })} className='button'>Edit</a>
      </p>
    )
  }

  /**
   * This method renders the path portion of the form.
   * @returns {*} - The JSX for the path portion of the form.
   */

  renderPath () {
    const { error, showPath, isClient } = this.state
    if (error && error.field === 'path') {
      return this.renderExpandedPath()
    } else if (!showPath && isClient) {
      return this.renderCollapsedPath()
    } else {
      return this.renderExpandedPath()
    }
  }

  /**
   * The render function
   * @returns {string} - The rendered output.
   */

  render () {
    const path = get(this.props, 'page.path')
    const action = path || '/new'

    const lineage = this.props.page && this.props.page.lineage && Array.isArray(this.props.page.lineage) ? this.props.page.lineage : []
    const parentObject = lineage.length > 0 ? lineage[0] : null
    const parentPath = parentObject ? parentObject.path : ''
    const parentInstructions = this.state.isClient
      ? 'If so, provide the path for that page here, and we’ll create this page as a child of that one.'
      : 'If so, begin typing the title of that page and select it to make this page a child of that one.'

    const upload = this.props.upload || (this.state.type === 'File') || (this.state.type === 'Art')
      ? (<FormUpload page={this.props.page} />)
      : null

    return (
      <form action={action} method='post' className='wiki' encType='multipart/form-data'>
        <label htmlFor='title'>Title</label>
        <input
          type='text'
          name='title'
          id='title'
          defaultValue={get(this.props, 'page.title')}
          onChange={event => this.changeTitle(event.target.value)}
          placeholder='What do you want to write about?' />
        {this.renderPath()}
        <Autosuggest
          defaultValue={parentPath}
          endpoint='/autocomplete/title'
          id='parent'
          label='Parent'
          name='parent'
          note={`Should this page belong to a different page? ${parentInstructions}`}
          onChange={value => this.changeParent(value)}
          threshold={3}
          transform={this.transformParentSuggestions} />
        {upload}
        <label htmlFor='body'>Body</label>
        <textarea
          name='body'
          id='body'
          defaultValue={this.state.body}
          onChange={event => this.setState({ body: event.target.value })} />
        <aside className='note'>
          <p>You can format your page using <a href='/markown'>markdown</a>.</p>
        </aside>
        {this.renderMessageField()}
        <FormActions
          loggedInMember={this.props.loggedInMember}
          page={this.props.page} />
      </form>
    )
  }
}

/**
 * Maps Redux state to the component's props.
 * @param state {Object} - The state from Redux.
 * @param own {Object} - The component's own props.
 * @returns {Object} - The component's new props.
 */

const mapStateToProps = (state, own) => {
  return {
    error: state.Error,
    loggedInMember: state.MemberLogin,
    page: state.Page,
    upload: own.upload || false
  }
}

Form.propTypes = {
  error: PropTypes.object,
  loggedInMember: PropTypes.object,
  page: PropTypes.object,
  upload: PropTypes.bool
}

export default connect(mapStateToProps)(Form)
