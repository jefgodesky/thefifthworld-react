import React from 'react'
import PropTypes from 'prop-types'
import data from '../data/specialties'

/**
 * This component handles the part in community creation where you answer
 * questions about each of the food sources your community specializes in.
 */

export default class CommunityCreationSpecialtiesQuestions extends React.Component {
  /**
   * The render function
   * @returns {string} - The rendered output.
   */

  render () {
    const { id, specialty } = this.props
    const question = data.questions[specialty] || ''
    const prompt = data.collective.indexOf(specialty) < 0
      ? `have ${specialty.toLowerCase()}`
      : `has ${specialty.toLowerCase()}`

    return (
      <React.Fragment>
        <h2>How {prompt} shaped your community?</h2>
        <p dangerouslySetInnerHTML={{ __html: question }} />
        <p><em>This will appear in a wiki entry for your community, so consider writing it in that voice. You can use <a href='/markdown'>markdown</a> here.</em></p>
        <form action='/create-community' method='POST'>
          <input type='hidden' name='community' value={id} />
          <input type='hidden' name='specialty' value={specialty} />
          <textarea name='response' />
          <p className='actions'>
            <button>Next</button>
          </p>
        </form>
      </React.Fragment>
    )
  }
}

CommunityCreationSpecialtiesQuestions.propTypes = {
  id: PropTypes.string,
  specialty: PropTypes.string
}
