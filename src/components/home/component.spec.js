/* global it, expect */

import React from 'react'
import { shallow, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import { Home } from './component'

configure({ adapter: new Adapter() })

it('should return a page', () => {
  const wrapper = shallow(<Home />)
  expect(wrapper.find('main').length).toEqual(1)
})
