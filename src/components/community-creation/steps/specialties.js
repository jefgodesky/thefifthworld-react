import React from 'react'
import PropTypes from 'prop-types'
import slugify from '../../../shared/slugify'
import { get, isPopulatedArray } from '../../../shared/utils'

/**
 * This component handles the part in community creation where you select which
 * food sources your communities focuses on.
 */

export default class CommunityCreationSpecialties extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      specialties: []
    }

    this.handleChange = this.handleChange.bind(this)
  }

  /**
   * Called when the component mounts.
   */

  componentDidMount () {
    const specialties = get(this.props, 'params.specialties')
    if (specialties) this.setState({ specialties })
  }

  /**
   * Handles the change event on checkboxes to ensure that only the last four
   * are checked.
   * @param event {Object} - The change event.
   */

  handleChange (event) {
    const specialties = [ ...this.state.specialties, event.target.value ].slice(-4)
    this.setState({ specialties })
  }

  /**
   * Renders JSX for options to present.
   * @returns {null|*} - JSX for options to present.
   */

  renderOptions () {
    const { options } = this.props
    const { specialties } = this.state
    if (isPopulatedArray(options)) {
      return options.map(option => {
        const slug = slugify(option)
        return (
          <li key={slug}>
            <input
              type='checkbox'
              id={`specialty-${slug}`}
              name='specialty'
              value={option}
              checked={specialties.indexOf(option) > -1}
              onChange={this.handleChange} />
            <label htmlFor={`specialty-${slug}`}>
              {option}
            </label>
          </li>
        )
      })
    } else {
      return null
    }
  }

  /**
   * The render function
   * @returns {string} - The rendered output.
   */

  render () {
    const { id, params } = this.props
    const error = params && params.error && params.error === 'toomany'
      ? (<p className='error'>It doesn&rsquo;t really count as a &ldquo;favorite&rdquo; if it includes everything, does it? Pick just four.</p>)
      : null

    return (
      <React.Fragment>
        <h2>What does your community eat?</h2>
        <p>Nearly every community in the Fifth World hunts, gathers, and cultivates to one degree or another an enormous variety of plants, animals, and fungi for food, but they still have their favorites. <a href='/honey'>Honey</a> tops the list for almost everyone, and nearly goes without saying. What else does your family specialize in? You have a reputation when it comes to these food sources as local experts in how to hunt, gather, cultivate, or prepare them. Your neighbors come to you, often offering to trade their specialties for yours. Pick four.</p>
        {error}
        <form action='/create-community' method='POST'>
          <input type='hidden' name='community' value={id} />
          <ul className='options very-short'>
            {this.renderOptions()}
          </ul>
          <p className='actions'>
            <button>Next</button>
          </p>
        </form>
      </React.Fragment>
    )
  }
}

CommunityCreationSpecialties.propTypes = {
  id: PropTypes.string,
  options: PropTypes.array,
  params: PropTypes.object
}
