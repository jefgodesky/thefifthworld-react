import React from 'react'
import PropTypes from 'prop-types'
import autoBind from 'react-autobind'
import { connect } from 'react-redux'

/**
 * This component handles the create/update form for wiki pages.
 */

class WikiForm extends React.Component {
  constructor (props) {
    super(props)
    autoBind(this)
  }

  /**
   * The render function
   * @returns {string} - The rendered output.
   */

  render () {
    const action = this.props.page ? this.props.page.path : '/new-wiki'
    const buttonText = this.props.page ? 'Save' : 'Create New Wiki Page'
    const cancel = this.props.page ? this.props.page.path : '/dashboard'
    const hidden = [
      <input type='hidden' name='type' value='wiki' key='type' />
    ]

    return (
      <form action={action} method='post' className='wiki'>
        {hidden}
        <label htmlFor='title'>Title</label>
        <input type='text' name='title' id='title' placeholder='What do you want to write about?' />
        <label htmlFor='body'>Body</label>
        <textarea name='body' id='body' />
        <aside className='note'>
          <p>You can format your page using <a href='/wikitext'>wikitext</a>.</p>
        </aside>
        <p className='actions'>
          <button>{buttonText}</button>
          <a href={cancel} className='button secondary'>Cancel</a>
        </p>
      </form>
    )
  }
}

/**
 * Maps Redux state to the component's props.
 * @param state - The state from Redux.
 * @returns {Object} - The component's new props.
 */

const mapStateToProps = state => {
  return {
    page: state.Page
  }
}

WikiForm.propTypes = {
  page: PropTypes.object
}

export default connect(mapStateToProps)(WikiForm)
