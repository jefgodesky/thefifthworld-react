/* global __isClient__ */

import React from 'react'
import PropTypes from 'prop-types'
import RouteParser from 'route-parser'
import Header from '../header/component'
import Footer from '../footer/component'
import autoBind from 'react-autobind'
import { connect } from 'react-redux'

import * as actions from './actions'
import Member from '../../server/models/member'

/**
 * This component handles the member profile page.
 */

class MemberProfile extends React.Component {
  constructor (props) {
    super(props)
    autoBind(this)
  }

  /**
   * This is a static function used on the server to load data from the
   * database through the Member model. If a record is found, then an action is
   * dispatched that adds that record to the Redux state.
   * @param route {Object} - The route object that matched the request.
   * @param url {string} - The URL requested.
   * @param db {Pool} - A database connection to query.
   * @param dispatch {function} - The Redux store dispatch function.
   * @returns {Promise} - A promise that will resolve (without any parameters)
   *   when a Member record that matches the request is loaded from the
   *   database and dispatched to the Redux store.
   */

  static load (route, url, db, dispatch) {
    return new Promise((resolve, reject) => {
      if (!__isClient__) {
        if (route && route.path && url) {
          const routeParser = new RouteParser(route.path)
          const params = routeParser.match(url)
          if (params.id) {
            Member.get(params.id, db)
              .then(member => {
                dispatch(actions.load(member))
                resolve()
              })
              .catch(err => {
                console.error(err)
                reject(err)
              })
          } else {
            reject(new Error('No ID specified in parameters'))
          }
        } else {
          reject(new Error('Could not find matching route'))
        }
      } else {
        // This is on the client, so just resolve.
        resolve()
      }
    })
  }

  /**
   * The render function
   * @returns {string} - The rendered output.
   */

  render () {
    return (
      <React.Fragment>
        <Header />
        <main>
          <h2>{this.props.member.name}</h2>
          <p>{this.props.member.email}</p>
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
  return {
    member: state.MemberProfile
  }
}

MemberProfile.propTypes = {
  member: PropTypes.object
}

export default connect(mapStateToProps)(MemberProfile)
