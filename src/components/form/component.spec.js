/* global it, expect */

import React from 'react'
import { shallow, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import { Form } from './component'

configure({ adapter: new Adapter() })

it('should render a form', () => {
  const wrapper = shallow(<Form loggedInMember={{}} page={{}} />)
  expect(wrapper.find('form.wiki').length).toEqual(1)
})

it('should provide a new form if no page is given', () => {
  const wrapper = shallow(<Form loggedInMember={{}} page={{}} />)

  const expected = {
    title: undefined,
    parent: '',
    body: undefined
  }

  const actual = {
    title: wrapper.find('#title').props().defaultValue,
    parent: wrapper.find('#parent').props().defaultValue,
    body: wrapper.find('#body').props().defaultValue
  }

  expect(actual).toEqual(expected)
})

it('should provide an edit form if a page is given', () => {
  const page = {
    title: 'Page Title',
    lineage: [ { path: '/parent-path' } ],
    curr: { body: 'Lorem ipsum nova sit amet' }
  }

  const wrapper = shallow(<Form loggedInMember={{}} page={page} />)

  const expected = {
    title: page.title,
    parent: page.lineage[0].path,
    body: page.curr.body
  }

  const actual = {
    title: wrapper.find('#title').props().defaultValue,
    parent: wrapper.find('#parent').props().defaultValue,
    body: wrapper.find('#body').props().defaultValue
  }

  expect(actual).toEqual(expected)
})

it('should offer an admin lock and hide buttons on a 777 page', () => {
  const admin = { admin: true }
  const page = {
    path: '/test',
    permissions: 777
  }
  const wrapper = shallow(<Form loggedInMember={admin} page={page} />)

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
  const wrapper = shallow(<Form loggedInMember={admin} page={page} />)

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
  const wrapper = shallow(<Form loggedInMember={admin} page={page} />)

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
  const wrapper = shallow(<Form loggedInMember={{}} page={page} />)

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
