import random from 'random'
import { clone, get, between, isPopulatedArray, daysFromNow } from '../../shared/utils'

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
    this.people = {}
    this.history = []
    const randomizer = random.normal(25, 1)
    if (!this.territory) this.territory = {}
    this.territory.yield = 0
    this.status = {
      discord: Math.floor(randomizer()),
      problems: []
    }
  }

  /**
   * Return a Person object from the community, or one property of that person.
   * @param id {number} - The ID of the person in the community's `people`
   *   array.
   * @param selector {string} - (Optional) A string representing the property
   *   (or nested properties) that you would like to find for this person. For
   *   example, Person.findParent uses `'body.fertility'` to find the fertility
   *   of each of a person's partners so they can be sorted. (Default `null`)
   * @returns {*} - If the ID is not present in the array, it returns
   *   undefined. If the ID was found and no selector was given, it returns the
   *   Person object. If the ID was found and a selector was given and present
   *   in the Person object, it returns that property. If the ID was found and
   *   the selector given was not present in the Person object, it returns
   *   undefined.
   */

  get (id, selector = null) {
    const person = this.people && this.people[id] ? this.people[id] : undefined
    return selector ? get(person, selector) : person
  }

  /**
   * Adds a person to the community and returns that person's ID.
   * @param person {Person} - The person to add to the community.
   * @returns {number|boolean} - The ID for the person added, or `false` if it
   *   was not given a valid Person object.
   */

  add (person) {
    if (person && person.constructor.name === 'Person') {
      const index = `${Object.keys(this.people).length}`
      this.people[index] = person
      person.id = index
      return index
    } else {
      return false
    }
  }

  /**
   * Returns the people who have not died or left as array.
   * @returns {Person[]} - An array of the people who have not yet died or left
   *   the community.
   */

  getCurrentPopulation () {
    return Object.keys(this.people)
      .map(key => this.people[key])
      .filter(p => !p.died && !p.left)
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
}
