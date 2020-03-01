import History from './history'
import Person from './person'

import { clone, isPopulatedArray } from '../../shared/utils'

export default class Community {
  constructor (data) {
    if (data) {
      Object.keys(data).forEach(key => {
        this[key] = clone(data[key])
      })
    }

    this.people = {}
    this.history = new History()
  }

  /**
   * Add a person to the community.
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
   * Returns whether or not a person with the given ID is a current member of
   * the community.
   * @param person {Person|string} - Either the person or the ID of the person
   *   to check on.
   * @returns {boolean} - `true` if the person is a current member of the
   *   community, or `false` if she is not (whether because she never was part
   *   of the community or because she died or left).
   */

  isCurrentMember (person) {
    const id = person instanceof Person ? person.id : person
    const p = this.people[id]
    return Boolean(p) && p instanceof Person && !p.died && !p.left
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
   * Return the number of deaths due to assault that the community has suffered
   * in recent years.
   * @param years {number} - Optional. The number of years to go back in our
   *   consideration of what's recent (Default: `10`).
   * @returns {number} - the number of deaths due to assault that the community
   *   gas suffered in the past `years` years.
   */

  getRecentViolentDeaths (years = 10) {
    const people = Object.values(this.people)
    const present = Math.max(...people.map(p => p.present))
    const start = present - years

    return people
      .filter(p => p.died >= start && p.died <= present)
      .filter(p => {
        const record = p.history.get({ tag: 'died' })
        if (isPopulatedArray(record)) {
          return record[0].tags.includes('assault')
        }
        return false
      })
      .length
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

  /**
   * Returns whether or not the community was facing any major problems, like
   * conflict, sickness, or lean times, in a given year.
   * @param year {number} - The year to check.
   * @returns {boolean} - `true` if the community was facing a major problem
   *   that year, or `false` if it did not.
   */

  hadProblems (year) {
    const record = this.history.get({ year })
    return isPopulatedArray(record) && (record[0].lean || record[0].sick || record[0].conflict)
  }

  /**
   * Returns the percentage of the past `years` years in which the community
   * faced one or more major problems.
   * @param years {number} - The number of years to go back (Default: `5`).
   * @returns {number} - the percentage of the past `years` years in which the
   *   community faced one or more major problems. This will be a value
   *   between 0 and 100.
   */

  hadProblemsRecently (years = 5) {
    const present = this.history.getLatest()
    const y = []
    for (let i = present - years + 1; i <= present; i++) y.push(this.hadProblems(i))
    return (y.filter(y => y === true).length / Math.min(years, Object.keys(this.history.record).length)) * 100
  }

  run () {
    console.log('running community...')
  }

  analyze () {
    return 'analyze community'
  }
}
