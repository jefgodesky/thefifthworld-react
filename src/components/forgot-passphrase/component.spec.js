/* global it, expect */

import React from 'react'
import { shallow, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import { ForgotPassphrase } from './component'

configure({ adapter: new Adapter() })

it('should include a form', () => {
  const wrapper = shallow(<ForgotPassphrase />)
  expect(wrapper.find('form').length).toEqual(1)
})
