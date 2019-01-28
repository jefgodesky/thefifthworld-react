/* global it, expect */

import React from 'react'
import { shallow, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import { Create } from './component'

configure({ adapter: new Adapter() })

it('should render a 401 error if there is no user', () => {
  const wrapper = shallow(<Create loggedInMember={null} />)
  expect(wrapper.find('Error401').length).toEqual(1)
})

it('should render a form if there is a user', () => {
  const wrapper = shallow(<Create loggedInMember={{}} />)
  expect(wrapper.find('Connect(Form)').length).toEqual(1)
})
