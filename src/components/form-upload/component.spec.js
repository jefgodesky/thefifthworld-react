/* global describe, it, expect */

import React from 'react'
import { shallow, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import FormUpload from './component'

configure({ adapter: new Adapter() })

describe('FormUpload', () => {
  it('should render a file input component', () => {
    const wrapper = shallow(<FormUpload page={{ type: 'File' }} />)
    expect(wrapper.find('input[type="file"]').length).toEqual(1)
  })

  it('should default to "File" for files', () => {
    const wrapper = shallow(<FormUpload page={{ type: 'File' }} />)
    const radio = wrapper.find('input#type-file')
    expect(radio && radio.props().defaultChecked).toEqual(true)
  })

  it('should default to "Art" for art', () => {
    const wrapper = shallow(<FormUpload page={{ type: 'Art' }} />)
    const radio = wrapper.find('input#type-art')
    expect(radio && radio.props().defaultChecked).toEqual(true)
  })
})
