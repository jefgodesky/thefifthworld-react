import React from 'react'
import PropTypes from 'prop-types'
import { get } from '../../shared/utils'

/**
 * This component handles the buttons displayed on a form.
 */

class FormActions extends React.Component {
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
      ? (<input type='submit' name='lock' value='Lock' className='secondary' disabled={this.props.disabled} />)
      : permissions <= 744
        ? (<input type='submit' name='unlock' value='Unlock' className='secondary' disabled={this.props.disabled} />)
        : null

    const hide = canAdmin && permissions > 400
      ? (<input type='submit' name='hide' value='Hide' className='secondary' disabled={this.props.disabled} />)
      : permissions <= 400
        ? (<input type='submit' name='unhide' value='Unhide' className='secondary' disabled={this.props.disabled} />)
        : null

    return (
      <p className='actions'>
        <button disabled={this.props.disabled}>{submitText}</button>
        {lock}
        {hide}
        <a href={cancel} className='button secondary'>Cancel</a>
      </p>
    )
  }
}

FormActions.propTypes = {
  disabled: PropTypes.bool,
  loggedInMember: PropTypes.object,
  page: PropTypes.object
}

export default FormActions
