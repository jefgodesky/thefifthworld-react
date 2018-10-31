import React from 'react'
import Header from '../header/component'
import Footer from '../footer/component'
import autoBind from 'react-autobind'
import { connect } from 'react-redux'

/**
 * This component handles the forgot passphrase form.
 */

class ForgotPassphrase extends React.Component {
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
          <h1>Forgot your passphrase?</h1>
          <p>Enter the email address that you use on your Fifth World account, and we&rsquo;ll reset your passphrase to a random string and email it to you. You can then log in with that random string. We strongly recommend that you then update your passphrase to something you&rsquo;ll more easily remember.</p>
          <form action='/forgot-passphrase' method='post'>
            <label htmlFor='email'>Email</label>
            <input type='text' name='email' id='email' placeholder='you@example.com' />
          </form>
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

export default connect(mapStateToProps)(ForgotPassphrase)
