import random from 'random'

import History from './history'
import Person from './person'

import { getCrimes } from './crime'
import { pickRandom } from './utils'
import { get, clone, isPopulatedArray, between } from '../../shared/utils'

export default class Community {
  constructor (data) {
    if (data) {
      Object.keys(data).forEach(key => {
        this[key] = clone(data[key])
      })
    }

    // At the very least, we're going to need to track the yield of the
    // community's territory.
    if (!this.territory) this.territory = {}
    if (!this.territory.yield) this.territory.yield = 0

    this.people = {}
    this.history = new History()
    this.status = { lean: false, sick: false, conflict: false }
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
   * Returns the people who have mastered a particular skill.
   * @param skill {string} - The name of the skill that you're interested in.
   * @returns {Person[]} - An array of the people who have mastered the
   *   given skill.
   */

  getMasters (skill) {
    const everyone = this.getPeople()
    return everyone.filter(p => p.skills.mastered.includes(skill))
  }

  /**
   * Pick a random person in the community.
   * @param except {Person} - Individuals to not pick.
   * @returns {Person|boolean} - A randomly selected person from the community,
   *   or `false` if the exceptions don't leave anyone.
   */

  pickRandom (...except) {
    const everybody = this.getPeople()
    const candidates = everybody.filter(p => !except.includes(p))
    if (candidates.length > 0) {
      return pickRandom(candidates)
    } else {
      return false
    }
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
   * Calculates the chance for a community to achieve something where the
   * skills they've mastered can make a difference. This is subject to
   * diminishing marginal returns, though, so each additional helper adds only
   * 75% of what the previous one did.
   * @param skill {string} - The relevant skill to help.
   * @param base {number} - How much the first helper adds to the chances of
   *   success.
   * @returns {number} - The chance of success with the help of everyone in the
   *   community who has mastered the relevant skill.
   */

  calculateHelp (skill, base) {
    const help = []
    const helpers = this.getMasters(skill)
    let contribution = base
    for (let i = 0; i < helpers.length; i++) {
      help.push(contribution)
      contribution = contribution * 0.75
    }
    return help.reduce((acc, curr) => acc + curr, 0)
  }

  /**
   * Adjust the yield of the community's territory. It has a natural
   * regeneration rate equal to the community's carrying capacity, based on
   * whether or not they're hunter-gatherers. Then, we reduce that by the
   * number of people in the community (e.g., the community's ecological
   * footprint).
   */

  adjustYield () {
    const people = this.getPeople()
    const base = get(this, 'traditions.village') ? 150 : 30
    this.territory.yield += base - people.length
  }

  /**
   * See if new problems develop.
   */

  newProblems () {
    // If yield has dropped to negative numbers, you're facing lean times
    const y = get(this, 'territory.yield')
    if (typeof y === 'number' && y < 0) this.status.lean = true
    const yf = this.status.lean ? 2 : 1

    // Lean times and more people make it more likely that you suffer sickness
    const village = get(this, 'traditions.village')
    const capacity = village === true ? 150 : 30
    const spf = this.getPeople().length / capacity
    if (random.int(1, 100) < 5 * yf * spf) this.status.sick = true

    // Lean times makes it more likely that you get into a conflict
    if (random.int(1, 100) < yf) this.status.conflict = true
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
    const num = Math.min(years, Object.keys(this.history.record).length)
    return num > 0 ? (y.filter(y => y === true).length / num) * 100 : 0
  }

  /**
   * Generate some number of random strangers.
   */

  generateStrangers () {
    const people = this.getPeople()
    const population = people.length
    const maxYear = Math.max(...people.map(p => p.present))
    const present = maxYear === -Infinity ? new Date().getFullYear() : maxYear
    const min = Math.floor(Math.max(5, population / 8))
    const max = Math.ceil(Math.max(10, population / 4))
    const num = random.int(min, max)
    this.strangers = []
    for (let i = 0; i < num; i++) {
      const age = random.int(16, 65)
      const born = present - age
      const stranger = new Person({ born })
      for (let y = born; y <= present; y++) stranger.age()
      this.strangers.push(stranger)
    }
  }

  /**
   * Judge someone who was discovered committing a crime (sabotage, assault, or
   * murder). Decides if this person needs to be exiled from the community.
   * @param accused {Person} - The person who committed the crime.
   * @param report {Object} - An object detailing the incident.
   * @returns {boolean} - `true` if the community decides to exile this person,
   *   or `false` if they decide not to.
   */

  judge (accused, report) {
    const record = [ ...getCrimes(accused), report ]
    const known = record.filter(r => r.discovered)
    const counts = { murder: 0, assault: 0, attempted: 0, sabotage: 0, impact: 0 }

    known.forEach(entry => {
      if (entry.tags.includes('murder') && entry.succeeded) {
        counts.murder++
      } else if (entry.tags.includes('murder') || (entry.tags.includes('assault') && entry.succeeded)) {
        counts.assault++
      } else if (entry.tags.includes('assault')) {
        counts.attempted++
      } else if (entry.tags.includes('sabotage')) {
        counts.sabotage++
        counts.impact += entry.impact
      }
    })

    const murder = counts.murder ? Math.pow(50, counts.murder) : 0
    const assault = counts.assault ? Math.pow(25, counts.assault) : 0
    const attempted = counts.attempted ? Math.pow(10, counts.attempted) : 0
    const sabotage = counts.sabotage ? Math.pow(counts.impact, counts.sabotage) : 0
    const prosecution = between(murder + assault + attempted + sabotage, 0, 95)
    return random.int(1, 100) < prosecution
  }

  run () {
    console.log('running community...')
  }

  analyze () {
    return 'analyze community'
  }
}
