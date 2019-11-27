import Person from './person'
import random from 'random'
import tables from '../../data/community-creation'
import { get, clone, daysFromNow } from '../../shared/utils'
import { check } from './check'

/**
 * This class defines the behavior of the community in community creation.
 */

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
   * Returns an array of ID's for those members of the community who have not
   * yet died or left.
   * @returns {[number]} - An array of ID's.
   */

  getCurrentPopulation () {
    return Object.keys(this.people).filter(id => !this.people[id].died && !this.people[id].left)
  }

  /**
   * Sets the community's current status.
   */

  setStatus () {
    const { discord } = this.status
    const threshold = this.traditions && this.traditions.village ? 150 : 30
    const living = this.getCurrentPopulation()
    const overpopulated = living.length > threshold
    const eventTable = overpopulated
      ? tables.overpopulatedCommunityEvents
      : tables.normalCommunityEvents

    let roll = random.int(1, 100)
    for (let i = 0; i < discord; i++) {
      roll = Math.min(roll, random.int(1, 100))
    }
    const event = check(eventTable, roll)

    this.status.event = event
    const maxDiscord = Math.max(discord - 1, 10)
    let newDiscord = discord
    switch (event) {
      case 'conflict': newDiscord += 3; break
      case 'sickness': newDiscord += 2; break
      case 'lean': newDiscord += 1; break
      case 'peace': newDiscord -= 1; break
    }
    this.status.discord = Math.min(Math.max(0, newDiscord), maxDiscord)
  }

  /**
   * Adds a person to the community and returns that person's ID.
   * @param person {Person} - The person to add to the community.
   * @returns {number|boolean} - The ID for the person added, or `false` if it
   *   was not given a valid Person object.
   */

  addPerson (person) {
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
   * Adds a new founder to the community.
   * @param year {number} - The year the founder is born.
   */

  addFounder (year) {
    const founders = this.traditions && this.traditions.village ? 20 : 4
    const living = this.getCurrentPopulation()
    if (living.length < founders) {
      const num = random.int(0, founders / 4)
      for (let i = 0; i < num; i++) {
        const founder = new Person({ community: this, born: year })
        this.addPerson(founder)
      }
    }
  }

  /**
   * Runs a year in the community.
   * @param year {number} - The year to run.
   * @param founding {boolean} - If `true`, then this year is in the founding
   *   period, and founders can be added to the community. (Default: `false`)
   */

  runYear (year, founding = false) {
    this.setStatus()

    const { event } = this.status
    const table = event === 'conflict'
      ? tables.personalEventsInConflict
      : event === 'sickness'
        ? tables.personalEventsInSickness
        : event === 'lean'
          ? tables.personalEventsInLeanTimes
          : tables.personalEventsAtPeace

    const pop = this.getCurrentPopulation()
    pop.forEach(id => {
      const person = this.people[id]
      person.event = check(table, random.int(1, 100))
      person.havingBaby = false
    })
    pop.forEach(id => this.people[id].checkBabies(this, year))
    pop.forEach(id => this.people[id].age(this, year))
    if (founding) this.addFounder(year)
    const current = this.getCurrentPopulation()
    this.chronicle.push(Object.assign({}, { year, population: current.length }, this.status))
  }

  /**
   * Run a simulation of 150 years of the community's history.
   */

  run () {
    this.init()

    // The present of the Fifth World is 144,000 days from today (one b'ak'tun in
    // the Maya Long Count calendar). Our simulation begins 150 years before that
    // (144000 - (150 * 365)).
    const fromDate = daysFromNow(89250)
    const toDate = daysFromNow(144000)
    const fromYear = fromDate.getFullYear()
    const toYear = toDate.getFullYear()

    // Cycle through years
    for (let year = fromYear; year < toYear; year++) {
      const founding = year < fromYear + 25
      this.runYear(year, founding)
    }

    // If we end up with a community that isn't viable, run it again.
    const carryingCapacity = this.traditions && this.traditions.village ? 150 : 30
    const pop = this.getCurrentPopulation()
    if (pop.length < carryingCapacity / 2) this.run()
  }

  /**
   * Runs some methods to analyze the community. Intended for debugging and
   * development.
   * @returns {Object} - Object with information about the community.
   */

  analyze () {
    const members = Object.values(this.people)
    const current = this.getCurrentPopulation()
    const agesAtDeath = members.filter(p => p.born && p.died).map(p => p.died - p.born)
    const avgLifeExpectancy = agesAtDeath.reduce((acc, curr) => acc + curr, 0) / agesAtDeath.length
    const numKids = members.map(m => m.children.length)
    const avgNumKids = numKids.reduce((acc, curr) => acc + curr, 0) / numKids.length
    const howManyHaveKids = members.filter(m => m.children.length > 0).length
    const howManyHavePartners = members.filter(m => m.partners.length > 0).length
    const howManyLeft = members.filter(m => m.left).length
    const howManyDeadKids = members.filter(m => m.died && m.died - m.born < 10).length
    const oldestPerson = members.reduce((acc, curr) => {
      if (!curr.left) {
        const end = curr && curr.died ? curr.died : daysFromNow(144000).getFullYear()
        const age = end - curr.born
        return Math.max(acc, age)
      } else {
        return acc
      }
    }, 0)

    const community = this
    const avgPartnerDistance = members.map(m => {
      if (m.partners.length > 0) {
        const partners = m.partners.map(p => community.get(p.id) || null)
        return partners.length > 0
          ? partners
            .filter(p => p !== null)
            .map(p => m.personalityDistance(p))
            .reduce((acc, curr) => acc + curr, 0) / partners.length
          : null
      } else {
        return null
      }
    }).filter(p => p !== null).reduce((acc, curr) => acc + curr, 0) / members.length

    const yearsPeace = this.chronicle.filter(y => y.event === 'peace').length
    const yearsConflict = this.chronicle.filter(y => y.event === 'conflict').length
    const yearsLean = this.chronicle.filter(y => y.event === 'lean').length
    const yearsSick = this.chronicle.filter(y => y.event === 'sickness').length

    const favoredSkill = this.traditions && this.traditions.skill ? this.traditions.skill : false
    const masteredFavoredSkill = favoredSkill
      ? members.filter(p => p.skills.mastered.includes(favoredSkill)).length
      : 0
    const masteredFavoredSkillPercent = `${Math.round((masteredFavoredSkill / members.length) * 100)}%`

    const avgOpenness = members.reduce((acc, curr) => acc + curr.personality.openness, 0) / members.length
    const avgConscientiousness = members.reduce((acc, curr) => acc + curr.personality.conscientiousness, 0) / members.length
    const avgExtraversion = members.reduce((acc, curr) => acc + curr.personality.extraversion, 0) / members.length
    const avgAgreeableness = members.reduce((acc, curr) => acc + curr.personality.agreeableness, 0) / members.length
    const avgNeuroticism = members.reduce((acc, curr) => acc + curr.personality.neuroticism, 0) / members.length

    const littlePeople = members.filter(m => m.body.achondroplasia).length
    const geniuses = members.filter(m => m.intelligence > 3).length
    const neurodivergent = members.filter(m => m.neurodivergent).length
    const psychopaths = members.filter(m => m.psychopath).length

    const countGenerations = person => {
      if (!person.mother || !person.father) {
        return 1
      } else {
        const mother = person.mother ? countGenerations(this.people[person.mother]) : 0
        const father = person.father ? countGenerations(this.people[person.father]) : 0
        return Math.max(mother, father) + 1
      }
    }

    const generations = members.map(m => countGenerations(m))
    const deepestGeneration = generations.reduce((acc, curr) => Math.max(acc, curr), 0)

    this.chronicle.forEach(rec => {
      console.log(`${rec.year}\t${rec.population}\t${rec.discord}`)
    })

    return {
      total: members.length,
      population: current.length,
      avgNumKids,
      howManyHaveKids,
      howManyHavePartners,
      howManyLeft,
      howManyDeadKids,
      deepestGeneration,
      avgLifeExpectancy,
      avgPartnerDistance,
      oldestPerson,
      yearsPeace,
      yearsConflict,
      yearsLean,
      yearsSick,
      favoredSkill,
      masteredFavoredSkill,
      masteredFavoredSkillPercent,
      avgOpenness,
      avgConscientiousness,
      avgExtraversion,
      avgAgreeableness,
      avgNeuroticism,
      littlePeople,
      geniuses,
      neurodivergent,
      psychopaths
    }
  }
}
