/* global describe, it, expect */

import React from 'react'
import { shallow, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import CommunityCreationGenerate from './generate'

configure({ adapter: new Adapter() })

describe('CommunityCreationGenerate', () => {
  it('should render the page', () => {
    const wrapper = shallow(<CommunityCreationGenerate id='test' />)
    expect(wrapper.find('button').length).toEqual(1)
  })
})
