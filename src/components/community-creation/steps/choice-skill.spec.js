/* global describe, it, expect */

import React from 'react'
import { shallow, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import CommunityCreationChoiceSkill from './choice-skill'
import skills from '../../../data/skills'

configure({ adapter: new Adapter() })

describe('CommunityCreationChoiceSkill', () => {
  it('should render the page', () => {
    const list = skills.filter(skill => !skill.discouraged && !skill.rare)
    const wrapper = shallow(<CommunityCreationChoiceSkill id='test' />)
    expect(wrapper.find('option').length).toEqual(list.length)
  })
})
