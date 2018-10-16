import React from 'react'
import Header from '../header/component'
import Footer from '../footer/component'
import autoBind from 'react-autobind'
import { connect } from 'react-redux'

/**
 * This component handles the login form.
 */

class MemberLogin extends React.Component {
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
        <main>
          <h2>Login</h2>
          <form action='/login' method='post'>
            <label htmlFor='email'>Email</label>
            <input type='text' name='email' id='email' placeholder='example@test.com' />
            <label htmlFor='passphrase'>Passphrase</label>
            <input type='text' name='passphrase' id='passphrase' placeholder='Whisper your secret passphrase' />
            <button>Log in</button>
          </form>
          <p>Or login with&hellip;</p>
          <ul>
            <li><a href='/login/facebook'>Facebook</a></li>
            <li><a href='/login/twitter'>Twitter</a></li>
            <li><a href='/login/google'>Google</a></li>
          </ul>
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
