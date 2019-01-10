/* global it, expect */

import React from 'react'
import { shallow, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import { Page } from './component'

configure({ adapter: new Adapter() })

it('should render a wiki page by default', () => {
  const page = { permissions: 777 }
  const wrapper = shallow(<Page loggedInMember={null} page={page} />)
  expect(wrapper.find('Connect(Wiki)').length).toEqual(1)
})

it('should display a 404 error if there is no page', () => {
  const wrapper = shallow(<Page loggedInMember={null} page={null} />)
  expect(wrapper.find('Error404').length).toEqual(1)
})

it('should display a 401 error if you\'re not authorized to read it', () => {
  const page = { permissions: 700 }
  const wrapper = shallow(<Page loggedInMember={null} page={page} />)
  expect(wrapper.find('Error401').length).toEqual(1)
})

it('should render for admin regardless of permissions', () => {
  const page = { permissions: 100 }
  const admin = { name: 'Admin', id: 'admin', admin: true }
  const wrapper = shallow(<Page loggedInMember={admin} page={page} />)
  expect(wrapper.find('Connect(Wiki)').length).toEqual(1)
})

it('should render for owner based on owner permission', () => {
  const page = { permissions: 400, owner: 'dq' }

  const admin = { name: 'Admin', id: 'admin', admin: true }
  const dq = { name: 'Daniel', id: 'dq' }
  const rand = { name: 'Random', id: 'r' }

  const adWrapper = shallow(<Page loggedInMember={admin} page={page} />)
  const dqWrapper = shallow(<Page loggedInMember={dq} page={page} />)
  const randWrapper = shallow(<Page loggedInMember={rand} page={page} />)
  const nullWrapper = shallow(<Page loggedInMember={null} page={page} />)

  const actual = [
    adWrapper.find('Connect(Wiki)').length,
    dqWrapper.find('Connect(Wiki)').length,
    randWrapper.find('Connect(Wiki)').length,
    nullWrapper.find('Connect(Wiki)').length
  ]
  expect(actual).toEqual([ 1, 1, 0, 0 ])
})

it('should render for members based on member permission', () => {
  const page = { permissions: 140, owner: 'dq' }

  const admin = { name: 'Admin', id: 'admin', admin: true }
  const dq = { name: 'Daniel', id: 'dq' }
  const rand = { name: 'Random', id: 'r' }

  const adWrapper = shallow(<Page loggedInMember={admin} page={page} />)
  const dqWrapper = shallow(<Page loggedInMember={dq} page={page} />)
  const randWrapper = shallow(<Page loggedInMember={rand} page={page} />)
  const nullWrapper = shallow(<Page loggedInMember={null} page={page} />)

  const actual = [
    adWrapper.find('Connect(Wiki)').length,
    dqWrapper.find('Connect(Wiki)').length,
    randWrapper.find('Connect(Wiki)').length,
    nullWrapper.find('Connect(Wiki)').length
  ]
  expect(actual).toEqual([ 1, 1, 1, 0 ])
})

it('should render for anyone if it\'s publicly readable', () => {
  const page = { permissions: 114, owner: 'dq' }

  const admin = { name: 'Admin', id: 'admin', admin: true }
  const dq = { name: 'Daniel', id: 'dq' }
  const rand = { name: 'Random', id: 'r' }

  const adWrapper = shallow(<Page loggedInMember={admin} page={page} />)
  const dqWrapper = shallow(<Page loggedInMember={dq} page={page} />)
  const randWrapper = shallow(<Page loggedInMember={rand} page={page} />)
  const nullWrapper = shallow(<Page loggedInMember={null} page={page} />)

  const actual = [
    adWrapper.find('Connect(Wiki)').length,
    dqWrapper.find('Connect(Wiki)').length,
    randWrapper.find('Connect(Wiki)').length,
    nullWrapper.find('Connect(Wiki)').length
  ]
  expect(actual).toEqual([ 1, 1, 1, 1 ])
})

it('should render breadcrumbs', () => {
  const page = {
    permissions: 777,
    lineage: [
      { path: '/grandparent/parent', title: 'Parent' },
      { path: '/grandparent', title: 'Grandparent' }
    ]
  }

  const wrapper = shallow(<Page loggedInMember={null} page={page} />)
  const actual = {
    text: wrapper.find('.breadcrumbs li').map(li => li.text()),
    link: wrapper.find('.breadcrumbs li').map(li => li.find('a').prop('href'))
  }
  const expected = {
    text: [ 'Grandparent', 'Parent' ],
    link: [ '/grandparent', '/grandparent/parent' ]
  }
  expect(actual).toEqual(expected)
})
