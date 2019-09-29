/* global describe, it, expect */

import React from 'react'
import { shallow, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import { CommunityCreationLocate } from './locate'

configure({ adapter: new Adapter() })

describe('CommunityCreationLocate', () => {
  it('should render the page', () => {
    const wrapper = shallow(<CommunityCreationLocate />)
    expect(wrapper.find('p').length).toEqual(1)
  })
})
