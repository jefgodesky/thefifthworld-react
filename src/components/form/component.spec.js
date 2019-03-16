/* global describe, it, expect */

import React from 'react'
import { shallow, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import { Form } from './component'

configure({ adapter: new Adapter() })

describe('Form', () => {
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

  it('should display a duplicate path error', () => {
    const error = {
      field: 'path',
      code: 'ER_DUP_ENTRY',
      value: '/error/path'
    }
    const wrapper = shallow(<Form loggedInMember={{}} page={{}} error={error} />)
    const actual = wrapper.find('p.error').html()
    const expected = `<p class="error"><a href="/error/path" class="path" target="_blank">/error/path</a> already exists. Please choose a different path to make this page unique.</p>`
    expect(actual).toEqual(expected)
  })

  it('should not show a FormUpload component when creating a page', () => {
    const wrapper = shallow(<Form loggedInMember={{}} />)
    expect(wrapper.find('FormUpload').length).toEqual(0)
  })

  it('should show a FormUpload component when creating a page if it\'s told to', () => {
    const wrapper = shallow(<Form loggedInMember={{}} upload />)
    expect(wrapper.find('FormUpload').length).toEqual(1)
  })

  it('should not show a FormUpload component when editing a page', () => {
    const wrapper = shallow(<Form loggedInMember={{}} page={{ path: '/test', permissions: 777 }} />)
    expect(wrapper.find('FormUpload').length).toEqual(0)
  })

  it('should show a FormUpload component when editing a page with [[Type:File]]', () => {
    const wrapper = shallow(<Form loggedInMember={{}} page={{ path: '/test', permissions: 777, type: 'File' }} />)
    expect(wrapper.find('FormUpload').length).toEqual(1)
  })

  it('should show a FormUpload component when editing a page with [[Type:Art]]', () => {
    const wrapper = shallow(<Form loggedInMember={{}} page={{ path: '/test', permissions: 777, type: 'Art' }} />)
    expect(wrapper.find('FormUpload').length).toEqual(1)
  })
})
