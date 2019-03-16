/* global FileReader */

import React from 'react'
import PropTypes from 'prop-types'
import AwesomeDebouncePromise from 'awesome-debounce-promise'
import autoBind from 'react-autobind'
import axios from 'axios'
import { connect } from 'react-redux'

import Autosuggest from '../autosuggest/component'
import DragDrop from '../drag-and-drop-upload/component'
import FormActions from '../form-actions/component'
import Thumbnailer from '../thumbnailer/component'

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
      error: false
    }

    if (this.props.error && this.props.error.key === 'path') {
      this.state.path = this.props.error.val
      this.state.error = {
        problem: 'dupe',
        path: this.props.error.val
      }
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
          problem: (err.response === undefined) ? 'invalid' : 'dupe',
          path
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
   * Renders the file upload portion of the form.
   * @returns {*} - JSX for the file input.
   */

  renderFileUpload () {
    return (
      <React.Fragment>
        <label htmlFor='file'>
          File
          <p className='note'>If you upload a file, this page will describe that file and allow other pages to make use of it.</p>
        </label>
        <input
          type='file'
          name='file'
          id='file' />
      </React.Fragment>
    )
  }

  /**
   * This method is called by the `DragDrop` component when a file is selected.
   * It extracts the Blob data from the file and saves it to the state.
   * @param file {File} - The file selected by the `DragDrop` component.
   */

  dropFile (file) {
    const reader = new FileReader()
    reader.addEventListener('load', () => {
      this.setState({ file: Object.assign({}, file, { data: reader.result }) })
    }, false)
    reader.readAsDataURL(file)
  }

  /**
   * The render function
   * @returns {string} - The rendered output.
   */

  render () {
    const path = get(this.props, 'page.path')
    const action = path || '/new'
    const body = get(this.props, 'page.curr.body')

    const lineage = this.props.page && this.props.page.lineage && Array.isArray(this.props.page.lineage) ? this.props.page.lineage : []
    const parentObject = lineage.length > 0 ? lineage[0] : null
    const parentPath = parentObject ? parentObject.path : ''
    const parentInstructions = this.state.isClient
      ? 'If so, provide the path for that page here, and we’ll create this page as a child of that one.'
      : 'If so, begin typing the title of that page and select it to make this page a child of that one.'
    const message = this.renderMessageField()

    const errorMessages = {
      dupe: (
        <p className='error'><a href={this.state.error.path} className='path' target='_blank'>{this.state.error.path}</a> already exists. Please choose a different path to make this page unique.</p>
      ),
      invalid: (
        <p className='error'><span className='path'>{this.state.error.path}</span> won&rsquo;t work. Please provide a valid path.</p>
      )
    }

    const error = this.state.error
      ? errorMessages[this.state.error.problem]
      : null

    const fileUpload = this.props.upload || (this.state.type === 'File') || (this.state.type === 'Art')
      ? (typeof FileReader === 'function') && (this.state.isClient === true)
        ? (<DragDrop onDrop={file => this.dropFile(file)} />)
        : this.renderFileUpload()
      : null
    const typeRadioFile = fileUpload && (this.state.type !== 'Art')
      ? (<input type='radio' id='type-file' name='type' value='File' defaultChecked />)
      : (<input type='radio' id='type-file' name='type' value='File' />)
    const typeRadioArt = (this.state.type === 'Art')
      ? (<input type='radio' id='type-art' name='type' value='Art' defaultChecked />)
      : (<input type='radio' id='type-art' name='type' value='Art' />)
    const typeRadio = fileUpload
      ? (
        <React.Fragment>
          <ul className='radio short'>
            <li>
              {typeRadioFile}
              <label htmlFor='type-file'>File</label>
            </li>
            <li>
              {typeRadioArt}
              <label htmlFor='type-art'>Art</label>
            </li>
          </ul>
        </React.Fragment>
      )
      : null

    const thumbnail = this.state.file && (this.state.type === 'Art')
      ? (<Thumbnailer file={this.state.file} onChange={thumbnail => this.setState({ thumbnail })} />)
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
        {!error && !this.state.showPath &&
        <p className='note'>
          <strong>Path:</strong> <code>{this.state.path}</code>
          <a onClick={() => this.setState({ showPath: true })} className='button'>Edit</a>
        </p>
        }
        {(error || this.state.showPath) &&
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
          {error}
        </React.Fragment>
        }
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
        {fileUpload}
        {typeRadio}
        {thumbnail}
        <label htmlFor='body'>Body</label>
        <textarea
          name='body'
          id='body'
          defaultValue={body} />
        <aside className='note'>
          <p>You can format your page using <a href='/markown'>markdown</a>.</p>
        </aside>
        {message}
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
