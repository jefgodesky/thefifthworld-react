/* global describe, it, expect */

import React from 'react'
import { shallow, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import { Header } from './component'

configure({ adapter: new Adapter() })

describe('header component', () => {
  it('should know my name', () => {
    const wrapper = shallow(<Header name='Daniel' />)
    expect(wrapper.find('nav.account li').first().text()).toEqual('Daniel')
  })

  it('should provide a logout button', () => {
    const wrapper = shallow(<Header name='Daniel' />)
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
    const wrapper = shallow(<Header addClasses={[ 'test1', 'test2' ]} />)
    expect(wrapper.find('header.test1.test2').length).toEqual(1)
  })

  it('can skip the branding', () => {
    const wrapper = shallow(<Header skipBranding />)
    expect(wrapper.find('h1').length).toEqual(0)
  })

  it('can skip the navigation', () => {
    const wrapper = shallow(<Header skipNav />)
    expect(wrapper.find('nav').length).toEqual(1)
  })
})
