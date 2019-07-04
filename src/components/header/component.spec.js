/* global it, expect */

import React from 'react'
import { shallow, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import { Header } from './component'

configure({ adapter: new Adapter() })

it('should know my name', () => {
  const wrapper = shallow(<Header name='Jason' />)
  expect(wrapper.find('nav.account li').first().text()).toEqual('Jason')
})

it('should provide a logout button', () => {
  const wrapper = shallow(<Header name='Jason' />)
  expect(wrapper.find('a[href="/logout"]').length).toEqual(1)
})

it('should include the logo', () => {
  const wrapper = shallow(<Header />)
  expect(wrapper.find('h1').length).toEqual(1)
})

it('should include a main nav', () => {
  const wrapper = shallow(<Header />)
  expect(wrapper.find('nav').length).toEqual(2)
})

it('can take an additional class', () => {
  const wrapper = shallow(<Header addClasses='test' />)
  expect(wrapper.find('header.test').length).toEqual(1)
})

it('can take multiple additional classes', () => {
  const wrapper = shallow(<Header addClasses={['test1', 'test2']} />)
  expect(wrapper.find('header.test1.test2').length).toEqual(1)
})

it('has a full page mode', () => {
  const wrapper = shallow(<Header fullPage />)
  expect(wrapper.find('nav').length).toEqual(1)
})
