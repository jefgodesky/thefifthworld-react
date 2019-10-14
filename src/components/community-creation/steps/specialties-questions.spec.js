/* global describe, it, expect */

import React from 'react'
import { shallow, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import CommunityCreationSpecialtiesQuestions from './specialties-questions'

configure({ adapter: new Adapter() })

describe('CommunityCreationSpecialtiesQuestions', () => {
  it('should render the page', () => {
    const wrapper = shallow(<CommunityCreationSpecialtiesQuestions specialty='Bananas' />)
    expect(wrapper.find('h2').length).toEqual(1)
  })
})
