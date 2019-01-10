/* global it, expect */

import React from 'react'
import { shallow, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import renderOptions from './options'

configure({ adapter: new Adapter() })

it('should render view and history options', () => {
  const wrapper = shallow(renderOptions('/test', { edit: false }, 'view'))
  const actual = {
    view: wrapper.find('a[href="/test"]').length,
    edit: wrapper.find('a[href="/test/edit"]').length,
    history: wrapper.find('a[href="/test/history"]').length
  }

  const expected = { view: 1, edit: 0, history: 1 }
  expect(actual).toEqual(expected)
})

it('should render edit option when user has permission', () => {
  const wrapper = shallow(renderOptions('/test', { edit: true }, 'view'))
  const actual = {
    view: wrapper.find('a[href="/test"]').length,
    edit: wrapper.find('a[href="/test/edit"]').length,
    history: wrapper.find('a[href="/test/history"]').length
  }

  const expected = { view: 1, edit: 1, history: 1 }
  expect(actual).toEqual(expected)
})

it('should note when the view is active', () => {
  const wrapper = shallow(renderOptions('/test', { edit: true }, 'view'))
  expect(wrapper.find('li.active a[href="/test"]').length).toEqual(1)
})

it('should note when the edit form is active', () => {
  const wrapper = shallow(renderOptions('/test', { edit: true }, 'edit'))
  expect(wrapper.find('li.active a[href="/test/edit"]').length).toEqual(1)
})

it('should note when the history option is active', () => {
  const wrapper = shallow(renderOptions('/test', { edit: true }, 'history'))
  expect(wrapper.find('li.active a[href="/test/history"]').length).toEqual(1)
})
