/* global describe, it, expect */

import React from 'react'
import { shallow, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import FormActions from './component'

configure({ adapter: new Adapter() })

describe('Form', () => {
  it('should offer an admin lock and hide buttons on a 777 page', () => {
    const admin = { admin: true }
    const page = {
      path: '/test',
      permissions: 777
    }
    const wrapper = shallow(<FormActions loggedInMember={admin} page={page} />)

    const actual = {
      lock: wrapper.find('input[name="lock"]').length,
      unlock: wrapper.find('input[name="unlock"]').length,
      hide: wrapper.find('input[name="hide"]').length,
      unhide: wrapper.find('input[name="unhide"]').length
    }

    const expected = {
      lock: 1,
      unlock: 0,
      hide: 1,
      unhide: 0
    }

    expect(actual).toEqual(expected)
  })

  it('should offer an admin unlock and hide buttons on a 744 page', () => {
    const admin = { admin: true }
    const page = {
      path: '/test',
      permissions: 744
    }
    const wrapper = shallow(<FormActions loggedInMember={admin} page={page} />)

    const actual = {
      lock: wrapper.find('input[name="lock"]').length,
      unlock: wrapper.find('input[name="unlock"]').length,
      hide: wrapper.find('input[name="hide"]').length,
      unhide: wrapper.find('input[name="unhide"]').length
    }

    const expected = {
      lock: 0,
      unlock: 1,
      hide: 1,
      unhide: 0
    }

    expect(actual).toEqual(expected)
  })

  it('should offer an admin unhide button on a 400 page', () => {
    const admin = { admin: true }
    const page = {
      path: '/test',
      permissions: 400
    }
    const wrapper = shallow(<FormActions loggedInMember={admin} page={page} />)

    const actual = {
      lock: wrapper.find('input[name="lock"]').length,
      unlock: wrapper.find('input[name="unlock"]').length,
      hide: wrapper.find('input[name="hide"]').length,
      unhide: wrapper.find('input[name="unhide"]').length
    }

    const expected = {
      lock: 0,
      unlock: 1,
      hide: 0,
      unhide: 1
    }

    expect(actual).toEqual(expected)
  })

  it('should not offer a lock, unlock, hide, or unhide button when the user isn\'t an admin', () => {
    const page = {
      path: '/test',
      permissions: 777
    }
    const wrapper = shallow(<FormActions loggedInMember={{}} page={page} />)

    const actual = {
      lock: wrapper.find('input[name="lock"]').length,
      unlock: wrapper.find('input[name="unlock"]').length,
      hide: wrapper.find('input[name="hide"]').length,
      unhide: wrapper.find('input[name="unhide"]').length
    }

    const expected = {
      lock: 0,
      unlock: 0,
      hide: 0,
      unhide: 0
    }

    expect(actual).toEqual(expected)
  })

  it('should disable buttons if told to', () => {
    const admin = { admin: true }
    const page = {
      path: '/test',
      permissions: 777
    }

    const wrapper = shallow(<FormActions loggedInMember={admin} page={page} disabled />)
    const actual = [ wrapper.find('button[disabled]').length, wrapper.find('input[disabled]').length ]
    const expected = [ 1, 2 ]
    expect(actual).toEqual(expected)
  })
})
