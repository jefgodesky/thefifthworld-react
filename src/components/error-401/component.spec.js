/* global describe, it, expect */

import React from 'react'
import { shallow, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import { Error401 } from './component'

configure({ adapter: new Adapter() })

describe('error 401 component', () => {
  it('should display a 401 error', () => {
    const wrapper = shallow(<Error401 />)
    expect(wrapper.find('h2').text()).toEqual('Error 401')
  })
})
