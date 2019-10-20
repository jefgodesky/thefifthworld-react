import React from 'react'
import PropTypes from 'prop-types'
import destination from '@turf/destination'
import { isPopulatedArray, requestLocation, clone } from '../../shared/utils'
import { loadCoastlines } from '../../shared/utils.geo'
import config from '../../../config'

/**
 * This component handles interactive maps.
 */

export default class Map extends React.Component {
  constructor (props) {
    super(props)

    const { mode } = this.props
    const showTerritoryModes = [ 'locatePlace' ]
    const showTerritory = showTerritoryModes.indexOf(mode) > -1
    this.el = React.createRef()
    this.state = {
      base: `https://s3.${config.aws.region}.amazonaws.com/${config.aws.bucket}/website/maps`,
      isClient: false,
      json: [],
      lat: this.props.place ? this.props.place.lat : undefined,
      lon: this.props.place ? this.props.place.lon : undefined,
      loaded: false,
      showTerritory,
      zoom: this.props.place || showTerritory ? 14 : 3
    }

    this.handleClick = this.handleClick.bind(this)
  }

  /**
   * This React lifecycle method is only called by the browser, never during
   * server-side rendering, so this is a useful place to set a flag that will
   * allow us to toggle between base behavior and enhancements (like Leaflet).
   */

  componentDidMount () {
    const { mode } = this.props
    const doNotRequestModes = [ 'locatePlace' ]

    this.setState({ isClient: true })
    this.loadGeoJSON()
    if (doNotRequestModes.indexOf(mode) === -1) this.requestUserLocation()
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
    const json = await loadCoastlines()
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
   * Generate bounds for map based on `center` and `radius` props.
   * @returns {null|*[]} - Array to be used for bounds if the instance has
   *   props for `center` and `radius`, or `null` if it doesn't.
   */

  getBounds () {
    const { center, radius } = this.props
    if (center && radius) {
      const coords = clone(center).reverse()
      const dist = radius * 1.25
      const ne = destination(coords, dist, 45)
      const sw = destination(coords, dist, -135)
      return [
        clone(ne.geometry.coordinates).reverse(),
        clone(sw.geometry.coordinates).reverse()
      ]
    } else {
      return null
    }
  }

  /**
   * Event handler for a click on the map.
   * @param event {Object} - The click event.
   */

  handleClick (event) {
    const { mode, onClick } = this.props
    const map = this.el.current

    console.log({ mode, map, event })
    if (onClick) onClick(event)

    if (map !== null) {
      if (mode === 'locateCommunity') {
        this.setState({
          lat: event.latlng.lat,
          lon: event.latlng.lng,
          showTerritory: true,
          zoom: 12
        })
      } else if (mode === 'locatePlace') {
        this.setState({
          lat: event.latlng.lat,
          lon: event.latlng.lng
        })
      }
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
    const { place, places, mode } = this.props
    const { lat, lon } = this.state
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
    } else if (mode === 'locatePlace' && lat && lon) {
      return (<Marker position={[lat, lon]} />)
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
    const { center, mode, radius } = this.props
    const { lat, lon, showTerritory } = this.state
    const modes = [ 'locateCommunity', 'locatePlace' ]
    const r = radius ? radius * 1000 : 4828
    const c = center || [ lat, lon ]

    if (modes.indexOf(mode) > -1 && showTerritory) {
      return (
        <Circle center={c} fillColor='#2eb950' fillOpacity={0.3} color='#2eb950' stroke={false} radius={r} />
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
    const { center } = this.props
    let { lat, lon, zoom } = this.state
    const bounds = this.getBounds()
    const z = bounds ? null : zoom
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
    const c = bounds ? null : center || [ lat, lon ]

    return (
      <React.Fragment>
        {loading}
        <LeafletMap
          ref={this.el}
          center={c}
          bounds={bounds}
          zoom={z}
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
  center: PropTypes.array,
  mode: PropTypes.oneOf([ 'locateCommunity', 'locatePlace' ]),
  onClick: PropTypes.func,
  place: PropTypes.object,
  places: PropTypes.array,
  radius: PropTypes.number
}
