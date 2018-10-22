import React from 'react'
import PropTypes from 'prop-types'
import autoBind from 'react-autobind'
import { connect } from 'react-redux'

/**
 * This component handles messages from the server for a logged-in member.
 */

class Messages extends React.Component {
  constructor (props) {
    super(props)
    autoBind(this)
  }

  renderMessages () {
    const messages = []
    Object.keys(this.props.messages).forEach(type => {
      this.props.messages[type].forEach((msg, i) => {
        messages.push(
          <li
            className={type}
            key={`${type}-${i}`}
            dangerouslySetInnerHTML={{ __html: msg }} />
        )
      })
    })
    return messages.length > 0 ? messages : null
  }

  /**
   * The render function
   * @returns {string} - The rendered output.
   */

  render () {
    const messages = this.renderMessages()
    if (messages) {
      return (
        <ul className='messages'>
          {messages}
        </ul>
      )
    } else {
      return null
    }
  }
}

/**
 * Maps Redux state to the component's props.
 * @params state {Object} - The current state.
 * @returns {Object} - The component's new props.
 */

const mapStateToProps = state => {
  const messages = state.Messages

  return {
    messages
  }
}

Messages.propTypes = {
  messages: PropTypes.object
}

export default connect(mapStateToProps)(Messages)
