/* global describe, it, expect */

import { canWrite, canRead } from './permissions'

describe('Permissions', () => {
  it('recognizes owner write permissions', () => {
    const canWriteResource = { permissions: 700, owner: 'owner' }
    const cannotWriteResource = { permissions: 100, owner: 'owner' }
    const owner = { id: 'owner' }
    const expected = [ true, false ]
    const actual = [
      canWrite(owner, canWriteResource),
      canWrite(owner, cannotWriteResource)
    ]
    expect(actual).toEqual(expected)
  })

  it('recognizes member write permissions', () => {
    const canWriteResource = { permissions: 770, owner: 'owner' }
    const cannotWriteResource = { permissions: 100, owner: 'owner' }
    const member = { id: 'member' }
    const expected = [ true, false ]
    const actual = [
      canWrite(member, canWriteResource),
      canWrite(member, cannotWriteResource)
    ]
    expect(actual).toEqual(expected)
  })

  it('recognizes owner read permissions', async () => {
    const canReadResource = { permissions: 400, owner: 'owner' }
    const cannotReadResource = { permissions: 100, owner: 'owner' }
    const owner = { id: 'owner' }
    const expected = [ true, false ]
    const actual = [
      canRead(owner, canReadResource),
      canRead(owner, cannotReadResource)
    ]
    expect(actual).toEqual(expected)
  })

  it('recognizes member read permissions', () => {
    const canReadResource = { permissions: 440, owner: 'owner' }
    const cannotReadResource = { permissions: 100, owner: 'owner' }
    const member = { id: 'member' }
    const expected = [ true, false ]
    const actual = [
      canRead(member, canReadResource),
      canRead(member, cannotReadResource)
    ]
    expect(actual).toEqual(expected)
  })

  it('recognizes public read permissions', () => {
    const canReadResource = { permissions: 444, owner: 'owner' }
    const cannotReadResource = { permissions: 100, owner: 'owner' }
    const expected = [ true, false ]
    const actual = [
      canRead(null, canReadResource),
      canRead(null, cannotReadResource)
    ]
    expect(actual).toEqual(expected)
  })

  it('grants all rights to admin', () => {
    const resource = { permissions: 100, owner: 'owner' }
    const admin = { admin: true, id: 'admin' }
    const expected = [ true, true ]
    const actual = [
      canRead(admin, resource),
      canWrite(admin, resource)
    ]
    expect(actual).toEqual(expected)
  })
})
