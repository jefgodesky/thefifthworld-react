/* global it, expect */

import React from 'react'
import { shallow, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import { Dashboard } from './component'

configure({ adapter: new Adapter() })

it('should know my name', () => {
  const member = { name: 'Daniel', id: 'test' }
  const wrapper = shallow(<Dashboard loggedInMember={member} />)
  expect(wrapper.find('.dashboard p').first().find('strong').text()).toEqual(`Hello, ${member.name}.`)
})

it('should link to my profile', () => {
  const member = { name: 'Daniel', id: 'dq' }
  const wrapper = shallow(<Dashboard loggedInMember={member} />)
  expect(wrapper.find('.dashboard .choices').at(1).find('ul li a').first().html()).toEqual('<a href="/member/dq/edit" class="button">Your Profile</a>')
})