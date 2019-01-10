/* global it, expect */

import React from 'react'
import { shallow, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import { Footer } from './component'

configure({ adapter: new Adapter() })

it('should return a footer', () => {
  const wrapper = shallow(<Footer />)
  expect(wrapper.find('footer').length).toEqual(1)
})
