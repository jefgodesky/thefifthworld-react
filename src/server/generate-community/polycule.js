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
    if (year) {
      this.history.add(year, { tags: [ 'formed' ], members: clone(this.people) })
      people.forEach(person => {
        person.history.add(year, {
          tags: [ 'polycule', 'formed' ],
          partners: people.filter(p => p !== person).map(p => p.id)
        })
      })
    }
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

  /**
   * Remove a person from the polycule.
   * @param person {Person} - The person to remove.
   */

  remove (person) {
    this.people = this.people.filter(p => p !== person.id)
    delete this.love[person.id]
    this.people.forEach(id => {
      delete this.love[id][person.id]
    })
    delete person.polycule

    if (this.history && person.present) {
      this.history.add(person.present, { tags: [ 'contracted' ], members: clone(this.people) })
    }
  }
}
