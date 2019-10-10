import React from 'react'
import PropTypes from 'prop-types'
import slugify from '../../../shared/slugify'
import { isPopulatedArray } from '../../../shared/utils'

/**
 * This component handles the part in community creation where you select which
 * food sources your communities focuses on.
 */

export class CommunityCreationSpecialties extends React.Component {
  /**
   * Renders JSX for options to present.
   * @returns {null|*} - JSX for options to present.
   */

  renderOptions () {
    const { options } = this.props
    if (isPopulatedArray(options)) {
      return options.map(option => {
        const slug = slugify(option)
        return (
          <li key={slug}>
            <input type='checkbox' id={`specialty-${slug}`} name='specialty' />
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
    return (
      <React.Fragment>
        <h2>What does your community eat?</h2>
        <p>Nearly every community in the Fifth World hunts, gathers, and cultivates to one degree or another an enormous variety of plants, animals, and fungi for food, but they still have their favorites. <a href='/honey'>Honey</a> tops the list for almost everyone, and nearly goes without saying. What else does your family specialize in? You have a reputation when it comes to these food sources as local experts in how to hunt, gather, cultivate, or prepare them. Your neighbors come to you, often offering to trade their specialties for yours. Pick four.</p>
        <ul className='options very-short'>
          {this.renderOptions()}
        </ul>
      </React.Fragment>
    )
  }
}

CommunityCreationSpecialties.propTypes = {
  options: PropTypes.array
}

export default CommunityCreationSpecialties
