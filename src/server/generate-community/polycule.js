import random from 'random'
import {between, get} from '../../shared/utils'
import Person from "./person";
import Community from "./community";

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
      this.love.push([ ...love, 1 ])
    } else {
      const arr = []
      for (let i = 0; i < this.people.length; i++) {
        const score = Polycule.findLove(person, this.people[i])
        this.love[i] = [ ...this.love[i], score ]
        arr.push(score)
      }
      this.love.push([ ...arr, 1 ])
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
        sum += this.love[i][j]
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
   * Find the love between two people.
   * @param a {Person} - The first Perosn object.
   * @param b {Person} - The second Person object.
   * @returns {number} - A love score from 0 to 1.
   */

  static findLove (a, b) {
    const distance = a.personality.distance(b.personality)
    const desire = random.int(-5, 5)
    return between((15 - (distance - desire)) / 15, 0, 1)
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
        if (dates[0].polycule.avg() > 0.4) {
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
