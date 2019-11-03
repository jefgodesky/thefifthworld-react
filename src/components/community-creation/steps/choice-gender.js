import React from 'react'
import PropTypes from 'prop-types'

/**
 * This component asks how many genders your community has.
 */

export default class CommunityCreationChoiceGender extends React.Component {
  /**
   * The render function
   * @returns {string} - The rendered output.
   */

  render () {
    return (
      <React.Fragment>
        <h2>How many genders does your community have?</h2>
        <p><a href='/gender'>Gender</a> correlates with certain physical characteristics, but nothing biological could ever completely determine it. Many communities apportion various social, political, and religious obligations by gender, but never in such a way that one gender has more or less power than any other. Nearly every community allows children to identify the gender they belong to when they come of age. Communities differ as to how many genders they have. Most have three, but some have just two, and others have as many as five.</p>
        <form action='/create-community' method='POST'>
          <input type='hidden' name='community' value={this.props.id} />
          <input type='hidden' name='choice' value='genders' />
          <ul className='checkboxes'>
            <li>
              <input type='radio' name='genders' id='two' value='2' />
              <label htmlFor='two'><strong>Two</strong> &mdash; male and female. Other communities consider us rather old-fashioned and traditional.</label>
            </li>
            <li>
              <input type='radio' name='genders' id='three' value='3' defaultChecked />
              <label htmlFor='three'><strong>Three</strong> &mdash; male, female, and a third gender for those who do not fit into either of the first two.</label>
            </li>
            <li>
              <input type='radio' name='genders' id='four' value='4' />
              <label htmlFor='four'><strong>Four</strong> &mdash; roughly what our ancestors might have considered cis men, cis women, trans men, and trans women.</label>
            </li>
            <li>
              <input type='radio' name='genders' id='five' value='5' />
              <label htmlFor='five'><strong>Five</strong> &mdash; roughly what our ancestors might have considered cis men, cis women, trans men, and trans women, plus a fifth, fully non-binary gender.</label>
            </li>
          </ul>
          <button>Next</button>
        </form>
      </React.Fragment>
    )
  }
}

CommunityCreationChoiceGender.propTypes = {
  id: PropTypes.string
}
