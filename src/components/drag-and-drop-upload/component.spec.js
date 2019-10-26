/* global describe, it, expect */

import React from 'react'
import { shallow, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import DragDrop from './component'

configure({ adapter: new Adapter() })

describe('drag and drop upload component', () => {
  it('should render a droppable area', () => {
    const wrapper = shallow(<DragDrop />)
    expect(wrapper.find('.droppable').length).toEqual(1)
  })
})
