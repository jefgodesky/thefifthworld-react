import React from 'react'
import PropTypes from 'prop-types'
import autoBind from 'react-autobind'
import { connect } from 'react-redux'
import { get } from '../../shared/utils'

/**
 * This component handles the buttons displayed on a form.
 */

export class FormActions extends React.Component {
  constructor (props) {
    super(props)
    autoBind(this)
  }

  /**
   * The render function
   * @returns {string} - The rendered output.
   */

  render () {
    const path = get(this.props, 'page.path')
    const action = path || '/new'
    const cancel = path || '/dashboard'
    const submitText = action === '/new' ? 'Create Page' : 'Save'

    const permissionsVal = get(this.props, 'page.permissions')
    const permissions = permissionsVal ? parseInt(permissionsVal) : 777
    const canAdmin = this.props.loggedInMember.admin && this.props.page && this.props.page.path

    const lock = canAdmin && permissions > 744
      ? (<input type='submit' name='lock' value='Lock' className='secondary' />)
      : permissions <= 744
        ? (<input type='submit' name='unlock' value='Unlock' className='secondary' />)
        : null

    const hide = canAdmin && permissions > 400
      ? (<input type='submit' name='hide' value='Hide' className='secondary' />)
      : permissions <= 400
        ? (<input type='submit' name='unhide' value='Unhide' className='secondary' />)
        : null

    return (
      <p className='actions'>
        <button>{submitText}</button>
        {lock}
        {hide}
        <a href={cancel} className='button secondary'>Cancel</a>
      </p>
    )
  }
}

/**
 * Maps Redux state to the component's props.
 * @param state {Object} - The state from Redux.
 * @returns {Object} - The component's new props.
 */

const mapStateToProps = state => {
  return {
    loggedInMember: state.MemberLogin,
    page: state.Page
  }
}

FormActions.propTypes = {
  loggedInMember: PropTypes.object,
  page: PropTypes.object
}

export default connect(mapStateToProps)(FormActions)
