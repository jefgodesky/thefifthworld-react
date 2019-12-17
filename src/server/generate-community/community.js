import random from 'random'
import { clone, get, daysFromNow } from '../../shared/utils'

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
    this.chronicle = []
    const randomizer = random.normal(25, 1)
    this.status = {
      discord: Math.floor(randomizer())
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
}
