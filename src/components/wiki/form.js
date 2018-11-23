import React from 'react'
import PropTypes from 'prop-types'
import autoBind from 'react-autobind'
import axios from 'axios'
import slugify from '../../shared/slugify'
import { connect } from 'react-redux'
import config from '../../../config'
import { get } from '../../shared/utils'

// const env = process.env.NODE_ENV || 'development'

/**
 * This component handles the create/update form for wiki pages.
 */

class WikiForm extends React.Component {
  constructor (props) {
    super(props)
    autoBind(this)

    this.parentField = React.createRef()
    this.state = {
      isClient: false,
      showPath: true,
      suggestedParents: [],
      title: ''
    }
  }

  /**
   * This method is called once the component is mounted. This only happens in
   * the browser, so this is where we set any state that applies just to
   * in-browser behavior.
   */

  componentDidMount () {
    this.setState({
      isClient: true,
      showPath: false
    })
  }

  /**
   * This method is called each time the parent field changes. It dispatches a
   * request to the `/autocomplete/title` endpoint to get a list of suggestions
   * for the current state of that field's value.
   * @param value {string} - The value to check.
   * @returns {Promise} - A promise that resolves with the results from the
   *   `/autocomplete/title` endpoint.
   */

  async autocomplete (value) {
    if (value.length > 2) {
      const results = await axios.post(`${config.root}/autocomplete/title`, {
        str: value
      })
      this.setState({ suggestedParents: results.data })
    } else {
      this.setState({ suggestedParents: [] })
    }
  }

  /**
   * This method is called when a user clicks on a suggestedd parent. It sets
   * the parent field value equal to the suggestion's path.
   * @param suggestion {Object} - The suggestion object. It must, at a minimum,
   *   include a `path` property. The parent field value will be set to the
   *   value of that property.
   */

  selectSuggestion (suggestion) {
    this.parentField.current.value = suggestion.path
    this.setState({ suggestedParents: [] })
  }

  /**
   * Renders the suggestions offered for the parent.
   * @returns {*} - JSX for the rendered parent suggestions.
   */

  renderSuggestions () {
    if (this.state.suggestedParents.length > 0) {
      const suggestions = this.state.suggestedParents.map(suggestion => {
        return (
          <li key={suggestion.path} onClick={() => this.selectSuggestion(suggestion)}>
            <p>{suggestion.title}</p>
            <p className='note'><code>{config.root}{suggestion.path}</code></p>
          </li>
        )
      })
      return (
        <ul className='autocomplete'>
          {suggestions}
        </ul>
      )
    } else {
      return null
    }
  }

  /**
   * The render function
   * @returns {string} - The rendered output.
   */

  render () {
    const action = this.props.page && this.props.page.path ? this.props.page.path : '/new-wiki'
    const buttonText = action === '/new-wiki' ? 'Create New Wiki Page' : 'Save'
    const cancel = this.props.page ? this.props.page.path : '/dashboard'
    const parent = get(this.parentField, 'current.value')
    const own = slugify(this.state.title)
    const slug = this.props.page && this.props.page.path ? this.props.page.path : parent ? `${parent}/${own}` : `/${own}`
    const suggestions = this.renderSuggestions()
    const body = get(this.props.page, 'curr.body')
    const lineage = this.props.page && this.props.page.lineage && Array.isArray(this.props.page.lineage) ? this.props.page.lineage : []
    const parentObject = lineage.length > 0 ? lineage[0] : null
    const parentPath = parentObject ? parentObject.path : ''
    const parentInstructions = this.state.isClient
      ? 'If so, provide the path for that page here, and we’ll create this page as a child of that one.'
      : 'If so, begin typing the title of that page and select it to make this page a child of that one.'
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
          defaultValue={this.props.page.title}
          onChange={event => this.setState({ title: event.target.value })}
          placeholder='What do you want to write about?' />
        {!this.state.showPath &&
        <p className='note'>
          <strong>Path:</strong> <code>{slug}</code>
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
        <label htmlFor='parent'>
          Parent
          <p className='note'>Should this page belong to a different page? {parentInstructions}</p>
        </label>
        <input
          type='text'
          name='parent'
          id='parent'
          ref={this.parentField}
          defaultValue={parentPath}
          onChange={event => this.autocomplete(event.target.value)} />
        {suggestions}
        <label htmlFor='body'>Body</label>
        <textarea
          name='body'
          id='body'
          defaultValue={body} />
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
