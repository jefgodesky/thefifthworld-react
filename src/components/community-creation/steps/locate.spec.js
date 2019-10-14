/* global describe, it, expect */

import React from 'react'
import { shallow, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import CommunityCreationLocate from './locate'

configure({ adapter: new Adapter() })

describe('CommunityCreationLocate', () => {
  it('should render the page', () => {
    const wrapper = shallow(<CommunityCreationLocate params={{}} />)
    expect(wrapper.find('p').length).toEqual(1)
  })

  it('should mark both labels as in error when told to', () => {
    const wrapper = shallow(<CommunityCreationLocate params={{ error: 'both' }} />)
    expect(wrapper.find('label.error').length).toEqual(2)
  })

  it('should mark both inputs as in error when told to', () => {
    const wrapper = shallow(<CommunityCreationLocate params={{ error: 'both' }} />)
    expect(wrapper.find('input.error').length).toEqual(2)
  })

  it('should display two error messages when told to', () => {
    const wrapper = shallow(<CommunityCreationLocate params={{ error: 'both' }} />)
    expect(wrapper.find('p.error').length).toEqual(2)
  })

  it('should mark latitude label as in error when told to', () => {
    const wrapper = shallow(<CommunityCreationLocate params={{ error: 'lat' }} />)
    expect(wrapper.find('label.error').length).toEqual(1)
  })

  it('should mark latitude input as in error when told to', () => {
    const wrapper = shallow(<CommunityCreationLocate params={{ error: 'lat' }} />)
    expect(wrapper.find('#lat.error').length).toEqual(1)
  })

  it('should display latitude error messages when told to', () => {
    const wrapper = shallow(<CommunityCreationLocate params={{ error: 'lat' }} />)
    expect(wrapper.find('#lat + p.error').length).toEqual(1)
  })

  it('should mark longitude label as in error when told to', () => {
    const wrapper = shallow(<CommunityCreationLocate params={{ error: 'lon' }} />)
    expect(wrapper.find('label.error').length).toEqual(1)
  })

  it('should mark longitude input as in error when told to', () => {
    const wrapper = shallow(<CommunityCreationLocate params={{ error: 'lon' }} />)
    expect(wrapper.find('#lon.error').length).toEqual(1)
  })

  it('should display longitude error messages when told to', () => {
    const wrapper = shallow(<CommunityCreationLocate params={{ error: 'lon' }} />)
    expect(wrapper.find('#lon + p.error').length).toEqual(1)
  })
})
