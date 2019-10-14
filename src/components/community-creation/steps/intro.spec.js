/* global describe, it, expect */

import React from 'react'
import { shallow, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import CommunityCreationIntro from './intro'

configure({ adapter: new Adapter() })

describe('CommunityCreationIntro', () => {
  it('should render the page', () => {
    const wrapper = shallow(<CommunityCreationIntro />)
    expect(wrapper.find('p').length).toEqual(4)
  })
})
