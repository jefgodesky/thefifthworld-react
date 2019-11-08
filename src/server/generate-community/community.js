import Person from './person'
import random from 'random'
import tables from '../../data/community-creation'
import { clone, daysFromNow } from '../../shared/utils'
import { check } from './check'

/**
 * This class defines the behavior of the community in community creation.
 */

export default class Community {
  constructor (data) {
    Object.keys(data).forEach(key => {
      this[key] = clone(data[key])
    })

    if (!this.people) this.people = {}
    if (!this.chronicle) this.chronicle = []
    const randomizer = random.normal(7, 1)
    this.status = {
      discord: Math.floor(randomizer())
    }
  }

  /**
   * Returns an array of ID's for those members of the community who have not
   * yet been marked as dead.
   * @returns {[number]} - An array of ID's.
   */

  getLivingPopulation () {
    let living = []
    Object.keys(this.people).forEach(id => {
      if (!this.people[id].died) living.push(id)
    })
    return living
  }

  /**
   * Sets the community's current status.
   */

  setStatus () {
    const { discord } = this.status
    const threshold = this.traditions && this.traditions.village ? 150 : 30
    const living = this.getLivingPopulation()
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
   * @returns {number} - The ID for the person added.
   */

  addPerson (person) {
    const count = Object.keys(this.people).length
    this.people[count] = person
    return `${count}`
  }

  /**
   * Adds a new founder to the community.
   * @param year {number} - The year the founder is born.
   */

  addFounder (year) {
    const founders = this.traditions && this.traditions.village ? 20 : 4
    const living = this.getLivingPopulation()
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
    const living = this.getLivingPopulation()
    living.forEach(id => this.people[id].age(this, year))
    if (founding) this.addFounder(year)
    this.chronicle.push(Object.assign({}, { year }, this.status))
  }

  /**
   * Run a simulation of 150 years of the community's history.
   */

  run () {
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
  }

  /**
   * Runs some methods to analyze the community. Intended for debugging and
   * development.
   * @returns {Object} - Object with information about the community.
   */

  analyze () {
    const members = Object.values(this.people)
    const living = this.getLivingPopulation()
    const agesAtDeath = members.filter(p => p.born && p.died).map(p => p.died - p.born)
    const avgLifeExpectancy = agesAtDeath.reduce((acc, curr) => acc + curr, 0) / agesAtDeath.length

    const yearsPeace = this.chronicle.filter(y => y.event === 'peace').length
    const yearsConflict = this.chronicle.filter(y => y.event === 'conflict').length
    const yearsLean = this.chronicle.filter(y => y.event === 'lean').length
    const yearsSick = this.chronicle.filter(y => y.event === 'sickness').length

    const favoredSkill = this.traditions && this.traditions.skill ? this.traditions.skill : false
    const masteredFavoredSkill = favoredSkill
      ? Object.values(this.people).filter(p => p.skills.mastered.includes(favoredSkill)).length
      : 0
    const masteredFavoredSkillPercent = `${Math.round((masteredFavoredSkill / members.length) * 100)}%`

    return {
      total: members.length,
      population: living.length,
      avgLifeExpectancy,
      yearsPeace,
      yearsConflict,
      yearsLean,
      yearsSick,
      favoredSkill,
      masteredFavoredSkill,
      masteredFavoredSkillPercent
    }
  }
}
