import React from 'react'
import PropTypes from 'prop-types'

import { setCenter, setStep } from '../actions'

import Map from '../../map/component'

/**
 * This component handles the part in community creation where you select where
 * the community's territory lies.
 */

export class CommunityCreationLocate extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      lat: undefined,
      lon: undefined
    }

    this.handleClick = this.handleClick.bind(this)
    this.next = this.next.bind(this)
  }

  /**
   * Click event handler for the map.
   * @param event {Object} - Click event.
   */

  handleClick (event) {
    this.setState({
      lat: event.latlng.lat,
      lon: event.latlng.lng
    })
  }

  /**
   * Called when the user clicks the button to proceed to the next step.
   */

  next () {
    const { lat, lon } = this.state
    if (lat !== undefined && lon !== undefined) {
      this.props.dispatch(setCenter(lat, lon))
      this.props.dispatch(setStep(2))
    }
  }

  /**
   * Function to render the map when JS works.
   * @returns {*} - JSX for the map when JS works.
   */

  renderMap () {
    const { lat, lon } = this.state
    const disableNext = lat === undefined || lon === undefined

    return (
      <React.Fragment>
        <h2>Where does your community dwell?</h2>
        <p>Click on the map where your community dwells. A circle will appear highlighting your approximate territory. When it looks right, click <em>Next</em>, below.</p>
        <div className='map-frame'>
          <Map
            mode='locateCommunity'
            onClick={this.handleClick} />
        </div>
        <p className='actions'>
          <button onClick={this.next} disabled={disableNext}>Next</button>
        </p>
      </React.Fragment>
    )
  }

  /**
   * Function to render the form used when JS fails.
   * @returns {*} - JSX for the form used when JS fails.
   */

  renderManual () {
    const { error, lat, lon } = this.props.params

    let latVal = lat ? decodeURIComponent(lat) : ''
    const latError = error && [ 'both', 'lat' ].indexOf(error) > -1
    const latErrorClass = latError ? 'error' : null
    const latErrorText = latError
      ? (<p className='error'>Sorry, we couldn&rsquo;t parse that as a latitude. You can enter it in a decimal format (like <em>19.692293</em>), or using degrees, minutes, and seconds (like <em>19&deg;41'32.3"N</em>.</p>)
      : null

    let lonVal = lon ? decodeURIComponent(lon) : ''
    const lonError = error && [ 'both', 'lon' ].indexOf(error) > -1
    const lonErrorClass = lonError ? 'error' : null
    const lonErrorText = lonError
      ? (<p className='error'>Sorry, we couldn&rsquo;t parse that as a longitude. You can enter it in a decimal format (like <em>-98.843654</em>), or using degrees, minutes, and seconds (like <em>98&deg;50'37.2"W</em>.</p>)
      : null

    return (
      <React.Fragment>
        <h2>Where does your community dwell?</h2>
        <p>Provide latitude and longitude for a place near the center of your community&rsquo;s territory. Normally, wherever you find yourself right now would make for an excellent place to start.</p>
        <form action='/create-community/1' method='POST'>
          <label htmlFor='lat' className={latErrorClass}>Latitude</label>
          <input
            type='text'
            name='lat'
            id='lat'
            defaultValue={latVal}
            className={latErrorClass} />
          {latErrorText}
          <label htmlFor='lon' className={lonErrorClass}>Longitude</label>
          <input
            type='text'
            name='lon'
            id='lon'
            defaultValue={lonVal}
            className={lonErrorClass} />
          {lonErrorText}
          <button>Next</button>
        </form>
      </React.Fragment>
    )
  }

  /**
   * The render function
   * @returns {string} - The rendered output.
   */

  render () {
    // Temporary BS because this is just a placeholder right now and we're not
    // yet using the props we'll need later.
    if (this.props.dispatch) console.log('has dispatch')

    return this.props.js ? this.renderMap() : this.renderManual()
  }
}

CommunityCreationLocate.propTypes = {
  dispatch: PropTypes.func,
  params: PropTypes.object,
  js: PropTypes.bool
}

export default CommunityCreationLocate
