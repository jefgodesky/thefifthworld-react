/* global it, expect */

import React from 'react'
import { shallow, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import Error401 from './component'

configure({ adapter: new Adapter() })

it('should display a 401 error', () => {
  const wrapper = shallow(<Error401 />)
  expect(wrapper.find('p').text()).toEqual('Unauthorized!')
})
