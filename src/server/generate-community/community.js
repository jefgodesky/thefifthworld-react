import random from 'random'
import { clone, get, isPopulatedArray } from '../../shared/utils'

export default class Community {
  constructor (data) {
    if (data) {
      Object.keys(data).forEach(key => {
        this[key] = clone(data[key])
      })
    }
    this.init()
  }

  /**
   * Initializes the community, either when it's created by the constructor, or
   * when it needs to run a second simulation because the first one failed.
   */

  init () {
    this.people = []
    this.polycules = []
    this.history = []
    const randomizer = random.normal(25, 1)
    if (!this.territory) this.territory = {}
    this.territory.yield = 0
    this.status = {
      discord: Math.floor(randomizer()),
      lean: false,
      sick: false,
      conflict: false
    }
  }

  /**
   * Adds a person to the community and returns that person's ID.
   * @param person {Person} - The person to add to the community.
   */

  add (person) {
    if (person && person.constructor.name === 'Person') {
      const index = `${Object.keys(this.people).length}`
      this.people[index] = person
      person.community = this
    }
  }

  /**
   * Returns the people who have not died or left as array.
   * @returns {Person[]} - An array of the people who have not yet died or left
   *   the community.
   */

  getCurrentPopulation () {
    return this.people.filter(p => !p.died && !p.left)
  }

  /**
   * Returns the people who have mastered a particular skill.
   * @param skill {string} - The name of the skill that you're interested in.
   * @returns {Person[]} - An array of the people who have mastered the
   *   given skill.
   */

  getMasters (skill) {
    const everyone = this.getCurrentPopulation()
    return everyone.filter(p => p.skills.mastered.includes(skill))
  }

  /**
   * Returns the most recent entries in the community's history.
   * @param years {number} - The number of entries to return. (Default: `5`)
   * @returns {Object[]} - An array of objects providing information about the
   *   most recent years in the community's history.
   */

  getRecentHistory (years = 5) {
    return isPopulatedArray(this.history)
      ? this.history.slice(Math.max(this.history.length - years, 0))
      : []
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
   * Returns whether or not the community is currently experiencing any major
   * problems, like conflict, sickness, or lean times.
   * @returns {boolean} - `true` if the community is experiencing any major
   *   problems, or `false` if it is not.
   */

  hasProblems () {
    return this.status && (this.status.lean || this.status.sick || this.status.conflict)
  }

  /**
   * Adjust the yield of the community's territory. It has a natural
   * regeneration rate equal to the community's carrying capacity, based on
   * whether or not they're hunter-gatherers. Then, we reduce that by the
   * number of people in the community (e.g., the community's ecological
   * footprint).
   */

  adjustYield () {
    const people = this.getCurrentPopulation()
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
    const people = this.getCurrentPopulation()
    const spf = people.length / capacity
    if (random.int(1, 100) < 5 * yf * spf) this.status.sick = true

    // Lean times makes it more likely that you get into a conflict
    if (random.int(1, 100) < yf) this.status.conflict = true
  }

  /**
   * See if the community has solved its problems.
   */

  solveProblems () {
    // If yield has risen to zero or higher, lean times are over
    const y = get(this, 'territory.yield')
    if (typeof y === 'number' && y >= 0) this.status.lean = false

    // Can you cure sickness?
    if (this.status.sick) {
      const chance = 50 + this.calculateHelp('Medicine', 10)
      if (random.int(1, 100) < chance) this.status.sick = false
    }

    // Can you end conflict?
    if (this.status.conflict) {
      const chance = 25 + this.calculateHelp('Deescalation', 10)
      if (random.int(1, 100) < chance) this.status.conflict = false
    }
  }

  /**
   * A lot of communities begin with monogamy as a norm. This can change
   * (and in fact, in most cases, will), but we can leave that up to the
   * history of the community and the people in it. While this is going on,
   * certain events, like drama in polycules consisting of three or more
   * people, might serve to reinforce the norm of monogamy in the minds of
   * the community. This method increases monogamy by 5%, if the community
   * still puts any stock in it.
   */

  reinforceMonogamy () {
    if (!this.traditions) this.traditions = { monogamy: 1 }
    const { monogamy } = this.traditions
    if (monogamy > 0) this.traditions.monogamy = Math.min(monogamy + 0.05, 1)
  }

  /**
   * A lot of communities begin with monogamy as a norm. This can change
   * (and in fact, in most cases, will), but we can leave that up to the
   * history of the community and the people in it. This method reduces the
   * community's faith in monogamy by 1%. This can be called any time something
   * happens that reduces the community's faith in monogamy. For example, each
   * year, each polycule with three or more people in it calls this method
   * once. So, for example, a community with five polycules of three people
   * each will reduce its faith in monogamy by 5% each year, reducing it from
   * 100% to zero in just 20 years.
   */

  reduceMonogamy () {
    if (!this.traditions) this.traditions = { monogamy: 0 }
    const { monogamy } = this.traditions
    if (monogamy > 0) this.traditions.monogamy = Math.max(monogamy - 0.01, 0)
  }
}
