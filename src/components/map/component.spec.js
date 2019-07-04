/* global it, expect */

import React from 'react'
import { shallow, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import Map from './component'

configure({ adapter: new Adapter() })

it('should render a div', () => {
  const wrapper = shallow(<Map />)
  expect(wrapper.find('div').length).toEqual(1)
})
