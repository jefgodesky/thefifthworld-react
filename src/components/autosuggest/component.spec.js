/* global it, expect */

import React from 'react'
import { shallow, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import Autosuggest from './component'

configure({ adapter: new Adapter() })

const testTransform = results => {
  return results.map(res => {
    return {
      name: res.title,
      value: `<code>${res.path}</code>`
    }
  })
}

it('should render a text input', () => {
  const wrapper = shallow(<Autosuggest
    defaultValue=''
    endpoint='/autocomplete/title'
    id='parent'
    label='Parent'
    name='parent'
    note={`Should this page belong to a different page?`}
    onChange={value => {}}
    threshold={3}
    transform={testTransform} />)
  expect(wrapper.find('input[id="parent"]').length).toEqual(1)
})
