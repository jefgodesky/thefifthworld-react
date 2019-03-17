import React from 'react'
import PropTypes from 'prop-types'

/**
 * This component handles drag-and-drop file uploads.
 */

class DragDrop extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
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

    this.setState({ dragging: false })
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      this.props.onDrop(event.dataTransfer.files[0])
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
        <label htmlFor='file'><strong>Choose a file</strong> or drag it here</label>
      </div>
    )
  }
}

DragDrop.propTypes = {
  onDrop: PropTypes.func
}

export default DragDrop
