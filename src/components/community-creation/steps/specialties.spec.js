/* global describe, it, expect */

import React from 'react'
import { shallow, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import { CommunityCreationSpecialties } from './specialties'

configure({ adapter: new Adapter() })

describe('CommunityCreationSpecialties', () => {
  it('should render the page', () => {
    const wrapper = shallow(<CommunityCreationSpecialties />)
    expect(wrapper.find('h2').length).toEqual(1)
  })

  it('should display the options provided', () => {
    const options = [ 'Apple', 'Banana', 'Carrot' ]
    const wrapper = shallow(<CommunityCreationSpecialties options={options} />)
    expect(wrapper.find('input[type="checkbox"]').length).toEqual(3)
  })

  it('should render predictable id attributes', () => {
    const options = [ 'Apple', 'Banana', 'Carrot cake' ]
    const wrapper = shallow(<CommunityCreationSpecialties options={options} />)
    expect(wrapper.find('#specialty-carrot-cake').length).toEqual(1)
  })

  it('should display an error if too many options were selected', () => {
    const params = { error: 'toomany' }
    const wrapper = shallow(<CommunityCreationSpecialties params={params} />)
    expect(wrapper.find('.error').length).toEqual(1)
  })
})
