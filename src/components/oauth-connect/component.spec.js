/* global describe, it, expect */

import React from 'react'
import { shallow, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import { OAuth2Connect } from './component'

configure({ adapter: new Adapter() })

describe('oauth connect component', () => {
  it('should show which connections I\'ve made', () => {
    const wrapper = shallow(<OAuth2Connect connections={[ 'patreon', 'discord' ]} />)
    const patreon = wrapper.find('table tbody tr').at(0).find('a').text()
    const discord = wrapper.find('table tbody tr').at(1).find('a').text()
    const google = wrapper.find('table tbody tr').at(2).find('a').text()
    const facebook = wrapper.find('table tbody tr').at(3).find('a').text()
    const twitter = wrapper.find('table tbody tr').at(4).find('a').text()
    const expected = [ 'Disconnect', 'Disconnect', 'Connect', 'Connect', 'Connect' ]
    const actual = [ patreon, discord, google, facebook, twitter ]
    expect(actual).toEqual(expected)
  })
})
