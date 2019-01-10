/* global it, expect */

import React from 'react'
import { shallow, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import { Header } from './component'

configure({ adapter: new Adapter() })

it('should know my name', () => {
  const member = { name: 'Daniel', id: 'dq' }
  const wrapper = shallow(<Header loggedInMember={member} />)
  expect(wrapper.find('nav.account li').first().text()).toEqual(member.name)
})

it('should provide a logout button', () => {
  const member = { name: 'Daniel', id: 'dq' }
  const wrapper = shallow(<Header loggedInMember={member} />)
  expect(wrapper.find('a[href="/logout"]').length).toEqual(1)
})

it('should include the logo', () => {
  const member = { name: 'Daniel', id: 'dq' }
  const wrapper = shallow(<Header loggedInMember={member} />)
  expect(wrapper.find('h1').length).toEqual(1)
})

it('should include a main nav', () => {
  const member = { name: 'Daniel', id: 'dq' }
  const wrapper = shallow(<Header loggedInMember={member} />)
  expect(wrapper.find('nav').length).toEqual(2)
})
