import { clone } from '../../shared/utils'

export default class Community {
  constructor (data) {
    if (data) {
      Object.keys(data).forEach(key => {
        this[key] = clone(data[key])
      })
    }

    this.people = {}
  }

  /**
   * Add someone to the community.
   * @param person {Person} - The person to add to the community.
   * @returns {string} - The person's key.
   */

  add (person) {
    const total = Object.keys(this.people).length
    const newKey = `m${total + 1}`
    this.people[newKey] = person
    person.id = newKey
    return newKey
  }

  run () {
    console.log('running community...')
  }

  analyze () {
    return 'analyze community'
  }
}
