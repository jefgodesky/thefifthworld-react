/* global describe, it, expect */

import React from 'react'
import { shallow, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import { Error404 } from './component'

configure({ adapter: new Adapter() })

describe('error 404 component', () => {
  it('should display a 404 error', () => {
    const wrapper = shallow(<Error404 />)
    expect(wrapper.find('h2').text()).toEqual('Error 404')
  })
})
