import React from 'react'

/**
 * This component handles the section at the bottom of most pages asking
 * visitors to support us on Patreon.
 */

class PatreonLink extends React.Component {
  render () {
    return (
      <aside className='patreon-link'>
        <p><em>The Fifth World</em> exists thanks to the generosity of our supporters, partners, and friends on Patreon. Would you like to join them and become part of our growing community?</p>
        <p className='actions'><a href='https://www.patreon.com/thefifthworld' className='button'>Support the Fifth World</a></p>
      </aside>
    )
  }
}

export default PatreonLink
