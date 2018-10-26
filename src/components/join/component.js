import React from 'react'
import Header from '../header/component'
import Footer from '../footer/component'
import autoBind from 'react-autobind'
import { connect } from 'react-redux'

/**
 * This component handles the form that allows someone to accept an invitation
 * and become a member of the website.
 */

class Join extends React.Component {
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
          <form action='/join' method='post'>
            <label htmlFor='code'>Invitation code</label>
            <input type='text' name='code' id='code' placeholder='Enter your invitation code here&hellip;' />
            <p className='actions'>
              <button>Join</button>
            </p>
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

export default connect(mapStateToProps)(Join)
