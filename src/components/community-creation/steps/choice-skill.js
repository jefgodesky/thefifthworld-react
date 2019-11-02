import React from 'react'
import PropTypes from 'prop-types'

import skills from '../../../data/skills'

/**
 * This component asks about what skill your community encourages.
 */

export default class CommunityCreationChoiceSkill extends React.Component {
  static renderSkills () {
    return skills
      .filter(skill => !skill.discouraged && !skill.rare)
      .map((skill, index) => (<option key={index} value={skill.name}>{skill.name}</option>))
  }

  /**
   * The render function
   * @returns {string} - The rendered output.
   */

  render () {
    return (
      <React.Fragment>
        <h2>What skill do you encourage?</h2>
        <p>Your community encourages a particular skill. Your neighbors all know of your community&rsquo;s achievements in this field and acknowledge your mastery in this regard.</p>
        <form action='/create-community' method='POST'>
          <input type='hidden' name='community' value={this.props.id} />
          <input type='hidden' name='choice' value='skill' />
          <select name='skill'>
            {CommunityCreationChoiceSkill.renderSkills()}
          </select>
          <button>Next</button>
        </form>
      </React.Fragment>
    )
  }
}

CommunityCreationChoiceSkill.propTypes = {
  id: PropTypes.string
}
