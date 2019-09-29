/* global describe, it, expect */

import React from 'react'
import { shallow, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import { CommunityCreation } from './component'

configure({ adapter: new Adapter() })

describe('CommunityCreation', () => {
  it('should render the page', () => {
    const wrapper = shallow(<CommunityCreation />)
    expect(wrapper.find('.community-creation').length).toEqual(1)
  })

  it('should render the header', () => {
    const wrapper = shallow(<CommunityCreation />)
    expect(wrapper.find('Header').length).toEqual(1)
  })

  it('should render the footer', () => {
    const wrapper = shallow(<CommunityCreation />)
    expect(wrapper.find('Footer').length).toEqual(1)
  })
})
