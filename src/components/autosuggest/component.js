import React from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import config from '../../../config'

/**
 * This component handles autocomplete fields.
 *
 * PROPS
 * defaultValue ... (String) The default value to use for the input field.
 * endpoint ....... (String) An endpoint to check for suggestions. This should
 *                  be on the same domain (as indicated by the `root` URL in
 *                  the configuration), and take a single string argument in
 *                  its body, called `str`. It should return a JSON array of
 *                  suggestions matching `str`.
 * id ............. (String) The `id` attribute to be used on the input field,
 *                  as well as the label, tying it to the input field.
 * label .......... (String) The string to use for the label.
 * name ........... (String) The `name` attribute to be used on the input
 *                  field.
 * note ........... (String) If you would like the label to include a note,
 *                  pass it as a string using this prop.
 * onChange ....... (Function) This function is called any time that the field
 *                  value is changed, including both when a user types in a
 *                  value and when a suggestion is selected. The new value is
 *                  passed as an argument.
 * onSuggest ...... (Function) This function is called any time that the list
 *                  of suggestions is changed. The array of suggestions is
 *                  passed as an argument.
 * threshold ...... (Integer) How many characters long should the input be
 *                  before suggestions are requested? For example, if you set
 *                  the threshold to 3, then a user typing `hello` will get
 *                  suggestions for `hel`, but not `he`.
 * transform ...... (Function) This function is passed the array provided by
 *                  the endpoint when suggestions are requested (see `endpoint`
 *                  above). It should return an array of objects, where each
 *                  object contains the following properties:
 *                    `name` .... The name to display for the suggestion. This
 *                                is presented in bold.
 *                    `note` .... A note to display for the suggestion. This is
 *                                for instances where the name and the value
 *                                differ. For example, a suggestion of possible
 *                                parent pages passes the title of each page as
 *                                the name, but the note differs from both the
 *                                name (as it's the path for the page) and the
 *                                value (because it prepends the domain and
 *                                wraps it all in `<code>` tags for better
 *                                presentation).
 *                    `value` ... The value that will be selected if this
 *                                suggestion is used.
 */

class Autocomplete extends React.Component {
  constructor (props) {
    super(props)

    this.field = React.createRef()
    this.state = {
      isClient: false,
      suggestions: []
    }
  }

  /**
   * This method is called when a user clicks on a suggestion. It sets the
   * field value equal to the suggestion's path.
   * @param suggestion {Object} - The suggestion object. It must, at a minimum,
   *   include a `path` property. The parent field value will be set to the
   *   value of that property.
   */

  selectSuggestion (suggestion) {
    this.field.current.value = suggestion.value
    if (this.props.onChange) this.props.onChange(suggestion.value)
    if (this.props.onSuggest) this.props.onSuggest([])
    this.setState({ suggestions: [] })
  }

  /**
   * This method renders the label.
   * @returns {*} - JSX for the label.
   */

  renderLabel () {
    const { id, label, note } = this.props
    if (id && label && note) {
      return (
        <label htmlFor={id}>
          {label}
          <p className='note'>{note}</p>
        </label>
      )
    } else if (id && label) {
      return (
        <label htmlFor={id}>{label}</label>
      )
    } else {
      return null
    }
  }

  /**
   * Renders the suggestions.
   * @returns {*} - JSX for the rendered suggestions.
   */

  renderSuggestions () {
    if (this.state.suggestions.length > 0) {
      const suggestions = this.state.suggestions.map((suggestion, i) => {
        const note = (suggestion.note)
          ? (<p className='note' dangerouslySetInnerHTML={{ __html: suggestion.note }} />)
          : null
        return (
          <li key={i} onClick={() => this.selectSuggestion(suggestion)}>
            <p>{suggestion.name}</p>
            {note}
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
   * This method is called each time the field changes. It dispatches a request
   * to the endpoint to get a list of suggestions for the current state of that
   * field's value.
   * @param value {string} - The value to check.
   * @returns {Promise} - A promise that resolves with the results from the
   *   endpoint.
   */

  async autocomplete (value) {
    if (value.length > 2) {
      const results = await axios.post(`${config.root}${this.props.endpoint}`, { str: value })
      const suggestions = this.props.transform(results.data)
      if (this.props.onSuggest) this.props.onSuggest(suggestions)
      this.setState({ suggestions })
    } else {
      if (this.props.onSuggest) this.props.onSuggest([])
      this.setState({ suggestions: [] })
    }
  }

  /**
   * This method is called when the field is changed. If the value contains
   * characters greater than or equal to the threshold, suggestions for
   * autocompletion are requested. If it does not meet the threshold, then the
   * list of suggestions is reset. In addition, the `onChange` function given
   * in the props is always called.
   * @param value {string} - The current value of the field.
   */

  onChange (value) {
    if (value.length >= this.props.threshold) {
      this.autocomplete(value)
    } else {
      if (this.props.onSuggest) this.props.onSuggest([])
      this.setState({ suggestions: [] })
    }
    if (this.props.onChange && typeof this.props.onChange === 'function') this.props.onChange(value)
  }

  /**
   * The render function
   * @returns {string} - The rendered output.
   */

  render () {
    const label = this.renderLabel()
    const suggestions = this.renderSuggestions()

    return (
      <React.Fragment>
        {label}
        <input
          type='text'
          name={this.props.name}
          id={this.props.id}
          ref={this.field}
          defaultValue={this.props.defaultValue}
          onChange={event => this.onChange(event.target.value)} />
        {suggestions}
      </React.Fragment>
    )
  }
}

Autocomplete.propTypes = {
  defaultValue: PropTypes.string,
  endpoint: PropTypes.string.isRequired,
  id: PropTypes.string,
  label: PropTypes.string,
  name: PropTypes.string,
  note: PropTypes.string,
  onChange: PropTypes.func,
  onSuggest: PropTypes.func,
  threshold: PropTypes.number.isRequired,
  transform: PropTypes.func.isRequired
}

export default Autocomplete
