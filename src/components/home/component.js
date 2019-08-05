import React from 'react'
import PropTypes from 'prop-types'
import Header from '../header/component'
import Footer from '../footer/component'
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
            <h1>Humanity thrives beyond&nbsp;civilization.</h1>
            <p><strong>The world has changed.</strong> The ruins of ancient cities lie submerged beneath the swollen seas. Beaches of translucent plastic sand mark new boundaries between land and water. Jungles stretch from the equator to the poles. Herds of elephants trample savannas in Canada and Russia. Tigers prowl the broken, overgrown ruins of London and Beijing. Tribes of hunter-gatherers roam the wilds. Villages cultivate forest gardens. The season of civilization has passed. Humanity has come home to a more-than-human world, but the bonds of kinship that provide them with everything they want or need in this feral future require constant care and attention lest they fray and break &mdash; as they nearly did in the ancient past.</p>
            <p className='actions'>
              <a href='/explore' className='button'>Begin Exploring</a>
            </p>
          </section>
          <section className='highlight wormwood'>
            <div>
              <h1 className='novel'>Children of Wormwood</h1>
              <blockquote><p>My little brother came into this world with half a skull. He stayed for a day, then left again, taking my mother with him.</p></blockquote>
              <p>For countless generations, the family downstream of Beaver Valley Temple have helped the Vulture Priests contain the nuclear waste locked away within it. But when it begins leaking out and people start dying, they must leave their homeland and travel across the world in search of answers.</p>
              <p className='actions'>
                <a href='/wormwood' className='button'>Read the Novel</a>
              </p>
            </div>
          </section>
          <section>
            <h1 className='project'>An Open&nbsp;Source Shared&nbsp;Universe</h1>
            <p><em>The Fifth World</em> presents an <a href='/about/open-source'>open source</a> <a href='/about/shared-universe'>shared universe</a> &mdash; a vision of a <a href='/about/neotribal'>neotribal</a>, <a href='/about/ecotopian'>ecotopian</a>, <a href='/about/animist-realist'>animist realist</a> future created by a growing community of authors, artists, designers, gamers, and dreamers. We create the setting together here and explore it in <a href='/stories'>stories</a>, <a href='/play'>games</a>, and whatever other media you can imagine. We publish everything on this site under a <a href='http://creativecommons.org/licenses/by-sa/4.0/deed.en_US'>Creative Commons Attribution-ShareAlike license</a>, so not only <em>can</em> you use it for your own creative projects. We can&rsquo;t wait to see what you&rsquo;ll create with it.</p>
            <p className='actions'>
              <a href='/about/membership' className='button'>How to Join</a>
            </p>
          </section>
          <section className='highlight rpg'>
            <div>
              <h1 className='rpg'>Step Into a Feral&nbsp;Future</h1>
              <p>In the Fifth World <a href='/rpg'>tabletop roleplaying game</a>, you and a handful of friends explore what happens to your descendants living beyond civilization in the Fifth World, amongst the familiar places of your own life, transformed by four centuries of change. You&rsquo;ll take on the roles of the members of a family living where you live as they struggle to balance the web of kinship all around them and find the right path into the future. Afterwards, add your stories to the wiki to make them part of the growing history of the Fifth World.</p>
              <p className='actions'>
                <a href='/rpg' className='button'>Get Started</a>
              </p>
            </div>
          </section>
          <section className='newsletter'>
            <p>Sign up to receive our monthly newsletter, featuring stories in and pieces on the Fifth World.</p>
            <form
              action='https://thefifthworld.us19.list-manage.com/subscribe/post?u=16621fb5062428d5db0d4fbe4&amp;id=88efe4bbc2'
              method='post'
              id='mc-embedded-subscribe-form'
              name='mc-embedded-subscribe-form'>
              <input
                type='email'
                name='EMAIL'
                id='mce-EMAIL'
                placeholder='you@example.com' />
              <div style={{ position: 'absolute', left: '-5000px' }} aria-hidden='true'>
                <input type='text' name='b_16621fb5062428d5db0d4fbe4_88efe4bbc2' tabIndex='-1' defaultValue='' />
              </div>
              <input
                type='submit'
                value='Subscribe'
                name='subscribe'
                id='mc-embedded-subscribe'
                className='button' />
            </form>
          </section>
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
