/* global it, expect */

import React from 'react'
import { shallow, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import { Invitations } from './component'

configure({ adapter: new Adapter() })

it('should show who I invited', () => {
  const invitations = [
    { id: 'jg', name: 'Jason', accepted: true },
    { id: 'gl', name: 'Giuli', accepted: true },
    { id: 'ow', name: 'Oprah', accepted: false }
  ]

  const member = { name: 'Daniel', id: 'dq' }
  const wrapper = shallow(<Invitations loggedInMember={member} invitations={invitations} />)

  const actual = []
  wrapper.find('table.invitations tbody tr').forEach(row => {
    const name = row.find('td').first().text()
    const status = row.find('td.status').text()
    actual.push({ name, status })
  })

  const expected = [
    { name: 'Jason', status: 'Member' },
    { name: 'Giuli', status: 'Member' },
    { name: 'Oprah', status: 'Invited' }
  ]
  expect(actual).toEqual(expected)
})

it('should show how many invitations I have left', () => {
  const member = { name: 'Daniel', id: 'dq', invitations: 3, admin: false }
  const admin = { name: 'Admin', id: 'admin', invitations: 5, admin: true }
  const mWrapper = shallow(<Invitations loggedInMember={member} invitations={[]} />)
  const aWrapper = shallow(<Invitations loggedInMember={admin} invitations={[]} />)

  const actual = [
    mWrapper.find('h2 + p strong').text(),
    aWrapper.find('h2 + p strong').text()
  ]
  expect(actual).toEqual([ '3', '∞' ])
})

it('should hide the form if I don\'t have any invitations left', () => {
  const member = { name: 'Daniel', id: 'dq', invitations: 0, admin: false }
  const wrapper = shallow(<Invitations loggedInMember={member} invitations={[]} />)
  expect(wrapper.find('textarea').length).toEqual(0)
})
