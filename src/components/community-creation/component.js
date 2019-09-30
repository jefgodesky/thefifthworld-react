import React from 'react'
import PropTypes from 'prop-types'
import Header from '../header/component'
import Footer from '../footer/component'
import Messages from '../messages/component'

import CommunityCreationIntro from './steps/intro'
import CommunityCreationLocate from './steps/locate'

import autoBind from 'react-autobind'
import { connect } from 'react-redux'
import { get } from '../../shared/utils'

/**
 * This component handles the community creation page.
 */

export class CommunityCreation extends React.Component {
  constructor (props) {
    super(props)
    autoBind(this)

    this.state = {
      js: false
    }
  }

  /**
   * Called when the component mounts. This is not used in server-side
   * rendering, only on the client, so we can use this to know if JS is
   * working as expected.
   */
  componentDidMount () {
    this.setState({ js: true })
  }

  /**
   * The render function
   * @returns {string} - The rendered output.
   */

  render () {
    const { dispatch, loggedInMember, match, step } = this.props
    const { js } = this.state
    const param = get(match, 'params.step') || 0
    const curr = Math.max(step, param)

    let body = null
    switch (curr) {
      case 1: body = (<CommunityCreationLocate dispatch={dispatch} js={js} />); break
      default: body = (<CommunityCreationIntro dispatch={dispatch} js={js} />); break
    }

    return (
      <React.Fragment>
        <Header
          name={loggedInMember ? loggedInMember.name : null}
          title='Create a community' />
        <main className='community-creation'>
          <Messages />
          {body}
        </main>
        <Footer />
      </React.Fragment>
    )
  }
}

/**
 * Maps Redux state to the component's props.
 * @param state - The state from Redux.
 * @returns {Object} - The component's new props.
 */

const mapStateToProps = state => {
  const { CommunityCreation } = state
  return {
    loggedInMember: state.MemberLogin,
    step: CommunityCreation.step
  }
}

CommunityCreation.propTypes = {
  dispatch: PropTypes.func,
  loggedInMember: PropTypes.object,
  match: PropTypes.object,
  step: PropTypes.number
}

export default connect(mapStateToProps)(CommunityCreation)
