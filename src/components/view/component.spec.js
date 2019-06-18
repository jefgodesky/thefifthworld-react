/* global it, expect */

import React from 'react'
import { shallow, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import { View } from './component'

configure({ adapter: new Adapter() })

it('should render the page', () => {
  const wrapper = shallow(<View page={{ title: 'Test Page' }} />)
  expect(wrapper.find('.wiki-body').length).toEqual(1)
})
