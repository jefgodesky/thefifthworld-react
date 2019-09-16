import React from 'react'
import PropTypes from 'prop-types'
import Header from '../header/component'
import Footer from '../footer/component'
import Messages from '../messages/component'
import Error401 from '../error-401/component'
import Error404 from '../error-404/component'

import PageModel from '../../shared/models/page'

import Compare from '../compare/component'
import Form from '../form/component'
import History from '../history/component'
import View from '../view/component'

import autoBind from 'react-autobind'
import { connect } from 'react-redux'
import { canRead } from '../../shared/permissions'
import slugify from '../../shared/slugify'
import { isPopulatedArray } from '../../shared/utils'

/**
 * This component handles the member profile page.
 */

export class Page extends React.Component {
  constructor (props) {
    super(props)
    autoBind(this)
  }

  /**
   * Returns the latest changes to the parent of the page.
   * @returns {Object} - The most recent changes to the page's parent.
   */

  getParent () {
    const { page } = this.props
    return isPopulatedArray(page.lineage) && isPopulatedArray(page.lineage[0].changes)
      ? page.lineage[0].changes[0] && page.lineage[0].changes[0].content
        ? page.lineage[0].changes[0].content
        : undefined
      : undefined
  }

  /**
   * Returns the string to display for credit in the header. If this is a
   * Chapter and its parent is a Novel, then that's the Author tag found in the
   * Novel. Otherwise, it's the Author tag or the Artist tag (Author taking
   * precedence over Artist. That's not a value judgment, we just need one to
   * win out. Really, you shouldn't have both on the same page, right?).
   * @returns {string|null}
   */

  getCredit () {
    const { page } = this.props
    const p = this.getParent()
    const author = page.type === 'Chapter' && PageModel.getType(p.body) === 'Novel'
      ? PageModel.getTag(p.body, 'Author', true)
      : page && page.curr && page.curr.body
        ? PageModel.getTag(page.curr.body, 'Author', true)
        : null
    const artist = page && page.curr && page.curr.body
      ? PageModel.getTag(page.curr.body, 'Artist', true)
      : null
    return author || artist
  }

  /**
   * Returns the title to be displayed in the header. This is normally the
   * page's title, but if it's a Chapter and its parent is a Novel, it's the
   * Novel's title.
   * @returns {string} - The title to display in the header.
   */

  getTitle () {
    const { page } = this.props
    let title = page.title
    const p = this.getParent()
    if (page.type === 'Chapter' && PageModel.getType(p.body) === 'Novel') title = p.title
    return title
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
        const type = page.type ? slugify(page.type) : null
        const cmd = page.command ? page.command : 'view'
        const classes = [ type, cmd ]

        return (
          <React.Fragment>
            <Header
              header={page.header ? page.header : null}
              name={loggedInMember ? loggedInMember.name : null}
              credit={this.getCredit()}
              title={this.getTitle()} />
            <main className={classes.join(' ')}>
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
