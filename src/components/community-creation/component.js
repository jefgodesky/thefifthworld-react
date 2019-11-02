/* global __isClient__ */

import React from 'react'
import PropTypes from 'prop-types'
import RouteParser from 'route-parser'
import autoBind from 'react-autobind'
import { connect } from 'react-redux'
import { escape as SQLEscape } from 'sqlstring'

import * as actions from './actions'
import specialties from '../../data/specialties'
import places from '../../data/places'

import Header from '../header/component'
import Footer from '../footer/component'
import Messages from '../messages/component'

import CommunityCreationIntro from './steps/intro'
import CommunityCreationLocate from './steps/locate'
import CommunityCreationSpecialties from './steps/specialties'
import CommunityCreationSpecialtiesQuestions from './steps/specialties-questions'
import CommunityCreationPlace from './steps/place'
import CommunityCreationChoiceMagic from './steps/choice-magic'
import CommunityCreationChoiceSkill from './steps/choice-skill'

import { alphabetize, get } from '../../shared/utils'
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
   * Render the appropriate step in the wizard, based on what we need to figure
   * out next.
   * @returns {*} - JSX for the body of the next step.
   */

  renderStep () {
    const { location, match, territory, traditions } = this.props
    const { js } = this.state
    const id = get(match, 'params.id')
    const params = location && location.search ? parseParams(location.search) : {}
    const unplotted = territory && territory.places
      ? Object.keys(territory.places).filter(k => territory.places[k] === null)
      : []

    if (!id && !params.begin) {
      return (<CommunityCreationIntro js={js} />)
    } else if (!territory || !territory.center) {
      return (<CommunityCreationLocate js={js} params={params} />)
    } else if (!traditions || !traditions.specialties) {
      const arr = territory && territory.coastal
        ? alphabetize([...specialties.base, ...specialties.coastal])
        : alphabetize(specialties.base)
      if (params.specialties) {
        params.specialties = params.specialties.split(';')
        params.specialties = params.specialties.map(s => decodeURIComponent(s))
      }
      return (<CommunityCreationSpecialties options={arr} params={params} id={id} />)
    } else if (traditions && traditions.specialties && Array.isArray(traditions.specialties)) {
      const answered = traditions.answers ? Object.keys(traditions.answers) : []
      const questions = traditions.specialties.filter(s => answered.indexOf(s) < 0)
      return (<CommunityCreationSpecialtiesQuestions specialty={questions[0]} id={id} />)
    } else if (territory && territory.places && unplotted.length > 0) {
      const { center } = territory
      const { village } = traditions
      const card = unplotted.length > 0
        ? places.filter(p => p.card === unplotted[0]).shift()
        : null
      return (<CommunityCreationPlace card={card} center={center} id={id} isVillage={village} js={js} params={params} />)
    } else if (!traditions.magic) {
      return (<CommunityCreationChoiceMagic id={id} />)
    } else if (!traditions.skill) {
      return (<CommunityCreationChoiceSkill id={id} />)
    } else {
      return (<CommunityCreationIntro js={js} />)
    }
  }

  /**
   * The render function
   * @returns {string} - The rendered output.
   */

  render () {
    const { loggedInMember } = this.props
    return (
      <React.Fragment>
        <Header
          name={loggedInMember ? loggedInMember.name : null}
          title='Create a community' />
        <main className='community-creation'>
          <Messages />
          {this.renderStep()}
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
    territory: CommunityCreation.territory,
    traditions: CommunityCreation.traditions
  }
}

CommunityCreation.propTypes = {
  location: PropTypes.object,
  loggedInMember: PropTypes.object,
  match: PropTypes.object,
  territory: PropTypes.object,
  traditions: PropTypes.object
}

export default connect(mapStateToProps)(CommunityCreation)
