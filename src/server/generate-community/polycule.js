import History from './history'

import { clone, isPopulatedArray } from '../../shared/utils'

export default class Polycule {
  constructor (...people) {
    this.people = []
    this.love = {}
    this.children = []

    for (let i = 0; i < people.length; i++) this.add(people[i])

    this.history = new History()
    const years = people.map(p => p.present).filter(y => !isNaN(y))
    const year = isPopulatedArray(years) ? years[0] : undefined
    if (year) this.history.add(year, { tags: [ 'formed' ], members: clone(this.people) })
  }

  /**
   * Add a person to the polycule.
   * @param person {Person} - The person to add to the polycule.
   */

  add (person) {
    const newLove = {}
    this.people.forEach(id => {
      newLove[id] = 1
      this.love[id][person.id] = 1
    })
    this.love[person.id] = newLove
    this.people.push(person.id)
    person.polycule = this.id || true

    if (this.history && person.present) {
      this.history.add(person.present, { tags: [ 'expanded' ], members: clone(this.people) })
    }
  }
}
