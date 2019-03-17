/* global File */

import React from 'react'
import PropTypes from 'prop-types'
import ReactCrop from 'react-image-crop'

/**
 * This component handles cropping a thumbnail on the client side.
 */

class Thumbnailer extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      crop: {
        aspect: 1,
        width: 50,
        x: 0,
        y: 0
      }
    }

    this.onImageLoaded = this.onImageLoaded.bind(this)
    this.onComplete = this.onComplete.bind(this)
    this.getThumbnail = this.getThumbnail.bind(this)
    this.generateThumbnail = this.generateThumbnail.bind(this)
    this.onChange = this.onChange.bind(this)
  }

  /**
   * This method is called when the image is loaded.
   * @param img {Object} - The image loaded.
   */

  onImageLoaded (img) {
    this.ref = img
  }

  /**
   * This method is called when the user finishes establishing a crop.
   * @param crop {Object} - The crop information.
   * @param pixelCrop {Object} -  Crop information.
   */

  onComplete (crop, pixelCrop) {
    this.getThumbnail(crop, pixelCrop)
  }

  /**
   * This method calls `generateThumbnail` and saves the resulting Blob to the
   * state when it is complete.
   * @param crop {Object} - The crop information.
   * @param pixelCrop {Object} -  Crop information.
   * @returns {Promise<void>} - A promise that resolves when the thumbnail has
   *   been generated and saved to the component state.
   */

  async getThumbnail (crop, pixelCrop) {
    if (this.ref && crop.width && crop.height) {
      const res = await this.generateThumbnail(this.ref, pixelCrop, 'thumbnail.jpg')
      const file = new File([ res.blob ], 'thumbnail.jpg', { type: 'image/jpeg' })
      this.setState({ thumbnail: res.url })
      if (this.props.onChange) this.props.onChange(file)
    }
  }

  /**
   * This method generates a thumbnail.
   * @param img {Object} - The image to thumbnail.
   * @param pixelCrop {Object} - Crop information.
   * @param fileName {string} - The name of the file to use for the thumbnail.
   * @returns {Promise<any>} - A promise that resolves with the Blob of the
   *   thumbnail generated.
   */

  generateThumbnail (img, pixelCrop, fileName) {
    const canvas = document.createElement('canvas')
    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height)

    return new Promise((resolve, reject) => {
      canvas.toBlob(blob => {
        if (blob) {
          blob.name = fileName
          window.URL.revokeObjectURL(this.thumbnailURL)
          this.thumbnailURL = window.URL.createObjectURL(blob)
          resolve({ blob, url: this.thumbnailURL })
        } else {
          reject(new Error('Canvas is empty'))
        }
      }, 'image/jpeg')
    })
  }

  /**
   * This method is called when the crop is changed.
   * @param crop {Object} - The crop information.
   */

  onChange (crop) {
    this.setState({ crop })
  }

  /**
   * The render function
   * @returns {string} - The rendered output.
   */

  render () {
    return (
      <div className='thumbnailer'>
        <label>Thumbnail</label>
        <ReactCrop
          src={this.props.file ? this.props.file : ''}
          crop={this.state.crop}
          onImageLoaded={this.onImageLoaded}
          onComplete={this.onComplete}
          onChange={this.onChange} />
        {this.state.thumbnail && this.state.thumbnail.url && (
          <img src={this.state.thumbnail.url} alt='Thumbnail' className='thumbnail' />
        )}
      </div>
    )
  }
}

Thumbnailer.propTypes = {
  file: PropTypes.string,
  onChange: PropTypes.func
}

export default Thumbnailer
