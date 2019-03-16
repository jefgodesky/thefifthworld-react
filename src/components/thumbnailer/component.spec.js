/* global it, expect */

import React from 'react'
import { shallow, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import Thumbnailer from './component'

configure({ adapter: new Adapter() })

it('should render a ReactCrop component', () => {
  const wrapper = shallow(<Thumbnailer file={{ data: 'test' }} />)
  expect(wrapper.find('ReactCrop').length).toEqual(1)
})
