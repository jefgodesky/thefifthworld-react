/* global FileReader */

import React from 'react'
import PropTypes from 'prop-types'
import autoBind from 'react-autobind'
import DragDrop from '../drag-and-drop-upload/component'
import Thumbnailer from '../thumbnailer/component'
import { get } from '../../shared/utils'

/**
 * This component handles the file input for the form.
 */

class FormUpload extends React.Component {
  constructor (props) {
    super(props)
    autoBind(this)

    this.state = {
      isClient: false,
      file: null,
      thumbnail: null,
      type: get(this.props.page, 'type')
    }
  }

  /**
   * This method is called once the component is mounted. This only happens in
   * the browser, so this is where we set any state that applies just to
   * in-browser behavior.
   */

  componentDidMount () {
    this.setState({ isClient: true })
  }

  /**
   * This method is called when a user changes the radio buttons for the type
   * of the page.
   * @param type {String} - The type of the page, either 'File' or 'Art'.
   */

  handleTypeChange (type) {
    this.setState({ type })
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
   * Renders a drag-and-drop area if we're on the client side and the client
   * can handle it. Otherwise, renders a regular file input field.
   * @returns {*} - The JSX for uploading a file.
   */

  renderFileUpload () {
    if (typeof FileReader === 'function' && this.state.isClient) {
      // We can read files and this is the client, so we'll do the fancy
      // client-side stuff.
      return (<DragDrop onDrop={file => this.dropFile(file)} />)
    } else {
      // Either we can't read files or this isn't the client; either way,
      // we can't do the fancy client-side stuff.
      return (
        <React.Fragment>
          <label htmlFor='file'>
            File
            <p className='note'>If you upload a file, this page will describe that file and allow other pages to make use of it.</p>
          </label>
          <input type='file' name='file' id='file' />
        </React.Fragment>
      )
    }
  }

  /**
   * Renders the radio buttons to choose whether an upload is a piece of art
   * or some other type of file.
   * @returns {*} - JSX to render the radio buttons for page type.
   */

  renderTypeSelector () {
    const file = (this.state.type !== 'Art')
      ? (<input type='radio' id='type-file' name='type' value='File' onChange={event => this.handleTypeChange(event.target.value)} defaultChecked />)
      : (<input type='radio' id='type-file' name='type' value='File' onChange={event => this.handleTypeChange(event.target.value)} />)
    const art = (this.state.type === 'Art')
      ? (<input type='radio' id='type-art' name='type' value='Art' onChange={event => this.handleTypeChange(event.target.value)} defaultChecked />)
      : (<input type='radio' id='type-art' name='type' value='Art' onChange={event => this.handleTypeChange(event.target.value)} />)

    return (
      <ul className='radio short'>
        <li>
          {file}
          <label htmlFor='type-file'>File</label>
        </li>
        <li>
          {art}
          <label htmlFor='type-art'>Art</label>
        </li>
      </ul>
    )
  }

  /**
   * Renders the thumbnailer component so that the user can select a thumbnail,
   * if the client is capable of using it.
   * @returns {*} - The JSX for the thumbnailer.
   */

  renderThumbnail () {
    if (this.state.file && this.state.type === 'Art') {
      return (
        <Thumbnailer
          file={this.state.file}
          onChange={thumbnail => this.setState({ thumbnail })} />
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
    return (
      <React.Fragment>
        {this.renderFileUpload()}
        {this.renderTypeSelector()}
        {this.renderThumbnail()}
      </React.Fragment>
    )
  }
}

FormUpload.propTypes = {
  page: PropTypes.object
}

export default FormUpload
