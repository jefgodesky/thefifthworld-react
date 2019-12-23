import random from 'random'
import Community from './community'
import Person from './person'
import { get } from '../../shared/utils'

export default class Polycule {
  constructor (...people) {
    this.people = []
    this.love = []
    for (let i = 0; i < people.length; i++) this.add(people[i])
  }

  /**
   * Add a person to the polycule.
   * @param person {Person} - The Person to add to the polycule.
   * @param love {number[]} - An array of love scores to use.
   */

  add (person, love) {
    if (love) {
      this.love.push([ ...love, null ])
    } else {
      const arr = []
      for (let i = 0; i < this.people.length; i++) {
        const score = random.int(0, 50)
        this.love[i] = [ ...this.love[i], score ]
        arr.push(score)
      }
      this.love.push([ ...arr, null ])
    }

    this.people.push(person)
  }

  /**
   * Remove a person from the polycule.
   * @param person {Person} - The person to remove.
   */

  remove (person) {
    const remaining = this.people.filter(p => p !== person)
    const tmp = new Polycule(...remaining)
    this.people = tmp.people
    this.love = tmp.love
  }

  /**
   * Returns an average for all of the love in the polycule.
   * @returns {number} - The average love score in the polycule.
   */

  avg () {
    let sum = 0
    for (let i = 0; i < this.people.length; i++) {
      for (let j = 0; j < i; j++) {
        const distance = this.people[i].personality.distance(this.people[j].personality)
        const compatibility = ((7 - distance) / 7) * 100
        sum += compatibility + this.love[i][j]
      }
    }
    return sum / this.people.length
  }

  /**
   * Save this polycule to each of the people in it.
   */

  commit () {
    this.people.forEach(person => {
      person.polycule = this
    })
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
   * Reevaluate the love in relationships based on current personality traits.
   */

  reevaluate () {
    for (let i = 0; i < this.people.length; i++) {
      for (let j = 0; j < i; j++) {
        const distance = this.people[i].personality.distance(this.people[j].personality)
        const delta = distance > 7 ? -5 : 5
        this.love[i][j] += delta
        this.love[j][i] += delta
      }
    }
  }

  /**
   * Form a new polycule.
   * @param person {Person} - The person searching for a relationship.
   * @param community {Community} - The community that this person belongs to.
   * @param year {number} - The year in which this person forms this
   *   relationship.
   */

  static form (person, community, year) {
    const age = person.body.getAge(year)
    if (age && age > 15) {
      const numGenders = get(community, 'traditions.genders') || 3
      const meet = Math.ceil(person.personality.chance('extraversion') / 10)
      const genders = person.sexuality.getGenderPreferences(numGenders, meet)
      if (genders.length > 0) {
        const candidates = genders.map(gender => {
          const gap = Math.floor((age / 2) - 7)
          const candidateBorn = year - random.int(age - gap, age + gap)
          const candidate = new Person({ born: candidateBorn, gender })
          const defaultCommunity = new Community()
          for (let y = candidateBorn; y < year; y++) candidate.age(defaultCommunity, y, true)
          return candidate
        })
        const dates = candidates.map(candidate => ({ candidate, polycule: new Polycule(person, candidate) }))
        dates.sort((a, b) => b.polycule.avg() - a.polycule.avg())
        if (dates[0].polycule.avg() > 30) {
          const { candidate, polycule } = dates[0]
          community.add(candidate)
          polycule.commit()
          return polycule
        }
      }
    }
    return false
  }
}
