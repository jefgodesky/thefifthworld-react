import History from './history'
import Person from './person'

import { clone, isPopulatedArray } from '../../shared/utils'

export default class Polycule {
  constructor (...people) {
    this.people = []
    this.love = {}
    this.children = []
    this.active = true

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
   * @param community {Community} - The community that this polycule is a
   *   part of.
   */

  add (person, community) {
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
      if (community && community.people) {
        const newID = person.id
        this.people.forEach(id => {
          const person = community.people[id]
          if (person instanceof Person) {
            const event = id === newID
              ? ({ tags: [ 'polycule', 'joined' ], polycule: this.id, partners: this.people.filter(id => id !== person.id), size: this.people.length })
              : ({ tags: [ 'polycule', 'expanded' ], polycule: this.id, joined: newID, size: this.people.length })
            person.history.add(person.present, event)
          }
        })
      }
    }
  }

  /**
   * Remove a person from the polycule.
   * @param person {Person} - The person to remove.
   * @param community {Community} - The community that this polycule is a
   *   part of.
   */

  remove (person, community) {
    if (this.people.length <= 2) return this.breakup(community)
    this.people = this.people.filter(p => p !== person.id)
    delete this.love[person.id]
    this.people.forEach(id => {
      delete this.love[id][person.id]
    })
    delete person.polycule

    if (this.history && person.present) {
      const goneID = person.id
      const year = person.present
      this.history.add(year, { tags: [ 'contracted' ], members: clone(this.people) })
      person.history.add(year, { tags: [ 'polycule', 'removed' ], polycule: this.id })
      if (community && community.people) {
        this.people.forEach(id => {
          const person = community.people[id]
          if (person instanceof Person) {
            person.history.add(person.present, {
              tags: [ 'polycule', 'contracted' ],
              polycule: this.id,
              removed: goneID,
              partners: this.people.filter(id => id !== person.id),
              size: this.people.length
            })
          }
        })
      }
    }
  }

  /**
   * Breaks up the polycule.
   * @param community {Community} - The community that this polycule is a
   *   part of.
   */

  breakup (community) {
    const people = this.people.map(id => community.people[id]).filter(p => p instanceof Person)
    const identified = [ this.id, true ]
    people.forEach(p => { if (identified.includes(p.polycule)) delete p.polycule })
    this.active = false

    const year = Math.max(...people.map(p => p.present))
    const size = this.people.length
    if (!isNaN(year)) {
      this.history.add(year, { tags: [ 'breakup' ], partners: clone(this.people), size })
      people.forEach(person => {
        person.history.add(year, { tags: [ 'polycule', 'breakup' ], partners: this.people.filter(id => id !== person.id), size })
      })
    }
  }
}
