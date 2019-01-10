/* global it, expect */

import React from 'react'
import { shallow, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import PatreonLink from './component'

configure({ adapter: new Adapter() })

it('should display a 401 error', () => {
  const wrapper = shallow(<PatreonLink />)
  expect(wrapper.find('a[href="https://www.patreon.com/thefifthworld"]').length).toEqual(1)
})
