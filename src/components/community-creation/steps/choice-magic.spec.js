/* global describe, it, expect */

import React from 'react'
import { shallow, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import CommunityCreationChoiceMagic from './choice-magic'

configure({ adapter: new Adapter() })

describe('CommunityCreationChoiceMagic', () => {
  it('should render the page', () => {
    const wrapper = shallow(<CommunityCreationChoiceMagic id='test' />)
    expect(wrapper.find('input[type="radio"]').length).toEqual(2)
  })
})
