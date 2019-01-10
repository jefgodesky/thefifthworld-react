/* global it, expect */

import React from 'react'
import { shallow, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import { Join } from './component'

configure({ adapter: new Adapter() })

it('should return a form', () => {
  const wrapper = shallow(<Join />)
  expect(wrapper.find('form').length).toEqual(1)
})
