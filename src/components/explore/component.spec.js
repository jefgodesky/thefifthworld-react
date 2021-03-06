/* global describe, it, expect */

import React from 'react'
import { shallow, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import { Explore } from './component'

configure({ adapter: new Adapter() })

describe('explore component', () => {
  it('should show a Map component', () => {
    const wrapper = shallow(<Explore places={[]} />)
    expect(wrapper.find('Map').length).toEqual(1)
  })
})
