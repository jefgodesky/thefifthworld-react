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
   */

  static async load (route, url, db, dispatch) {
    if (!__isClient__ && route && route.path && url) {
      const routeParser = new RouteParser(route.path)
      const params = routeParser.match(url)
      if (params.id) {
        const member = await Member.get(params.id, db)
        dispatch(actions.load(member))
      }
    }
  }

  renderForm () {
    return (
      <React.Fragment>
        <Header />
        <form method='post' action='/member'>
          <input type='hidden' name='id' value={this.props.member.id} />
          <label htmlFor='name'>Name</label>
          <input type='text' name='name' id='name' defaultValue={this.props.member.name} />
          <label htmlFor='email'>Email</label>
          <input type='text' name='email' id='email' defaultValue={this.props.member.email} />
          <button>Save</button>
        </form>
        <Footer />
      </React.Fragment>
    )
  }

  renderProfile () {
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

  /**
   * The render function
   * @returns {string} - The rendered output.
   */

  render () {
    switch (this.props.match.path) {
      case '/member/:id/edit':
        return this.renderForm()
      default:
        return this.renderProfile()
    }
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
  match: PropTypes.object,
  member: PropTypes.object
}

export default connect(mapStateToProps)(MemberProfile)
