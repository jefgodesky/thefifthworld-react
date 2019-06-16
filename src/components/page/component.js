import React from 'react'
import PropTypes from 'prop-types'
import Header from '../header/component'
import Footer from '../footer/component'
import Messages from '../messages/component'
import Error401 from '../error-401/component'
import Error404 from '../error-404/component'

import Compare from '../compare/component'
import Form from '../form/component'
import History from '../history/component'
import View from '../view/component'

import autoBind from 'react-autobind'
import { connect } from 'react-redux'
import { canRead } from '../../shared/permissions'

/**
 * This component handles the member profile page.
 */

export class Page extends React.Component {
  constructor (props) {
    super(props)
    autoBind(this)
  }

  /**
   * Renders the page breadcrumbs.
   * @returns {*} - JSX for the breadcrumbs for the page.
   */

  renderBreadcrumbs () {
    if (this.props.page && this.props.page.lineage && Array.isArray(this.props.page.lineage) && this.props.page.lineage.length > 0) {
      const lineage = this.props.page.lineage.slice(0).reverse()
      const crumbs = []
      lineage.forEach(page => {
        crumbs.push(
          <li key={page.path}>
            <a href={page.path}>{page.title}</a>
          </li>
        )
      })

      return (
        <nav className='breadcrumbs'>
          <ul>
            {crumbs}
          </ul>
        </nav>
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
    const { loggedInMember, page } = this.props
    if (page && Object.keys(page).length > 0) {
      if (canRead(loggedInMember, page)) {
        let component
        if (page.command === 'edit') {
          component = (<Form />)
        } else if (page.command === 'history') {
          component = (<History />)
        } else if (page.command === 'compare') {
          component = (<Compare />)
        } else {
          component = (<View />)
        }

        const breadcrumbs = this.renderBreadcrumbs()

        return (
          <React.Fragment>
            <Header
              name={loggedInMember ? loggedInMember.name : null}
              title={page.title} />
            <main>
              <Messages />
              {breadcrumbs}
              {component}
            </main>
            <Footer />
          </React.Fragment>
        )
      } else {
        return (
          <Error401 />
        )
      }
    } else {
      return (
        <Error404 />
      )
    }
  }
}

/**
 * Maps Redux state to the component's props.
 * @param state - The state from Redux.
 * @returns {Object} - The component's new props.
 */

const mapStateToProps = state => {
  return {
    loggedInMember: state.MemberLogin,
    page: state.Page
  }
}

Page.propTypes = {
  loggedInMember: PropTypes.object,
  page: PropTypes.object
}

export default connect(mapStateToProps)(Page)
