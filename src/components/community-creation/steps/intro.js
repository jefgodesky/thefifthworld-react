import React from 'react'
import PropTypes from 'prop-types'

/**
 * This component handles the community creation introduction.
 */

export class CommunityCreationIntro extends React.Component {
  /**
   * The render function
   * @returns {string} - The rendered output.
   */

  render () {
    const button = (<p className='actions'><a href='/create-community?begin' className='button'>Begin</a></p>)
    const advance = this.props.js
      ? button
      : (<React.Fragment>
        <p>We highly recommend having JavaScript enabled for this process. You can do it without JavaScript, but you&rsquo;ll have a much harder time. In particular, you&rsquo;ll have to enter some latitude and longitude coordinates throughout, rather than just clicking on a map. If you&rsquo;ve turned JavaScript off, you might want to turn it on for this. If you haven&rsquo;t disabled JavaSCript, something else might have gone wrong to prevent it from working correctly. Try reloading the page &mdash; sometimes that can fix it.</p>
        {button}
      </React.Fragment>)

    return (
      <React.Fragment>
        <p>Stories in the Fifth World &mdash; whether <a href='/stories'>written by a single person</a> or <a href='/rpg'>played out with a group</a> &mdash; center on <a href='/community'>communities</a>. This community creation wizard helps you create a community, working out its history and traditions and the people who make it up.</p>
        <p>To properly <a href='/rpg/principles/heed-the-spirit-of-the-place'>heed the spirit of the place</a>, you&rsquo;ll need to deal with <a href='/place'>places</a> that you know personally and can go spend some time in, so typically you should create a community living in the place where you live. You should not create communities living in places where you don&rsquo;t have much personal experience (unless they lie in areas not much inhabited today, like the shores of the <a href='/arctic-ocean'>Arctic Ocean</a> or <a href='/antarctica'>Antarctica</a>). Leave space open for people who live in those places to tell us what they look like in the Fifth World. This means that you should rarely use this tool.</p>
        {advance}
      </React.Fragment>
    )
  }
}

CommunityCreationIntro.propTypes = {
  js: PropTypes.bool
}

export default CommunityCreationIntro
