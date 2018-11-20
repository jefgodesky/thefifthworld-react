import React from 'react'
import Header from '../header/component'
import Footer from '../footer/component'
import autoBind from 'react-autobind'

/**
 * This component handles a 404 error page.
 */

class Error401 extends React.Component {
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
          <p>Unauthorized!</p>
        </main>
        <Footer />
      </React.Fragment>
    )
  }
}

export default Error401
