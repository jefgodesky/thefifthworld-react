import React from 'react'
import axios from 'axios'
import config from '../../../config'

/**
 * This component handles interactive maps.
 */

export default class Map extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      base: `https://s3.${config.aws.region}.amazonaws.com/${config.aws.bucket}/website/maps`,
      isClient: false,
      json: [],
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
    this.loadGeoJSON()
  }

  /**
   * Loads GeoJSON data.
   * @returns {Promise<void>} - A promise that resolves when the necessary
   *   GeoJSON data has been loaded into the state.
   */

  async loadGeoJSON () {
    const { base } = this.state
    const json = []
    for (let i = 1; i <= 54; i++) {
      const res = await axios.get(`${base}/5_json/ShapesNew_${i}.geojson`)
      json[i] = res.data
    }
    this.setState({ json })
  }

  /**
   * Returns a JSX array of GeoJSON components loaded with the data necessary
   * to raise the sea level by 216 feet (the amount expected if all the ice
   * caps melt).
   * @param GeoJSON {Component} - The GeoJSON component from the
   *   `react-leaflet` library.
   * @returns {null|[]} - Either null if the needed GeoJSON data has not been
   *   loaded yet, or an array of JSX GeoJSON components ready for rendering.
   */

  raiseSeaLevel (GeoJSON) {
    const { json } = this.state
    if (json && Array.isArray(json) && json.length > 0) {
      const jsx = []
      json.forEach((data, index) => {
        jsx.push(
          <GeoJSON
            data={data}
            key={index}
            style={{ color: '#96B1CA', weight: 0, fillOpacity: 1.0 }} />
        )
      })
      return jsx
    } else {
      return null
    }
  }

  /**
   * The render function
   * @returns {string} - The rendered output.
   */

  render () {
    if (this.state.isClient) {
      const { lat, lon, zoom } = this.state
      const leaflet = require('react-leaflet')
      const LeafletMap = leaflet.Map
      const TileLayer = leaflet.TileLayer
      const GeoJSON = leaflet.GeoJSON
      const sealevel = this.raiseSeaLevel(GeoJSON)

      return (
        <LeafletMap
          center={[lat, lon]}
          zoom={zoom}
          minZoom={3}
          maxZoom={15}
          style={{ width: '100%', height: '90vh' }}>
          <TileLayer
            attribution='Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.'
            url='http://b.tile.stamen.com/terrain-background/{z}/{x}/{y}.png' />
          {sealevel}
        </LeafletMap>
      )
    } else {
      return null
    }
  }
}
