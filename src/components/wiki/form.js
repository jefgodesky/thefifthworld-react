import React from 'react'
import PropTypes from 'prop-types'
import autoBind from 'react-autobind'
import slugify from '../../shared/slugify'
import { connect } from 'react-redux'

/**
 * This component handles the create/update form for wiki pages.
 */

class WikiForm extends React.Component {
  constructor (props) {
    super(props)
    autoBind(this)
    this.state = {
      showPath: true,
      title: ''
    }
  }

  /**
   * This method is called once the component is mounted. This only happens in
   * the browser, so this is where we set any state that applies just to
   * in-browser behavior.
   */

  componentDidMount () {
    this.setState({ showPath: false })
  }

  /**
   * The render function
   * @returns {string} - The rendered output.
   */

  render () {
    const action = this.props.page ? this.props.page.path : '/new-wiki'
    const buttonText = this.props.page ? 'Save' : 'Create New Wiki Page'
    const cancel = this.props.page ? this.props.page.path : '/dashboard'
    const slug = `/${slugify(this.state.title)}`
    const hidden = [
      <input type='hidden' name='type' value='wiki' key='type' />
    ]

    return (
      <form action={action} method='post' className='wiki'>
        {hidden}
        <label htmlFor='title'>Title</label>
        <input
          type='text'
          name='title'
          id='title'
          onChange={event => this.setState({ title: event.target.value })}
          placeholder='What do you want to write about?' />
        {!this.state.showPath &&
        <p className='note'>
          <strong>Path:</strong>
          <code>{slug}</code>
          <a onClick={() => this.setState({ showPath: true })} className='button'>Edit</a>
        </p>
        }
        {this.state.showPath &&
        <React.Fragment>
          <label htmlFor='path'>
            Path
            <p className='note'>This sets the page&rsquo;s URL. If left blank, it will default to
              a &ldquo;slugified&rdquo; version of the title (e.g., &rdquo;New Page&rdquo; will
              become <code>/new-page</code>)</p>
          </label>
          <input
            type='text'
            name='path'
            id='path'
            placeholder='/example'
            defaultValue={slug} />
        </React.Fragment>
        }
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
