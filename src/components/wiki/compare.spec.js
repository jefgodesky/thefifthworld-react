/* global it, expect, beforeEach, afterEach, afterAll */

import React from 'react'
import { shallow, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import db from '../../server/db'
import Page from '../../shared/models/page'
import Member from '../../shared/models/member'
import { CompareWiki } from './compare'

configure({ adapter: new Adapter() })

beforeEach(async () => {
  await db.run('ALTER TABLE members AUTO_INCREMENT=1;')
  await db.run('ALTER TABLE pages AUTO_INCREMENT=1;')
  await db.run('ALTER TABLE changes AUTO_INCREMENT=1;')
  await db.run('INSERT INTO members (name, email) VALUES (\'Normal\', \'normal@thefifthworld.com\');')
})

it('should render a page', async () => {
  expect.assertions(1)
  const member = await Member.get(1, db)
  const orig = {
    title: 'New Page',
    body: 'This is a new page.'
  }
  const page = await Page.create(orig, member, 'Initial text', db)

  await page.update({
    title: 'New Page Title',
    path: '/updated',
    body: 'Not such a great update'
  }, member, 'Testing update', db)

  page.params = { a: page.changes[1].id.toString(), b: page.changes[0].id.toString() }

  const wrapper = shallow(<CompareWiki page={page} loggedInMember={member} />)
  expect(wrapper.find('table').length).toEqual(1)
})

it('can handle null values', async () => {
  expect.assertions(1)
  const member = await Member.get(1, db)
  const orig = {
    title: 'New Page',
    body: 'This is a new page.'
  }
  const page = await Page.create(orig, member, 'Initial text', db)

  await page.update({
    title: 'New Page Title',
    path: '/updated',
    body: 'Not such a great update'
  }, member, 'Testing update', db)

  page.params = { a: page.changes[1].id.toString(), b: page.changes[0].id.toString() }

  const wrapper = shallow(<CompareWiki page={page} loggedInMember={member} />)
  expect(wrapper.find('table').length).toEqual(1)
})

it('doesn\'t provide rollback buttons to users who don\'t have access to use them', async () => {
  expect.assertions(1)
  const member = await Member.get(1, db)
  const orig = {
    title: 'New Page',
    body: 'This is a new page.'
  }
  const page = await Page.create(orig, member, 'Initial text', db)

  await page.update({
    title: 'New Page Title',
    path: '/updated',
    body: 'Not such a great update'
  }, member, 'Testing update', db)

  page.params = { a: page.changes[1].id.toString(), b: page.changes[0].id.toString() }

  const wrapper = shallow(<CompareWiki page={page} loggedInMember={null} />)
  expect(wrapper.find('thead tr + tr th a').length).toEqual(0)
})

afterEach(async () => {
  const tables = [ 'members', 'pages', 'changes' ]
  for (const table of tables) {
    await db.run(`DELETE FROM ${table};`)
    await db.run(`ALTER TABLE ${table} AUTO_INCREMENT=1;`)
  }
})

afterAll(() => {
  db.end()
})
