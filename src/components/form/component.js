/* global FormData */

import React from 'react'
import PropTypes from 'prop-types'
import AwesomeDebouncePromise from 'awesome-debounce-promise'
import autoBind from 'react-autobind'
import axios from 'axios'
import { connect } from 'react-redux'

import Page from '../../shared/models/page'
import Autosuggest from '../autosuggest/component'
import FormActions from '../form-actions/component'
import FormUpload from '../form-upload/component'

import config from '../../../config'
import { isPopulatedArray, get } from '../../shared/utils'
import { parseType } from '../../server/parse/tags'
import { addError, resolveError, getErrorsFor } from '../../components/error/utils'
import slugify from '../../shared/slugify'

/**
 * This component handles the create/update form for wiki pages.
 */

export class Form extends React.Component {
  constructor (props) {
    super(props)
    autoBind(this)

    const description = get(this.props, 'page.description')
    const image = get(this.props, 'page.image') || null
    const header = get(this.props, 'page.header') || null

    this.state = {
      isClient: false,
      isLoading: false,
      hasSetDescription: Boolean(description),
      showPath: true,
      showSuggestions: false,
      file: null,
      thumbnail: null,
      parent: undefined,
      type: get(this.props, 'page.type'),
      path: get(this.props, 'page.path') || this.props.path,
      title: get(this.props, 'page.title') || this.props.title,
      body: get(this.props, 'page.curr.body'),
      message: '',
      description,
      image,
      header,
      errors: this.props.error ? this.props.error.errors : []
    }

    this.debouncedCheckPath = AwesomeDebouncePromise(this.checkPath, 1000)
  }

  /**
   * This method is called once the component is mounted. This only happens in
   * the browser, so this is where we set any state that applies just to
   * in-browser behavior.
   */

  componentDidMount () {
    const lineage = this.props.page && this.props.page.lineage && Array.isArray(this.props.page.lineage) ? this.props.page.lineage : []
    const parentObject = lineage.length > 0 ? lineage[0] : null
    const parent = parentObject ? parentObject.path : this.props.parent

    this.setState({
      isClient: true,
      parent,
      showPath: Boolean(this.props.path)
    })
  }

  /**
   * Resolves all errors in the component state with the given field and code.
   * @param field {string} - The field.
   * @param code {string} - The error code.
   */

  clearError (field, code) {
    this.setState({ errors: resolveError({ field, code }, this.state.errors) })
  }

  /**
   * Checks if a path exists, and sets an error if the path is already in nuse
   * or if the path is invalid.
   * @param path {string} - The path to check
   * @returns {Promise<void>} - A promise that resolves once the path has been
   *   checked and an error has been recorded, if necessary.
   */

  async checkPath (path) {
    const existingPath = this.props.page ? this.props.page.path : null
    if (!this.state.showSuggestions && path !== existingPath) {
      const { protocol, hostname, port } = window.location
      const host = port === undefined ? hostname : `${hostname}:${port}`

      try {
        await axios.get(`${protocol}//${host}${path}`)
        this.setState({ errors: addError({
          field: 'path',
          code: 'ER_DUP_ENTRY',
          value: path
        }, this.state.errors) })
      } catch (err) {
        if (err.response && err.response.status === 404) {
          this.clearError('path', 'ER_DUP_ENTRY')
        } else {
          this.setState({ errors: addError({
            field: 'path',
            code: 'ER_INVALID',
            value: this.state.path
          }, this.state.errors) })
        }
      }
    } else if (path === existingPath) {
      this.clearError('path', 'ER_DUP_ENTRY')
    }
  }

  /**
   * If the given configuration changes would result in an invalid template,
   * this method adds an error to the component state.
   * @param changes {object} - An object with changes being made to the
   *   component state. This is used instead of just checking the state because
   *   we appear to get ahead of the state update sometimes.
   */

  checkValidTemplate (changes) {
    const title = changes.title || this.state.title
    const body = changes.body || this.state.body
    const type = this.state.type || parseType(body)
    if (Page.isReservedTemplate(type, title)) {
      this.setState({ errors: addError({
        field: 'title',
        code: 'ER_RESERVED_TPL',
        value: title
      }, this.state.errors) })
    } else {
      this.clearError('title', 'ER_RESERVED_TPL')
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
          <input
            type='text'
            name='message'
            id='message'
            defaultValue={this.state.message}
            onChange={event => this.setState({ message: event.target.value })} />
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

    const slug = slugify(title)
    const path = this.state.showPath
      ? this.state.path
      : this.state.parent
        ? `${this.state.parent}/${slug}`
        : `/${slug}`
    this.setPath(path)
    this.checkValidTemplate({ title })
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
   * This method is called whenever a user changes the body.
   * @param body {string} - The new body value.
   */

  async changeBody (body) {
    if (this.state.hasSetDescription) {
      this.setState({ body })
    } else {
      const description = await Page.getDescription(body)
      this.setState({ body, description })
    }
    this.checkValidTemplate({ body })
  }

  /**
   * This method is called whenever a user changes the description.
   * @param description {string} - The value of the description field.
   */

  changeDescription (description) {
    this.setState({ description: description.substr(0, 240) })
    if (!this.state.hasSetDescription) this.setState({ hasSetDescription: true })
  }

  /**
   * This method is called whenever a user changes the image meta tag value.
   * @param image {string} - Thee value of the image field.
   */

  changeImage (image) {
    this.setState({ image })
  }

  /**
   * This method is called whenever a user changes the header field.
   * @param header {string} - The value of the header field.
   */

  changeHeader (header) {
    this.setState({ header })
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
   * This method is called when the list of suggestions displayed by the
   * `Autosuggest` component is changed.
   * @param suggestions {Array} - The array of suggestions being displayed by
   *   the `Autosuggest` component.
   */

  changeSuggestions (suggestions) {
    if (suggestions.length > 0) {
      this.setState({ showSuggestions: true })
    } else {
      this.setState({ showSuggestions: false })
    }
  }

  /**
   * This method renders the path portion of the form in its "expanded" state,
   * as when a user edits it directly or when there is an error.
   * @returns {*} - The JSX for the path portion of the form in its "expanded"
   *   state.
   */

  renderExpandedPath () {
    const pathErrors = getErrorsFor('path', this.state.errors)
    const error = pathErrors.length > 0 ? pathErrors[0] : null
    let errMsg = null
    if (error && error.code === 'ER_DUP_ENTRY') {
      errMsg = (
        <p className='error'><a href={error.value} className='path' target='_blank'>{error.value}</a> already exists. Please choose a different path to make this page unique.</p>
      )
    } else if (error && error.code === 'ER_INVALID') {
      errMsg = (
        <p className='error'><span className='path'>{error.value}</span> won&rsquo;t work. Please provide a valid path.</p>
      )
    } else if (error && error.code === 'ER_RESERVED_PATH') {
      errMsg = (
        <p className='error'>We use <span className='path'>{error.value}</span> internally. Please choose a different path.</p>
      )
    }

    return (
      <React.Fragment>
        <label htmlFor='path' className={error ? 'error' : null}>
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
    const { showPath, isClient } = this.state
    const errors = getErrorsFor('path', this.state.errors)
    if (errors.length > 0) {
      return this.renderExpandedPath()
    } else if (!showPath && isClient) {
      return this.renderCollapsedPath()
    } else {
      return this.renderExpandedPath()
    }
  }

  /**
   * Render meta tag options.
   * @returns {*} - JSX to render meta tag options.
   */

  renderMeta () {
    const { description, isClient } = this.state
    const errors = getErrorsFor('description', this.state.errors)
    const descTooLong = errors.filter(err => err.field === 'description' && err.code === 'ER_DATA_TOO_LONG')
    const descTooLongErr = isPopulatedArray(descTooLong)
      ? (
        <p className='note error'>This description goes too long. Can you cut it down to 240 characters or less?</p>
      )
      : null
    const charCount = description && typeof description === 'string' ? description.length : 0
    const charCountLeft = 240 - charCount
    const charCounterLeft = 240 - charCount < 20
      ? (<span className='warning'>({charCountLeft} left)</span>)
      : (<span>({charCountLeft} left)</span>)
    const charCounter = isClient
      ? (
        <p className='char-count'>
          {charCount} characters {charCounterLeft}
        </p>
      )
      : null

    return (
      <aside className='meta'>
        <label htmlFor='description'>
          Description
          <p className='note'>A short description added to the head of the page, used by search engines and other robots. If you don&rsquo;t want to write a description, we&rsquo;ll make one from the first few sentences of the page. If you&rsquo;d like to write your own description, it has to remain shorter than 240 characters.</p>
          {descTooLongErr}
        </label>
        <textarea
          name='description'
          id='description'
          className='description'
          value={this.state.description ? this.state.description : ''}
          onChange={event => this.changeDescription(event.target.value)} />
        {charCounter}
        <label htmlFor='image'>
          Image
          <p className='note'>Image used by social media when you share this page.</p>
        </label>
        <input
          type='text'
          name='image'
          id='image'
          defaultValue={this.state.image ? this.state.image : ''}
          onChange={event => this.changeImage(event.target.value)} />
        <label htmlFor='header'>
          Header
          <p className='note'>Image used across the header of the page. Header images should be 1800&times;500px. If left blank, the default site header will be used.</p>
        </label>
        <input
          type='text'
          name='header'
          id='header'
          defaultValue={this.state.header ? this.state.header : ''}
          onChange={event => this.changeHeader(event.target.value)} />
      </aside>
    )
  }

  /**
   * This method is passed to the `update` prop of the `FormUpload` component
   * to update this component's state when the file or thumbnail are edited.
   * @param data {Object} - An object with a `file` property and a `thumbnail`
   *   property, expected to contain the Blob for those files.
   */

  updateFiles (data) {
    this.setState(data)
  }

  /**
   * This method is called when the form is submitted. It handles client-side
   * form submission. Drag-and-drop files and thumbnailing require files to be
   * stored and manipulated client-side, which means that form submission must
   * also be handled client-side, since the images to submit are not on the
   * server yet.
   * @param event {Object} - The form submission event.
   * @returns {Promise<void>} - A promise that resolves when the form has been
   *   submitted and the window location updated to the new location.
   */

  async handleSubmit (event) {
    event.preventDefault()
    event.stopPropagation()

    if (!this.state.isLoading) {
      this.setState({ isLoading: true })
      const { errors, title, path, parent, body, file, thumbnail, message, description, image, header } = this.state
      const type = this.state.type ? this.state.type : parseType(body)
      const existingPath = get(this.props, 'page.path')
      const action = existingPath || '/new'

      if (!isPopulatedArray(errors)) {
        try {
          const headers = {
            'Content-Type': 'multipart/form-data'
          }

          const data = new FormData()
          const b = body || ''
          data.set('title', title)
          data.set('path', path)
          data.set('parent', parent)
          data.set('type', type)
          data.set('body', b)
          data.set('message', message)
          data.set('description', description)
          data.set('image', image)
          data.set('header', header)
          if (file) data.append('file', file, file.name)
          if (thumbnail) data.append('thumbnail', thumbnail, thumbnail.name)

          const res = await axios.post(action, data, { headers })
          if (res.request.responseURL !== window.location.href) {
            window.location.href = res.request.responseURL
          } else {
            this.setState({ isLoading: false })
          }
        } catch (err) {
          this.setState({ isLoading: false })
          console.error(err)
        }
      }
    }
  }

  /**
   * The render function
   * @returns {string} - The rendered output.
   */

  render () {
    const titleErrors = getErrorsFor('title', this.state.errors)
    const titleError = titleErrors.length > 0 ? titleErrors[0] : null
    const path = get(this.props, 'page.path') || this.props.path
    const action = path || '/new'
    const classes = [ 'wiki' ]
    if (this.state.isLoading) classes.push('loading')

    const parentInstructions = this.state.isClient
      ? 'If so, begin typing the title of that page and select it to make this page a child of that one.'
      : 'If so, provide the path for that page here, and we’ll create this page as a child of that one.'

    const upload = this.props.upload || (this.state.type === 'File') || (this.state.type === 'Art')
      ? (<FormUpload page={this.props.page} update={data => this.updateFiles(data)} />)
      : null

    let errMsg = null
    if (titleError && titleError.code === 'ER_RESERVED_TPL') {
      errMsg = (
        <p className='error'>We use <code>&#123;&#123;{titleError.value}&#125;&#125;</code> internally. You cannot create a template with that name.</p>
      )
    }

    return (
      <form
        action={action}
        method='post'
        className={classes.join(' ')}
        encType='multipart/form-data'
        onSubmit={this.handleSubmit}>
        <label
          className={titleError ? 'error' : null}
          htmlFor='title'>Title</label>
        <input
          type='text'
          name='title'
          id='title'
          defaultValue={this.state.title}
          onChange={event => this.changeTitle(event.target.value)}
          placeholder='What do you want to write about?' />
        {errMsg}
        {this.renderPath()}
        <Autosuggest
          defaultValue={this.state.parent}
          endpoint='/autocomplete/title'
          id='parent'
          label='Parent'
          name='parent'
          note={`Should this page belong to a different page? ${parentInstructions}`}
          onChange={value => this.changeParent(value)}
          onSuggest={suggestions => this.changeSuggestions(suggestions)}
          threshold={3}
          transform={this.transformParentSuggestions} />
        {upload}
        <label htmlFor='body'>Body</label>
        <textarea
          name='body'
          id='body'
          defaultValue={this.state.body}
          onChange={event => this.changeBody(event.target.value)} />
        <p className='instructions'>You can format your page using <a href='/markdown'>markdown</a>.</p>
        {this.renderMeta()}
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
  parent: PropTypes.string,
  path: PropTypes.string,
  title: PropTypes.string,
  upload: PropTypes.bool
}

export default connect(mapStateToProps)(Form)
