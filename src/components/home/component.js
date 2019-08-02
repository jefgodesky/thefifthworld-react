import React from 'react'
import PropTypes from 'prop-types'
import Header from '../header/component'
import Footer from '../footer/component'
import PatreonLink from '../patreon-link/component'
import autoBind from 'react-autobind'
import { connect } from 'react-redux'

/**
 * This component handles the home page.
 */

export class Home extends React.Component {
  constructor (props) {
    super(props)
    autoBind(this)
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
          addClasses={[ 'homepage' ]}
          skipNav />
        <main className='homepage'>
          <section>
            <h1>Humanity thrives beyond civilization.</h1>
            <p><strong>The world has changed.</strong> The ruins of ancient cities lie submerged beneath the swollen seas. Beaches of translucent plastic sand mark new boundaries between land and water. Jungles stretch from the equator to the poles. Herds of elephants trample savannas in Canada and Russia. Tigers prowl the broken, overgrown ruins of London and Beijing. Tribes of hunter-gatherers roam the wilds. Villages cultivate forest gardens. The season of civilization has passed. Humanity has come home to a more-than-human world, but the bonds of kinship that provide them with everything they want or need in this feral future require constant care and attention lest they fray and break &mdash; as they nearly did in the ancient past.</p>
            <p className='actions'>
              <a href='/explore' className='button'>Explore</a>
            </p>
          </section>
          <PatreonLink />
        </main>
        <Footer />
      </React.Fragment>
    )
  }
}

/**
 * Maps Redux state to the component's props.
 * @params state {Object} - The current state.
 * @returns {Object} - The component's new props.
 */

const mapStateToProps = (state) => {
  return {
    loggedInMember: state.MemberLogin
  }
}

Home.propTypes = {
  loggedInMember: PropTypes.object
}

export default connect(mapStateToProps)(Home)
