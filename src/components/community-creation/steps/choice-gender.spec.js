/* global describe, it, expect */

import React from 'react'
import { shallow, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import CommunityCreationChoiceGender from './choice-gender'

configure({ adapter: new Adapter() })

describe('CommunityCreationChoiceGender', () => {
  it('should render the page', () => {
    const wrapper = shallow(<CommunityCreationChoiceGender id='test' />)
    expect(wrapper.find('input[type="radio"]').length).toEqual(4)
  })
})
