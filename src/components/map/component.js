import React from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import { isPopulatedArray, requestLocation } from '../../shared/utils'
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
      lat: this.props.place ? this.props.place.lat : 0,
      lon: this.props.place ? this.props.place.lon : 0,
      loaded: false,
      zoom: this.props.place ? 14 : 3
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
    this.requestUserLocation()
  }

  /**
   * Ask for the user's location, and if it's provided, zoom the map in on that
   * location.
   * @returns {Promise<void>} - A Promise that updates the component's state,
   *   setting the latitude and longitude to the user's location and setting
   *   the zoom to 12, if the user agrees to share her location.
   */

  async requestUserLocation () {
    if (!this.props.place && navigator && 'geolocation' in navigator) {
      const pos = await requestLocation()
      this.setState({
        lat: pos.coords.latitude,
        lon: pos.coords.longitude,
        zoom: 12
      })
    }
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
    this.setState({ json, loaded: true })
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
    if (isPopulatedArray(json)) {
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
   * Render markers.
   * @param Marker {Component} - The Marker component from the `react-leaflet`
   *   library.
   * @param Popup {Component} - The Popup component from the `react-leaflet`
   *   library.
   * @returns {[]} - JSX for the markers to be displayed on the map.
   */

  renderMarkers (Marker, Popup) {
    const { place, places } = this.props
    if (place && place.lat && place.lon) {
      return (<Marker position={[place.lat, place.lon]} />)
    } else if (isPopulatedArray(places)) {
      const jsx = []
      places.forEach(place => {
        jsx.push(
          <Marker position={[place.lat, place.lon]} key={`${place.lat}x${place.lon}`}>
            <Popup>
              <a href={place.path}>{place.title}</a>
            </Popup>
          </Marker>
        )
      })
      return jsx
    }
  }

  /**
   * Returns JSX to render the map.
   * @param height {string} - Height property to pass to the map.
   * @returns {*} - JSX to render the map.
   */

  renderMap (height) {
    let { lat, lon, zoom } = this.state
    const leaflet = require('react-leaflet')
    const LeafletMap = leaflet.Map
    const { TileLayer, GeoJSON, Marker, Popup } = leaflet
    const sealevel = this.raiseSeaLevel(GeoJSON)
    const markers = this.renderMarkers(Marker, Popup)

    return (
      <LeafletMap
        center={[lat, lon]}
        zoom={zoom}
        minZoom={3}
        maxZoom={15}
        dragging={!this.props.place}
        zoomControl={!this.props.place}
        style={{ height }}>
        <TileLayer
          attribution='Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.'
          url='http://b.tile.stamen.com/terrain-background/{z}/{x}/{y}.png'
          noWrap />
        {sealevel}
        {markers}
      </LeafletMap>
    )
  }

  /**
   * The render function
   * @returns {string} - The rendered output.
   */

  render () {
    if (this.state.isClient) {
      const height = this.props.place ? '300px' : '90vh'
      if (this.state.loaded) {
        return this.renderMap(height)
      } else {
        return (<div className='map loading' style={{ height }} />)
      }
    } else {
      return null
    }
  }
}

Map.propTypes = {
  place: PropTypes.object,
  places: PropTypes.array
}
