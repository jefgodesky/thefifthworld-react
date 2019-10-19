import React from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'

import { get, isPopulatedArray } from '../../../shared/utils'

import Map from '../../map/component'

/**
 * This component handles the part in community creation where you discover a
 * place in your territory.
 */

export default class CommunityCreationPlace extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      lat: undefined,
      lon: undefined,
      loading: undefined,
      name: undefined
    }

    this.handleClick = this.handleClick.bind(this)
    this.next = this.next.bind(this)
  }

  /**
   * Return heading, depending on card.
   * @returns {string|null} - Label if card is supplied, or `null` if it isn't.
   */

  getLabel () {
    const card = this.props && this.props.card && this.props.card.card ? this.props.card.card : null
    switch (card) {
      case 'C10': return 'What sits at the center of your world?'
      case 'D5': return 'Select a place where you go to hunt.'
      case 'D7': return 'Select a place where you have planted a garden.'
      case 'H7': return 'Select a place where your scouts camp.'
      case 'S7': return 'Select a place in your territory where a monument stands.'
      default: return null
    }
  }

  /**
   * Returns description based on card.
   * @returns {null|*} - JSX for description if a card is supplied, or `null`
   *   if it isn't.
   */

  getDesc () {
    const { card } = this.props.card
    switch (card) {
      case 'C10': return (<p>The <strong>axis mundi</strong> marks the center of your world, a place that your social, emotional, psychological, or religious life revolves around. This might not lie within your own territory, but its proximity and presence shapes your life.</p>)
      case 'D5': return (<p>Pick a good <strong>hunting ground</strong> inside your territory. You likely hunt throughout your territory, but everyone knows that this place has particularly abundant game. At the very least, it offers a great starting point to pick up a trail.</p>)
      case 'D7': return (<p>Pick a site for a <strong>garden</strong> inside your territory. You may have several gardens. Perhaps this one stands out as a particularly large or productive one, or perhaps it doesn&rsquo;t really stand out at all. Maybe it provides a completely average example.</p>)
      case 'H7': return (<p>Your community has <a href='/scout'>scouts</a> who spend much of their time apart, roaming the edges of your territory and protecting your territory from encroachment. Pick a site for the <strong>scout&rsquo;s nest</strong> where they sometimes hide and sleep.</p>)
      case 'S7': return (<p>You might pick the site of a <strong>monument</strong> that you think will stand the test of time and call your community&rsquo;s attention even four centuries from now, or you might pick a site that seems ripe with memory where they might commemorate some event that has yet to happen.</p>)
      default: return null
    }
  }

  /**
   * Returns JSX describing how to discover a name.
   * @returns {*} - JSX with description on how to discover a name.
   */

  getNameDesc () {
    return (
      <React.Fragment>
        <p>Every <a href='/place'>place</a> has its own spirit, its own intelligence. It tells a story through the things that happen there. Go there and pay close attention, and you&rsquo;ll feel the place thinking you, singing its song through and all around you. Think of a place inside your community&rsquo;s territory, a place that you know, that resonates with the description below. Think about the way that people (human or otherwise) live there now. Think about how they&rsquo;ve lived there in the past, and the sort of forces that have shaped it through historical and geological time. Think of how it might change as the world moves beyond civilization. What stays the same? There you can begin to hear the place&rsquo;s own story.</p>
        <p>A place&rsquo;s true name condenses this story, like coal into diamond. To know a place means to know its story. For those who know it, the name calls out to that story, to its spirit, to its unique intelligence. It feels like going there. Your community already knows this place when your saga begins. They know its name. What do they call it?</p>
      </React.Fragment>
    )
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

  async next () {
    const { card } = this.props
    const { lat, lon, name } = this.state
    if (lat !== undefined && lon !== undefined) {
      this.setState({ loading: 0 })
      try {
        const res = await axios.post('/create-community', { card, lat, lon, name })
        const url = get(res, 'request.responseURL')
        const match = url ? url.match(/^.*?\/create-community\/\d*$/gm) : null
        if (isPopulatedArray(match)) {
          window.location.href = url
        } else {
          this.setState({ loading: undefined })
        }
      } catch (err) {
        console.error(err)
      }
    }
  }

  /**
   * Function to render the map when JS works.
   * @returns {*} - JSX for the map when JS works.
   */

  renderMap () {
    const { center, isVillage } = this.props

    return (
      <React.Fragment>
        <h2>{this.getLabel()}</h2>
        {this.getDesc()}
        <p>Click on the map where this place lies.</p>
        <div className='map-frame'>
          <Map
            mode='locatePlace'
            center={center}
            radius={isVillage ? 5 : 10}
            onClick={this.handleClick} />
        </div>
        {this.getNameDesc()}
        <p className='actions'>
          <button onClick={this.next}>Next</button>
        </p>
      </React.Fragment>
    )
  }

  /**
   * Function to render the form used when JS fails.
   * @returns {*} - JSX for the form used when JS fails.
   */

  renderManual () {
    const { card, id, isVillage, params } = this.props
    const { error, lat, lon, name, intro } = params

    let latVal = lat ? decodeURIComponent(lat) : ''
    const latError = error && [ 'toofar', 'both', 'lat' ].indexOf(error) > -1
    const latErrorClass = latError ? 'error' : null
    const latErrorText = latError && error !== 'toofar'
      ? (<p className='error'>Sorry, we couldn&rsquo;t parse that as a latitude. You can enter it in a decimal format (like <em>19.692293</em>), or using degrees, minutes, and seconds (like <em>19&deg;41'32.3"N</em>.</p>)
      : null

    let lonVal = lon ? decodeURIComponent(lon) : ''
    const lonError = error && [ 'toofar', 'both', 'lon' ].indexOf(error) > -1
    const lonErrorClass = lonError ? 'error' : null
    const lonErrorText = lonError && error !== 'toofar'
      ? (<p className='error'>Sorry, we couldn&rsquo;t parse that as a longitude. You can enter it in a decimal format (like <em>-98.843654</em>), or using degrees, minutes, and seconds (like <em>98&deg;50'37.2"W</em>.</p>)
      : null

    let nameVal = name ? decodeURIComponent(name) : ''
    const nameError = error && error === 'noname'
    const nameErrorClass = nameError ? 'error' : null
    const nameErrorText = nameError
      ? (<p className='error'>What do they call it?</p>)
      : null

    let introVal = intro ? decodeURIComponent(intro) : ''
    const introError = error && error === 'nointro'
    const introErrorClass = introError ? 'error' : null
    const introErrorText = introError
      ? (<p className='error'>Answer the prompt above.</p>)
      : null

    const tooFarError = error && error === 'toofar'
      ? card && card.card && card.card === 'C10'
        ? (<p className='error'>Your axis mundi might not lie within your community&rsquo;s territory, but if it lies too far away then something closer will become the center of your world. Pick a place within 225 kilometers (less than 140 miles) from the center of your territory. It would take someone in the Fifth World about five days to make such a journey, or ten days to go there and then come home.</p>)
        : isVillage
          ? (<p className='error'>Your community claims a territory of about 78 square kilometers or 30 square miles. Pick a place not much more than 5 kilometers (about 3 miles) from the center of your territory.</p>)
          : (<p className='error'>Your community claims a territory of about 315 square kilometers or 90 square miles. Pick a place not much more than 10 kilometers (about 6 miles) from the center of your territory.</p>)
      : null

    return (
      <React.Fragment>
        <h2>{this.getLabel()}</h2>
        {this.getDesc()}
        <p>Provide latitude and longitude for this place.</p>
        {tooFarError}
        <form action='/create-community' method='POST'>
          <input type='hidden' name='community' value={id} />
          <input type='hidden' name='card' value={card.card} />
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
          <br />
          {this.getNameDesc()}
          <label htmlFor='name' className={nameErrorClass}>Name</label>
          <input
            type='text'
            name='name'
            id='name'
            defaultValue={nameVal}
            className={nameErrorClass} />
          {nameErrorText}
          <label dangerouslySetInnerHTML={{ __html: card.intro }} htmlFor='intro' className={introErrorClass} />
          <textarea id='intro' defaultValue={introVal} name='intro' className={introErrorClass} />
          <p className='note'>We&rsquo;ll use your answer here to create a wiki page for this place, or add to an existing page if it already has one, so you may want to write it with that in mind. You can use <a href='/markdown'>Markdown</a> here.</p>
          {introErrorText}
          <br />
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
    return this.props.js ? this.renderMap() : this.renderManual()
  }
}

CommunityCreationPlace.propTypes = {
  card: PropTypes.object,
  center: PropTypes.array,
  id: PropTypes.string,
  isVillage: PropTypes.bool,
  js: PropTypes.bool,
  params: PropTypes.object
}
