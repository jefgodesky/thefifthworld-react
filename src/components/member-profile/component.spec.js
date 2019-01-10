/* global it, expect */

import React from 'react'
import { shallow, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import { MemberProfile } from './component'

configure({ adapter: new Adapter() })

it('should show the member\'s name', () => {
  const loggedInMember = { name: 'User', id: 'u' }
  const member = { name: 'Daniel', id: 'dq' }
  const match = { path: '/member/:id' }
  const wrapper = shallow(<MemberProfile loggedInMember={loggedInMember} member={member} match={match} />)
  expect(wrapper.find('h1').text()).toEqual(member.name)
})

it('should let a member edit her profile', () => {
  const member = { name: 'Daniel', id: 'dq' }
  const match = { path: '/member/:id/edit' }
  const wrapper = shallow(<MemberProfile loggedInMember={member} member={member} match={match} />)
  expect(wrapper.find('form').length).toEqual(1)
})

it('should let an admin edit a member\'s profile', () => {
  const member = { name: 'Daniel', id: 'dq' }
  const admin = { name: 'Admin', id: 'admin', admin: true }
  const match = { path: '/member/:id/edit' }
  const wrapper = shallow(<MemberProfile loggedInMember={admin} member={member} match={match} />)
  expect(wrapper.find('form').length).toEqual(1)
})

it('should not let a regular member edit another member\'s profile', () => {
  const member = { name: 'Daniel', id: 'dq' }
  const other = { name: 'David', id: 'da' }
  const match = { path: '/member/:id/edit' }
  const wrapper = shallow(<MemberProfile loggedInMember={other} member={member} match={match} />)
  expect(wrapper.find('form').length).toEqual(0)
})

it('should welcome a new member', () => {
  const member = { name: 'Daniel', id: 'dq' }
  const match = { path: '/welcome/:id' }
  const wrapper = shallow(<MemberProfile loggedInMember={member} member={member} match={match} />)
  expect(wrapper.find('p strong').first().text()).toEqual('Welcome to the Fifth World!')
})

it('should let an admin access a member\'s welcome screen', () => {
  const member = { name: 'Daniel', id: 'dq' }
  const admin = { name: 'Admin', id: 'admin', admin: true }
  const match = { path: '/welcome/:id' }
  const wrapper = shallow(<MemberProfile loggedInMember={admin} member={member} match={match} />)
  expect(wrapper.find('p strong').first().text()).toEqual('Welcome to the Fifth World!')
})

it('should not let a regular member access another another member\'s welcome screen', () => {
  const member = { name: 'Daniel', id: 'dq' }
  const other = { name: 'David', id: 'da' }
  const match = { path: '/welcome/:id' }
  const wrapper = shallow(<MemberProfile loggedInMember={other} member={member} match={match} />)
  expect(wrapper.find('form').length).toEqual(0)
})
