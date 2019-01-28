/* global it, expect */

import React from 'react'
import { shallow, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import { History } from './component'

configure({ adapter: new Adapter() })

it('should show changes', () => {
  const page = {
    changes: [
      { id: 1, msg: 'Message', timestamp: new Date(), editor: { id: 'dq', name: 'Daniel' } },
      { id: 2, msg: 'Message', timestamp: new Date(), editor: { id: 'da', name: 'David' } }
    ]
  }
  const wrapper = shallow(<History loggedInMember={{}} page={page} />)
  expect(wrapper.find('tbody tr').length).toEqual(2)
})

it('should provide a form for rollbacks if you can edit', () => {
  const page = {
    permissions: 777,
    changes: [
      { id: 1, msg: 'Message', timestamp: new Date(), editor: { id: 'dq', name: 'Daniel' } },
      { id: 2, msg: 'Message', timestamp: new Date(), editor: { id: 'da', name: 'David' } }
    ]
  }
  const wrapper = shallow(<History loggedInMember={{}} page={page} />)
  expect(wrapper.find('form').length).toEqual(1)
})

it('should not provide a form for rollbacks if you can\'t edit', () => {
  const page = {
    owner: 'dq',
    permissions: 744,
    changes: [
      { id: 1, msg: 'Message', timestamp: new Date(), editor: { id: 'dq', name: 'Daniel' } },
      { id: 2, msg: 'Message', timestamp: new Date(), editor: { id: 'da', name: 'David' } }
    ]
  }
  const wrapper = shallow(<History loggedInMember={{}} page={page} />)
  expect(wrapper.find('form').length).toEqual(0)
})
