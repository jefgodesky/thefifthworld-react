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

    this.el = React.createRef()
    this.state = {
      base: `https://s3.${config.aws.region}.amazonaws.com/${config.aws.bucket}/website/maps`,
      isClient: false,
      json: [],
      lat: this.props.place ? this.props.place.lat : 0,
      lon: this.props.place ? this.props.place.lon : 0,
      loaded: false,
      zoom: this.props.place ? 14 : 3
    }

    this.handleClick = this.handleClick.bind(this)
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
    const { mode, onClick, place } = this.props
    if (!place && navigator && 'geolocation' in navigator) {
      const pos = await requestLocation()
      const { latitude, longitude } = pos.coords
      this.setState({
        lat: latitude,
        lon: longitude,
        zoom: 12
      })

      if (mode === 'locateCommunity') {
        this.setState({
          showTerritory: true
        })
        if (onClick) onClick({ latlng: { lat: latitude, lng: longitude } })
      }
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
   * Event handler for a click on the map.
   * @param event {Object} - The click event.
   */

  handleClick (event) {
    const map = this.el.current

    if (this.props.onClick) this.props.onClick(event)

    if ((map !== null) && (this.props.mode === 'locateCommunity')) {
      this.setState({
        lat: event.latlng.lat,
        lon: event.latlng.lng,
        showTerritory: true,
        zoom: 12
      })
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
   * Renders an approximate territory around a given center. Used in
   * `locateCommunity` mode, in the community creation wizard.
   * @param Circle {Component} - The Circle component from the `react-leaflet`
   *   library.
   * @returns {null|*} - JSX for rendering territory.
   */

  renderTerritory (Circle) {
    const { mode } = this.props
    const { lat, lon, showTerritory } = this.state
    if ((mode === 'locateCommunity') && showTerritory) {
      return (
        <Circle center={[ lat, lon ]} fillColor='#b92e52' color='#b92e52' radius={4828} />
      )
    } else {
      return null
    }
  }

  /**
   * Returns JSX to render the map.
   * @returns {*} - JSX to render the map.
   */

  renderMap () {
    let { lat, lon, zoom } = this.state
    const leaflet = require('react-leaflet')
    const LeafletMap = leaflet.Map
    const { TileLayer, GeoJSON, Marker, Popup, Circle } = leaflet
    const sealevel = this.raiseSeaLevel(GeoJSON)
    const markers = this.renderMarkers(Marker, Popup)
    const territory = this.renderTerritory(Circle)
    const height = this.props.place ? '300px' : '75vh'
    const loading = !this.props.place && !this.state.loaded
      ? (<div className='loading-map'>Melting ice caps&hellip;</div>)
      : null

    return (
      <React.Fragment>
        {loading}
        <LeafletMap
          ref={this.el}
          center={[lat, lon]}
          zoom={zoom}
          minZoom={3}
          maxZoom={15}
          dragging={!this.props.place}
          zoomControl={!this.props.place}
          style={{ height }}
          onClick={this.handleClick}>
          <TileLayer
            attribution='Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.'
            url='http://b.tile.stamen.com/terrain-background/{z}/{x}/{y}.png'
            noWrap />
          {territory}
          {sealevel}
          {markers}
        </LeafletMap>
      </React.Fragment>
    )
  }

  /**
   * The render function
   * @returns {string} - The rendered output.
   */

  render () {
    if (this.state.isClient) {
      return this.renderMap()
    } else {
      return null
    }
  }
}

Map.propTypes = {
  mode: PropTypes.oneOf([ 'locateCommunity' ]),
  onClick: PropTypes.func,
  place: PropTypes.object,
  places: PropTypes.array
}
