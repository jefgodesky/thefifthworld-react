import React from 'react'

/**
 * This component handles interactive maps.
 */

export default class Map extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      isClient: false,
      lat: 0,
      lon: 0,
      zoom: 3
    }
  }

  /**
   * This React lifecycle method is only called by the browser, never during
   * server-side rendering, so this is a useful place to set a flag that will
   * allow us to toggle between base behavior and enhancements (like Leaflet).
   */

  componentDidMount () {
    this.setState({ isClient: true })
  }

  /**
   * The render function
   * @returns {string} - The rendered output.
   */

  render () {
    if (this.state.isClient) {
      const { lat, lon, zoom } = this.state
      const pos = [ lat, lon ]

      const leaflet = require('react-leaflet')
      const LeafletMap = leaflet.Map
      const TileLayer = leaflet.TileLayer

      return (
        <LeafletMap
          center={pos}
          zoom={zoom}
          minZoom={2}
          style={{ width: '100%', height: '90vh' }}>
          <TileLayer
            url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
        </LeafletMap>
      )
    } else {
      return null
    }
  }
}
