/* global it, expect */

import React from 'react'
import { shallow, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import { Wiki } from './view'

configure({ adapter: new Adapter() })

it('should render the page', () => {
  const wrapper = shallow(<Wiki page={{ title: 'Test Page' }} />)
  expect(wrapper.find('h1').text()).toEqual('Test Page')
})
