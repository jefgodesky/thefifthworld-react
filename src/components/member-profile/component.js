/* global __isClient__ */

import React from 'react'
import PropTypes from 'prop-types'
import RouteParser from 'route-parser'
import Header from '../header/component'
import Footer from '../footer/component'
import Error401 from '../error-401/component'
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
   * @param req {Object} - The request object from Express.
   * @param db {Pool} - A database connection to query.
   * @param store {Object} - A Redux store object.
   */

  static async load (req, db, store) {
    if (!__isClient__ && this.path && req.originalUrl && store.dispatch && (typeof store.dispatch === 'function')) {
      const routeParser = new RouteParser(this.path)
      const params = routeParser.match(req.originalUrl)
      if (params.id) {
        const member = await Member.get(params.id, db)
        store.dispatch(actions.load(member))
      }
    }
  }

  renderForm () {
    return (
      <React.Fragment>
        <Header />
        <main>
          <form method='post' action='/member'>
            <input type='hidden' name='id' value={this.props.member.id} />
            <label htmlFor='name'>Name</label>
            <input type='text' name='name' id='name' defaultValue={this.props.member.name} />
            <label htmlFor='email'>Email</label>
            <input type='text' name='email' id='email' defaultValue={this.props.member.email} />
            <p className='actions'>
              <button>Save</button>
              <a href={`/member/${this.props.member.id}`} className='button secondary'>Cancel</a>
            </p>
          </form>
        </main>
        <Footer />
      </React.Fragment>
    )
  }

  renderProfile () {
    const actions = Member.canEdit(this.props.member, this.props.loggedInMember)
      ? (<p className='actions'><a href={`/member/${this.props.member.id}/edit`} className='button'>Edit Profile</a></p>)
      : (<React.Fragment />)
    return (
      <React.Fragment>
        <Header />
        <main className='profile'>
          <h1>{this.props.member.name}</h1>
          {actions}
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
        if (Member.canEdit(this.props.member, this.props.loggedInMember)) {
          return this.renderForm()
        } else {
          return (<Error401 />)
        }
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
    loggedInMember: state.MemberLogin,
    member: state.MemberProfile
  }
}

MemberProfile.propTypes = {
  loggedInMember: PropTypes.object,
  match: PropTypes.object,
  member: PropTypes.object
}

export default connect(mapStateToProps)(MemberProfile)
