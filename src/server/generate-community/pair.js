import random from 'random'
import Community from './community'
import Person from './person'
import { get } from '../../shared/utils'

export default class Pair {
  constructor (a, b, save = true) {
    const aIsPerson = a && a.constructor && a.constructor.name === 'Person'
    const bIsPerson = b && b.constructor && b.constructor.name === 'Person'
    if (aIsPerson && bIsPerson) {
      const dist = a.personality.distance(b.personality)
      const desire = random.int(-5, 5)
      this.love = (dist + desire) * -1 // Negative scores being better seems counter-intuitive...
      this.a = a
      this.b = b
      if (save) this.save()
    } else {
      return false
    }
  }

  /**
   * Add the pair to each of the person objects involved.
   */

  save () {
    if (this.a && this.b) {
      this.a.pairs = this.a.pairs && Array.isArray(this.a.pairs)
        ? [ ...this.a.pairs, this ]
        : [ this ]
      this.b.pairs = this.b.pairs && Array.isArray(this.b.pairs)
        ? [ ...this.b.pairs, this ]
        : [ this ]
    }
  }

  /**
   * Finds potential partners for the character, then determines which of those
   * partners to choose based on the love scores for each.
   * @param person {Person} - The person finding a relationship.
   * @param community {Community} - The community object.
   * @param year {number} - The year this is happening in.
   * @returns {string|boolean} - The community ID of the partner created, or
   *   `false` if something went wrong.
   */

  static form (person, community, year) {
    const { born } = person
    if (person && person.constructor && person.constructor.name === 'Person' && born && typeof born === 'number') {
      const numGenders = get(community, 'traditions.genders') || 3
      const genders = person.sexuality.getGenderPreferences(numGenders)
      if (genders.length > 0) {
        const candidates = genders.map(gender => {
          const age = year - born
          const gap = Math.floor((age / 2) - 7)
          const candidateBorn = year - random.int(age - gap, age + gap)
          const candidate = new Person({ born: candidateBorn, gender })
          return candidate
        })

        // Age up candidates
        candidates.forEach((candidate, i) => {
          const defaultCommunity = new Community()
          for (let y = candidate.body.born; y < year; y++) candidate.age(defaultCommunity, y, true)
        })

        const pairs = candidates
          .map(candidate => new Pair(person, candidate, false))
          .sort((a, b) => a.love - b.love)
        const pair = pairs.shift()
        if (community.add(pair.b)) {
          pair.save()
          return true
        }
      }
    }
    return false
  }

  /**
   * Given an array of pairs and a person's ID, returns an array of partners
   * who do not have that ID. Used in turning an array of pairs that a person
   * is in into an array of partners that person has.
   * @param pairs {Pair[]} - An array of pairs.
   * @param id {number} - An ID to exclude.
   * @returns {Person[]} - An array of those partners who do not have the
   *   given ID.
   */

  static getPartners (pairs, id) {
    return Array.isArray(pairs) ? pairs.map(pair => pair.a.id === id ? pair.b : pair.a) : []
  }
}
