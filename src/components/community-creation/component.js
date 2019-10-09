/* global __isClient__ */

import React from 'react'
import PropTypes from 'prop-types'
import RouteParser from 'route-parser'
import autoBind from 'react-autobind'
import { connect } from 'react-redux'
import { escape as SQLEscape } from 'sqlstring'

import * as actions from './actions'

import Header from '../header/component'
import Footer from '../footer/component'
import Messages from '../messages/component'

import CommunityCreationIntro from './steps/intro'
import CommunityCreationLocate from './steps/locate'

import { parseParams } from '../../server/utils'

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
   * This is a static function used on the server to load data from the
   * database for the create community page.
   * @param req {Object} - The request object from Express.
   * @param db {Pool} - A database connection to query.
   * @param store {Object} - A Redux store object.
   */

  static async load (req, db, store) {
    if (!__isClient__ && this.path && req.originalUrl && store.dispatch && (typeof store.dispatch === 'function')) {
      const routeParser = new RouteParser(this.path)
      const params = routeParser.match(req.originalUrl)
      if (params.id) {
        const r = await db.run(`SELECT data FROM communities WHERE id = ${SQLEscape(params.id)}`)
        try {
          const c = JSON.parse(r[0].data)
          store.dispatch(actions.load(c))
        } catch (err) {
          console.error(err)
        }
      }
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
    const { dispatch, location, loggedInMember } = this.props
    const { js } = this.state

    let body = null
    const params = location && location.search ? parseParams(location.search) : {}
    const step = params.step ? parseInt(params.step) : this.props.step

    switch (step) {
      case 1: body = (<CommunityCreationLocate js={js} params={params} />); break
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
  location: PropTypes.object,
  loggedInMember: PropTypes.object,
  step: PropTypes.number
}

export default connect(mapStateToProps)(CommunityCreation)
