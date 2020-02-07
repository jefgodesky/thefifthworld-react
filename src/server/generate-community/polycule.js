import random from 'random'
import Community from './community'
import History from './history'
import Person from './person'
import { isPopulatedArray, allTrue } from '../../shared/utils'

export default class Polycule {
  constructor (...people) {
    this.people = []
    this.love = []
    this.children = []

    for (let i = 0; i < people.length; i++) this.add(people[i])

    this.getCommunity()
    const year = this.getPresent()
    this.history = new History()
    if (year) this.history.add({ year, tags: [ 'formed' ], size: people.length })
  }

  /**
   * Get the community that this polycule belongs to by looking at its members.
   */

  getCommunity () {
    const communities = this.people.map(p => p.community).filter(c => c && c.constructor && c.constructor.name === 'Community')
    this.community = isPopulatedArray(communities) ? communities[0] : undefined
  }

  /**
   * Returns the present year for the current state of the polycule, as
   * determined by finding the latest present for each of the members.
   * @returns {number} - The present year for the polycule.
   */

  getPresent () {
    const years = this.people.map(p => p.present).filter(y => typeof y === 'number')
    return isPopulatedArray(years) ? Math.max(...years) : undefined
  }

  /**
   * Add a person to the polycule.
   * @param person {Person} - The Person to add to the polycule.
   */

  add (person) {
    const arr = []
    for (let i = 0; i < this.people.length; i++) {
      this.love[i] = [ ...this.love[i], 1 ]
      arr.push(1)
    }

    this.love.push([ ...arr, null ])
    this.people.push(person)
    if (!this.community) this.getCommunity()

    if (this.history) {
      const year = this.getPresent()
      if (year) this.history.add({year, tags: ['expanded'], size: this.people.length})
    }
  }

  /**
   * Save this polycule to each of the people in it.
   */

  commit () {
    this.people.forEach(person => {
      person.polycule = this
    })

    if (this.community) this.community.addPolycule(this)
  }

  /**
   * Remove a person from the polycule.
   * @param person {Person} - The person to remove.
   */

  remove (person) {
    const year = this.getPresent()
    if (this.people.includes(person)) {
      if (this.people.length > 2) {
        // Remove one person, but the polycule remains
        this.love = this.getLoveWithout(person)
        this.people = this.people.filter(p => p !== person)
        person.polycule = undefined
        if (year) this.history.add({ year, tags: [ 'reduced' ], size: this.people.length })
      } else {
        // We're down to just two people, so this is the end of the polycule.
        this.breakup(year)
      }
    }
  }

  /**
   * Break up the polycule.
   * @param year {number} - The year in which the polycule breaks up.
   */

  breakup (year) {
    this.love = undefined
    this.people.forEach(p => { p.polycule = undefined })
    this.people = undefined
    if (this.community) this.community.removePolycule(this)
    if (year) this.history.add({year, tags: [ 'dissolved' ] })
  }

  /**
   * Run encounters between each of the members of the polycule to see how
   * love scores change.
   */

  runEncounters () {
    for (let i = 0; i < this.people.length; i++) {
      for (let j = 0; j < i; j++) {
        if (i !== j) {
          const encounter = this.people[i].encounter(this.people[j])
          this.love[i][j] += encounter.self ? 1 : -1
          this.love[j][i] += encounter.other ? 1 : -1
        }
      }
    }
  }

  /**
   * Returns all of the members of the polycule other than `self`.
   * @param self {Person} - The person to exclude (i.e., return the array of
   *   self's partners, not counting self as her own partner).
   * @returns {Person[]} - The people in the polycule, excluding `self`. If
   *   `self` is not part of the polycule, this will equal the members of the
   *   polycule.
   */

  getOthers (self) {
    return this.people.filter(p => p !== self)
  }

  /**
   * Return the subset of the given array that are people in the polycule.
   * @param arr {[Person]} - An array of Person objects.
   * @returns {[Person]} - An array that contains only those Person objects
   *   from the `arr` array that are also members of the polycule. The order
   *   from the `arr` array is preserved.
   */

  getPolyculeMembers (arr) {
    return arr.filter(p => this.people.includes(p))
  }

  /**
   * Returns an average for all of the love in the polycule.
   * @param without {Person} - If provided, calculates what the average love in
   *   the polycule would be without this person.
   * @returns {number} - The average love score in the polycule.
   */

  avg (without) {
    const people = without ? this.people.filter(p => p !== without) : this.people
    const love = without ? this.getLoveWithout(without) : this.love
    let sum = 0
    for (let i = 0; i < people.length; i++) {
      for (let j = 0; j < i; j++) {
        if (!isNaN(love[i][j])) sum += love[i][j]
      }
    }
    const connections = (people.length * (people.length - 1)) / 2
    return connections === 0 ? null : sum / connections
  }

  /**
   * Returns the love value between two people in the polycule.
   * @param a {Person} - One person in the polycule.
   * @param b {Person} - A second person in the polycule.
   * @returns {int|null} - Returns the love score between `a` and `b` if they
   *   are both people in the polycule. If one or both are not people in the
   *   polycule, it returns `null`.
   */

  getLoveBetween (a, b) {
    const aindex = this.people.indexOf(a)
    const bindex = this.people.indexOf(b)
    return aindex > -1 && bindex > -1 ? this.love[aindex][bindex] : null
  }

  /**
   * Return what the love matrix would be without a given person.
   * @param person {Person} - The person to exclude.
   * @returns {number[]|boolean} - Returns what the love matrix would be
   *   without that person if she's in the polycule, or `false` if she isn't
   *   in the polycule to begin with.
   */

  getLoveWithout (person) {
    const matrix = []
    const index = this.people.indexOf(person)
    if (index > -1) {
      for (let i = 0; i < this.people.length; i++) {
        if (i !== index) {
          const row = []
          for (let j = 0; j < this.people.length; j++) {
            if (j !== index) {
              row.push(this.love[i][j])
            }
          }
          matrix.push(row)
        }
      }
    }
    return index > -1 ? matrix : false
  }

  /**
   * Returns an object with information on hypotheticals of what the polycule
   * would be like in each instance where one of the members were removed.
   * @param threshold {number} - The threshold delta on the change to the
   *   polycule's average love score to recommend removing someone.
   *   (Default: `30`).
   * @returns {{index: number, recommendation: boolean, deltas: []}} - An
   *   object representing what possible future scenarios would be like. The
   *   `deltas` property is an array of deltas, or how the polycule's average
   *   love score would change if the person with the corresponding index
   *   number were removed from it. The `index` property provides the index of
   *   the person with the highest delta (i.e., the person whose removal would
   *   raise the polycule's average love score by the highest amount). The
   *   `recommendation` property is a boolean indicating whether or not that
   *   person should be removed from the polycule, based on the threshold
   *   provided (i.e., if removing this person would raise the polycule's
   *   average love score by an amount greater than the threshold, then the
   *   `recommendation` is `true`).
   */

  partnerDelta (threshold = 30) {
    const curr = this.avg()
    const deltas = []
    this.people.forEach(person => {
      deltas.push(this.avg(person) - curr)
    })
    const max = Math.max(...deltas)
    return {
      deltas,
      index: deltas.indexOf(max),
      recommendation: max > threshold
    }
  }

  /**
   * Determines if the people in the polycule would like to have a child.
   * @param community {Community} - The Community object.
   * @param year {number} - The year in which they're making this decision.
   * @returns {boolean} - Returns `true` if the polycule decides to try to have
   *   a child, or `false` if they decide not to.
   */

  wantChild (community, year) {
    const potentialFathers = this.people.filter(p => p.body.isFertile('Male'))
    const potentialMothers = this.people.filter(p => p.body.isFertile('Female'))
    if (potentialFathers.length > 0 && potentialMothers.length > 0) {
      // The more open to experience you are, the fewer years of peace you
      // need to convince you to have a child, and each member of the polycule
      // needs to agree, so we can just look at the least open person in it.
      const recent = community.getRecentHistory(10)
      const openness = this.people.map(p => p.personality.chance('openness'))
      const leastOpen = Math.min(...openness)
      const peaceNeeded = Math.ceil((100 - leastOpen) / 10)
      const goodYears = recent
        .slice(0, peaceNeeded)
        .map(y => !y.lean && !y.conflict && !y.sick)
      return allTrue(goodYears)
    }
    return false
  }

  /**
   * Sees if the polycule can produce a child.
   * @param community {Community} - The Community object.
   * @param year {number} - The year in which the polycule is trying
   *   to conceive.
   */

  haveChild (community, year) {
    const potentialFathers = this.people
      .filter(p => p.body.isFertile('Male'))
      .sort((a, b) => b.body.fertility - a.body.fertility)
    const potentialMothers = this.people
      .filter(p => p.body.isFertile('Female'))
      .sort((a, b) => b.body.fertility - a.body.fertility)
    const mother = potentialMothers.length > 0 ? potentialMothers[0] : null
    const father = potentialFathers.length > 0 ? potentialFathers[0] : null
    const chance = mother && father
      ? Math.min(mother.body.fertility, father.body.fertility)
      : 0
    if (random.int(1, 125) < chance) {
      const child = new Person({ mother, father, born: year })
      this.children.push(child)
      child.parents = this
    }
  }
}
