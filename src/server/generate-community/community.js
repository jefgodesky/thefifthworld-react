import { clone } from '../../shared/utils'

import History from './history'
import Person from './person'

export default class Community {
  constructor (data) {
    if (data) {
      Object.keys(data).forEach(key => {
        this[key] = clone(data[key])
      })
    }

    this.people = {}
    this.polycules = {}
    this.history = new History()
  }

  /**
   * Add a person or a polycule to the community.
   * @param addition {Person|Polycule} - The person or polycule to add to the
   *   community.
   * @returns {string} - The person or polycule's key.
   */

  add (addition) {
    const isPerson = addition instanceof Person
    const arr = isPerson ? this.people : this.polycules
    const prefix = isPerson ? 'm' : 'p'
    const total = Object.keys(arr).length
    const newKey = `${prefix}${total + 1}`
    arr[newKey] = addition
    addition.id = newKey
    return newKey
  }

  /**
   * Returns an array of the people who currently make up the community (as of
   * the community's present). It excludes people who have died or left.
   * @returns {[Person]} - An array of the people who currently make up the
   *   community.
   */

  getPeople () {
    return Object.values(this.people).filter(p => !p.died && !p.left)
  }

  /**
   * Returns the most recent years in the community's history.
   * @param years {number} - Optional. The number of years to go back in the
   *   history that is returned (Default: `10`).
   * @returns {[Object]} - An array of event objects that occurred in the
   *   community in the past number of years given.
   */

  getRecentHistory (years = 10) {
    const latest = this.history.getLatest()
    return this.history.getYears([ latest, latest - years + 1 ])
  }

  /**
   * Returns whether or not the community is currently experiencing any major
   * problems, like conflict, sickness, or lean times.
   * @returns {boolean} - `true` if the community is experiencing any major
   *   problems, or `false` if it is not.
   */

  hasProblems () {
    return this.status && (this.status.lean || this.status.sick || this.status.conflict)
  }

  run () {
    console.log('running community...')
  }

  analyze () {
    return 'analyze community'
  }
}
