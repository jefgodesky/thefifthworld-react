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
    if (this.people.includes(person)) {
      this.love = this.getLoveWithout(person)
      this.people = this.people.filter(p => p !== person)
      person.polycule = undefined
    }
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
        const distance = people[i].personality.distance(people[j].personality)
        const compatibility = ((7 - distance) / 7) * 100
        if (love[i][j] !== null) sum += compatibility + love[i][j]
      }
    }
    const connections = (people.length * (people.length - 1)) / 2
    return sum / connections
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

    // Derive a threshold based on how agreeable everyone in the polycule is.
    // If someone is pulling down the polycule's average love score by a number
    // greater than that average agreeableness, then whoever is contributing
    // the most to that state of affairs is removed.

    const threshold = this.people.map(p => p.personality.chance('agreeableness') / 2)
    const avgThreshold = threshold.reduce((acc, curr) => acc + curr, 0) / threshold.length
    const evaluation = this.partnerDelta(avgThreshold)
    if (evaluation.recommendation) this.remove(this.people[evaluation.index])
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
