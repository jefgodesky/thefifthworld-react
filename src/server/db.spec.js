/* global describe, it, expect, afterAll */

import db from './db'

describe('Database', () => {
  it('can execute a query', async () => {
    expect.assertions(1)
    const rows = await db.run('SELECT 1 + 1 AS solution')
    expect(rows[0].solution).toBe(2)
  })
})

afterAll(() => {
  db.end()
})
