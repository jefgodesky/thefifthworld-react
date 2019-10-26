/* global describe, it, expect */

import React from 'react'
import { shallow, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import { Messages } from './component'

configure({ adapter: new Adapter() })

describe('messages component', () => {
  it('should display messages', () => {
    const messages = {
      error: [ 'error message' ],
      info: [ 'info message 1', 'info message 2', 'info message 3' ],
      weird: [ 'weird message 1', 'weird message 2' ]
    }

    const wrapper = shallow(<Messages messages={messages} />)
    const error = wrapper.find('.messages .error').length
    const info = wrapper.find('.messages .info').length
    const weird = wrapper.find('.messages .weird').length
    const actual = [ error, info, weird ]
    const expected = [ messages.error.length, messages.info.length, messages.weird.length ]
    expect(actual).toEqual(expected)
  })
})
