/* global describe, it, expect */

import React from 'react'
import { shallow, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import CommunityCreationPlace from './place'
import places from '../../../data/places'

configure({ adapter: new Adapter() })

describe('CommunityCreationPlace', () => {
  it('should render the page', () => {
    const card = places.filter(p => p.card === 'C10').shift()
    const wrapper = shallow(<CommunityCreationPlace card={card} params={{}} />)
    expect(wrapper.find('h2').length).toEqual(1)
  })

  it('should mark latitude and longitude labels as in error when told to', () => {
    const card = places.filter(p => p.card === 'C10').shift()
    const wrapper = shallow(<CommunityCreationPlace card={card} params={{ error: 'both' }} />)
    expect(wrapper.find('label.error').length).toEqual(2)
  })

  it('should mark latitude and longitude inputs as in error when told to', () => {
    const card = places.filter(p => p.card === 'C10').shift()
    const wrapper = shallow(<CommunityCreationPlace card={card} params={{ error: 'both' }} />)
    expect(wrapper.find('input.error').length).toEqual(2)
  })

  it('should display error messages for both latitude and longitude when told to', () => {
    const card = places.filter(p => p.card === 'C10').shift()
    const wrapper = shallow(<CommunityCreationPlace card={card} params={{ error: 'both' }} />)
    expect(wrapper.find('p.error').length).toEqual(2)
  })

  it('should mark latitude label as in error when told to', () => {
    const card = places.filter(p => p.card === 'C10').shift()
    const wrapper = shallow(<CommunityCreationPlace card={card} params={{ error: 'lat' }} />)
    expect(wrapper.find('label.error').length).toEqual(1)
  })

  it('should mark latitude input as in error when told to', () => {
    const card = places.filter(p => p.card === 'C10').shift()
    const wrapper = shallow(<CommunityCreationPlace card={card} params={{ error: 'lat' }} />)
    expect(wrapper.find('#lat.error').length).toEqual(1)
  })

  it('should display latitude error messages when told to', () => {
    const card = places.filter(p => p.card === 'C10').shift()
    const wrapper = shallow(<CommunityCreationPlace card={card} params={{ error: 'lat' }} />)
    expect(wrapper.find('#lat + p.error').length).toEqual(1)
  })

  it('should mark longitude label as in error when told to', () => {
    const card = places.filter(p => p.card === 'C10').shift()
    const wrapper = shallow(<CommunityCreationPlace card={card} params={{ error: 'lon' }} />)
    expect(wrapper.find('label.error').length).toEqual(1)
  })

  it('should mark longitude input as in error when told to', () => {
    const card = places.filter(p => p.card === 'C10').shift()
    const wrapper = shallow(<CommunityCreationPlace card={card} params={{ error: 'lon' }} />)
    expect(wrapper.find('#lon.error').length).toEqual(1)
  })

  it('should display longitude error messages when told to', () => {
    const card = places.filter(p => p.card === 'C10').shift()
    const wrapper = shallow(<CommunityCreationPlace card={card} params={{ error: 'lon' }} />)
    expect(wrapper.find('#lon + p.error').length).toEqual(1)
  })

  it('should indicate that a point is too far away when told to', () => {
    const card = places.filter(p => p.card === 'C10').shift()
    const wrapper = shallow(<CommunityCreationPlace card={card} params={{ error: 'toofar' }} />)
    expect(wrapper.find('label.error').length).toEqual(2)
  })

  it('should show an error when you haven\'t provided a name', () => {
    const card = places.filter(p => p.card === 'C10').shift()
    const wrapper = shallow(<CommunityCreationPlace card={card} params={{ error: 'noname' }} />)
    expect(wrapper.find('input[name="name"].error').length).toEqual(1)
  })

  it('should show an error when you haven\'t provided an answer', () => {
    const card = places.filter(p => p.card === 'C10').shift()
    const wrapper = shallow(<CommunityCreationPlace card={card} params={{ error: 'nointro' }} />)
    expect(wrapper.find('textarea.error').length).toEqual(1)
  })
})
