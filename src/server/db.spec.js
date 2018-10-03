/* global describe, it, expect, afterAll */

import db from './db'

describe('Database', () => {
  it('can execute a query', () => {
    expect.assertions(1)
    return db.q('SELECT 1 + 1 AS solution')
      .then(rows => {
        expect(rows[0].solution).toBe(2)
      })
      .catch(err => {
        console.error(err)
        expect(0).toBe(1)
      })
  })
})

afterAll(() => {
  db.end()
})
