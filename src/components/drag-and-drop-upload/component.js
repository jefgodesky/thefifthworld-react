import React from 'react'
import PropTypes from 'prop-types'

/**
 * This component handles drag-and-drop file uploads.
 */

class DragDrop extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      name: null,
      dragging: false
    }

    this.handleDragIn = this.handleDragIn.bind(this)
    this.handleDragOut = this.handleDragOut.bind(this)
    this.handleDragOver = this.handleDragOver.bind(this)
    this.handleDrop = this.handleDrop.bind(this)
    this.handleSelect = this.handleSelect.bind(this)
  }

  /**
   * This method is called when a file is dragged into the droppable area.
   * @param event {Object} - The event object.
   */

  handleDragIn (event) {
    event.preventDefault()
    event.stopPropagation()

    if (event.dataTransfer.items && event.dataTransfer.items.length > 0) {
      this.setState({ dragging: true })
    }
  }

  /**
   * This method is called when a file is dragged out of the droppable area.
   * @param event {Object} - The event object.
   */

  handleDragOut (event) {
    event.preventDefault()
    event.stopPropagation()
    this.setState({ dragging: false })
  }

  /**
   * This method is called when a file is dragged over the droppable area.
   * @param event {Object} - The event object.
   */

  handleDragOver (event) {
    event.preventDefault()
    event.stopPropagation()
  }

  /**
   * This method is called when a file is dropped into the droppable area.
   * @param event {Object} - The event object.
   */

  handleDrop (event) {
    event.preventDefault()
    event.stopPropagation()

    const file = event.dataTransfer.files[0]
    this.setState({ dragging: false, name: file.name })
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      this.props.onDrop(file)
    }
  }

  /**
   * This method is called when a user selects a file using the file input.
   * @param event {Object} - The event object.
   */

  handleSelect (event) {
    this.props.onDrop(event.target.files[0])
  }

  /**
   * The render function
   * @returns {string} - The rendered output.
   */

  render () {
    const label = this.state.name
      ? (<React.Fragment>Ready to upload <strong>{this.state.name}</strong></React.Fragment>)
      : (<React.Fragment><strong>Choose a file</strong> or drag it here</React.Fragment>)
    const classes = [ 'droppable' ]
    if (this.state.dragging) classes.push('dragging')

    return (
      <div
        className={classes.join(' ')}
        onDragEnter={this.handleDragIn}
        onDragLeave={this.handleDragOut}
        onDragOver={this.handleDragOver}
        onDrop={this.handleDrop}>
        <input type='file' name='file' id='file' onChange={this.handleSelect} />
        <label htmlFor='file'>{label}</label>
      </div>
    )
  }
}

DragDrop.propTypes = {
  onDrop: PropTypes.func
}

export default DragDrop
