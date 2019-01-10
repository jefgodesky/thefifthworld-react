import React from 'react'
import Header from '../header/component'
import Footer from '../footer/component'
import autoBind from 'react-autobind'
import { connect } from 'react-redux'

/**
 * This component handles the login form.
 */

export class MemberLogin extends React.Component {
  constructor (props) {
    super(props)
    autoBind(this)
  }

  /**
   * The render function
   * @returns {string} - The rendered output.
   */

  render () {
    return (
      <React.Fragment>
        <Header />
        <main className='login'>
          <h1>Login</h1>
          <form action='/login' method='post'>
            <label htmlFor='email'>Email</label>
            <input type='text' name='email' id='email' placeholder='you@example.com' />
            <label htmlFor='passphrase'>Passphrase</label>
            <input type='text' name='passphrase' id='passphrase' placeholder='Whisper your secret passphrase' />
            <p className='actions'>
              <button>Log in</button>
            </p>
            <p className='actions'>
              <a href='/forgot-passphrase'>Forgot your passphrase?</a>
            </p>
          </form>
          <div className='oauth2-login'>
            <p>Or login with&hellip;</p>
            <ul>
              <li><a href='/login/patreon' className='button patreon'>Patreon</a></li>
              <li><a href='/login/discord' className='button discord'>Discord</a></li>
              <li><a href='/login/google' className='button google'>Google</a></li>
              <li><a href='/login/facebook' className='button facebook'>Facebook</a></li>
              <li><a href='/login/twitter' className='button twitter'>Twitter</a></li>
            </ul>
          </div>
        </main>
        <Footer />
      </React.Fragment>
    )
  }
}

/**
 * Maps Redux state to the component's props.
 * @returns {Object} - The component's new props.
 */

const mapStateToProps = () => {
  return {}
}

export default connect(mapStateToProps)(MemberLogin)
