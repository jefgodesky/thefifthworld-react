/* global describe, it, expect */

import React from 'react'
import { shallow, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import { MemberLogin } from './component'

configure({ adapter: new Adapter() })

describe('member login component', () => {
  it('should present a form', () => {
    const wrapper = shallow(<MemberLogin />)
    expect(wrapper.find('form').length).toEqual(1)
  })

  it('should present OAuth 2.0 authentication options', () => {
    const wrapper = shallow(<MemberLogin />)
    const actual = [
      wrapper.find('.oauth2-login .patreon').length,
      wrapper.find('.oauth2-login .discord').length,
      wrapper.find('.oauth2-login .google').length,
      wrapper.find('.oauth2-login .facebook').length,
      wrapper.find('.oauth2-login .twitter').length
    ]
    expect(actual).toEqual([1, 1, 1, 1, 1])
  })
})
