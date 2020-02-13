import random from 'random'
import History from './history'
import Person from './person'
import { clone, daysFromNow, get, isPopulatedArray } from '../../shared/utils'

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

  init (year) {
    this.people = []
    this.polycules = []
    this.present = year
    this.history = new History()
    const randomizer = random.normal(25, 1)
    if (!this.territory) this.territory = {}
    this.territory.yield = 0
    this.status = {
      discord: Math.floor(randomizer()),
      lean: false,
      sick: false,
      conflict: false
    }
  }

  /**
   * Adds a person to the community.
   * @param person {Person} - The person to add to the community.
   */

  add (person) {
    if (person && person.constructor && person.constructor.name === 'Person') {
      this.people.push(person)
      person.community = this
    }
  }

  /**
   * Adds a polycule to the community.
   * @param polycule {Polycule} - The Polycule object to add to the community.
   */

  addPolycule (polycule) {
    if (!this.polycules || !Array.isArray(this.polycules)) {
      this.polycules = [ polycule ]
    } else {
      this.polycules = [ ...this.polycules, polycule ]
    }
  }

  /**
   * Removes a polycule from the community.
   * @param polycule {Polycule} - The Polycule object to remove from the
   *   community.
   */

  removePolycule (polycule) {
    if (!this.polycules || !Array.isArray(this.polycules)) {
      this.polycules = []
    } else {
      this.polycules = this.polycules.filter(p => p !== polycule)
    }
  }

  /**
   * Returns the people who have not died or left as array.
   * @returns {Person[]} - An array of the people who have not yet died or left
   *   the community.
   */

  getCurrentPopulation () {
    return this.people.filter(p => !p.died && !p.left)
  }

  /**
   * Returns the people who have mastered a particular skill.
   * @param skill {string} - The name of the skill that you're interested in.
   * @returns {Person[]} - An array of the people who have mastered the
   *   given skill.
   */

  getMasters (skill) {
    const everyone = this.getCurrentPopulation()
    return everyone.filter(p => p.skills.mastered.includes(skill))
  }

  /**
   * Returns the most recent entries in the community's history.
   * @param years {number} - The number of entries to return. (Default: `5`)
   * @returns {Object[]} - An array of objects providing information about the
   *   most recent years in the community's history.
   */

  getRecentHistory (years = 5) {
    const { present } = this
    return this.history.get({ between: [ present - years + 1, present ] })
  }

  /**
   * Calculates the chance for a community to achieve something where the
   * skills they've mastered can make a difference. This is subject to
   * diminishing marginal returns, though, so each additional helper adds only
   * 75% of what the previous one did.
   * @param skill {string} - The relevant skill to help.
   * @param base {number} - How much the first helper adds to the chances of
   *   success.
   * @returns {number} - The chance of success with the help of everyone in the
   *   community who has mastered the relevant skill.
   */

  calculateHelp (skill, base) {
    const help = []
    const helpers = this.getMasters(skill)
    let contribution = base
    for (let i = 0; i < helpers.length; i++) {
      help.push(contribution)
      contribution = contribution * 0.75
    }
    return help.reduce((acc, curr) => acc + curr, 0)
  }

  /**
   * Returns whether or not the community is currently experiencing any major
   * problems, like conflict, sickness, or lean times.
   * @returns {boolean} - `true` if the community is experiencing any major
   *   problems, or `false` if it is not.
   */

  hasProblems () {
    return this.status && (this.status.lean || this.status.sick || this.status.conflict)
  }

  /**
   * Adjust the yield of the community's territory. It has a natural
   * regeneration rate equal to the community's carrying capacity, based on
   * whether or not they're hunter-gatherers. Then, we reduce that by the
   * number of people in the community (e.g., the community's ecological
   * footprint).
   */

  adjustYield () {
    const people = this.getCurrentPopulation()
    const base = get(this, 'traditions.village') ? 150 : 30
    this.territory.yield += base - people.length
  }

  /**
   * See if new problems develop.
   */

  newProblems () {
    // If yield has dropped to negative numbers, you're facing lean times
    const y = get(this, 'territory.yield')
    if (typeof y === 'number' && y < 0) this.status.lean = true
    const yf = this.status.lean ? 2 : 1

    // Lean times and more people make it more likely that you suffer sickness
    const village = get(this, 'traditions.village')
    const capacity = village === true ? 150 : 30
    const people = this.getCurrentPopulation()
    const spf = people.length / capacity
    if (random.int(1, 100) < 5 * yf * spf) this.status.sick = true

    // Lean times makes it more likely that you get into a conflict
    if (random.int(1, 100) < yf) this.status.conflict = true
  }

  /**
   * See if the community has solved its problems.
   */

  solveProblems () {
    // If yield has risen to zero or higher, lean times are over
    const y = get(this, 'territory.yield')
    if (typeof y === 'number' && y >= 0) this.status.lean = false

    // Can you cure sickness?
    if (this.status.sick) {
      const chance = 50 + this.calculateHelp('Medicine', 10)
      if (random.int(1, 100) < chance) this.status.sick = false
    }

    // Can you end conflict?
    if (this.status.conflict) {
      const chance = 25 + this.calculateHelp('Deescalation', 10)
      if (random.int(1, 100) < chance) this.status.conflict = false
    }
  }

  /**
   * Generate some number of random strangers.
   * @returns {[Person]} - An array of strangers.
   */

  generateStrangers () {
    const { present } = this
    const population = this.getCurrentPopulation().length
    const min = Math.max(5, population / 8)
    const max = Math.max(10, population / 4)
    const num = random.int(min, max)
    const strangers = []
    for (let i = 0; i < num; i++) {
      const age = random.int(16, 65)
      const born = present - age
      const stranger = new Person({ born })
      for (let y = born; y <= present; y++) stranger.age()
      strangers.push(stranger)
    }
    return strangers
  }

  /**
   * How the community deals with the event of one of its members killing
   * someone.
   * @param report {Object} - The murder report, as generated by
   *   Polycule.murder.
   */

  judgeMurder (report) {
    const { outcome, murderer, victims, attempted, year } = report
    const record = murderer && murderer.crimes && murderer.crimes.murders ? murderer.crimes.murders : null
    const hasCommitted = record && record.committed ? record.committed.length : 0
    const hasAttempted = record && record.attempted ? record.attempted.length : 0
    let execute = false
    let exile = false
    if (outcome === 'murder') {

      // The more people you killed or tried to kill, the more likely the
      // community is to exile you.

      for (let i = 0; i < victims.length + attempted.length; i++) {
        exile = exile || random.boolean()
      }

      // You might be executed if you've established a pattern of homicidal
      // behavior. The more people you've killed or tried to kill in the past,
      // the more likely the community is to put you to death.

      const previous = (hasCommitted - victims.length) + (hasAttempted - attempted.length)
      for (let i = 0; i < previous; i++) {
        execute = execute || random.boolean()
      }
    } else if (outcome === 'attempted') {

      // If you only attempted to kill someone, you won't be executed, but you
      // might be exiled. The more people you tried to kill, the more likely
      // you are to be exiled.

      for (let i = 0; i < hasAttempted; i++) {
        exile = exile || random.boolean()
      }
    }

    const crime = outcome === 'murder' ? 'murder' : outcome === 'attempted' ? 'attempted murder' : 'none'
    if (execute) {
      murderer.die('executed')
    } else if (exile) {
      murderer.leave(crime)
    }

    if (crime !== 'none') {
      const entry = {
        year,
        tags: [ 'crime', crime ],
        judgment: execute ? 'execution' : exile ? 'exile' : 'reconciliation',
        perpetrator: murderer,
        victims,
        attempted
      }
      if (execute) entry.tags.push('executed')
      if (!execute && exile) entry.tags.push('exile')
      this.history.add(entry)
    }
  }

  /**
   * A lot of communities begin with monogamy as a norm. This can change
   * (and in fact, in most cases, will), but we can leave that up to the
   * history of the community and the people in it. While this is going on,
   * certain events, like drama in polycules consisting of three or more
   * people, might serve to reinforce the norm of monogamy in the minds of
   * the community. This method increases monogamy by 5%, if the community
   * still puts any stock in it.
   */

  reinforceMonogamy () {
    if (!this.traditions) this.traditions = { monogamy: 1 }
    const { monogamy } = this.traditions
    if (monogamy > 0) this.traditions.monogamy = Math.min(monogamy + 0.05, 1)
  }

  /**
   * A lot of communities begin with monogamy as a norm. This can change
   * (and in fact, in most cases, will), but we can leave that up to the
   * history of the community and the people in it. This method reduces the
   * community's faith in monogamy by 1%. This can be called any time something
   * happens that reduces the community's faith in monogamy. For example, each
   * year, each polycule with three or more people in it calls this method
   * once. So, for example, a community with five polycules of three people
   * each will reduce its faith in monogamy by 5% each year, reducing it from
   * 100% to zero in just 20 years.
   */

  reduceMonogamy () {
    if (!this.traditions) this.traditions = { monogamy: 0 }
    const { monogamy } = this.traditions
    if (monogamy > 0) this.traditions.monogamy = Math.max(monogamy - 0.01, 0)
  }

  /**
   * Adds a founder to the community.
   * @param year {number} - The year this founder is born.
   */

  addFounder (year) {
    const p = new Person({ born: year })
    p.founder = true
    this.add(p)
  }

  /**
   * A village should have 50 founders. A hunter-gatherer band should have 10.
   * If the community currently has fewer founders than it should, it adds a
   * random number of founders between 0 and 2 (for a hunter-gatherer band) or
   * between 0 and 5 (for a village).
   * @param year {number} - The year being considered.
   */

  considerFounder (year) {
    const village = get(this, 'traditions.village') || false
    const expected = village ? 50 : 10
    const currently = this.people.filter(p => p.founder).length
    if (currently < expected) {
      const add = village ? random.int(0, 5) : random.int(0, 2)
      for (let i = 0; i < add; i++) {
        this.addFounder(year)
      }
    }
  }

  /**
   * Keeps a record of the community's history.
   * @param year {number} - The year being recorded.
   */

  recordHistory (year) {
    const people = this.getCurrentPopulation()
    const entry = {
      year,
      population: people.length,
      polycules: this.polycules.length,
      yield: this.territory.yield,
      lean: this.status.lean === true,
      sick: this.status.sick === true,
      conflict: this.status.conflict === true
    }
    this.history.add(entry)
  }

  /**
   * Runs one year in a simulation of the community's life.
   * @param year {number} - The year being simulated.
   * @param founding {boolean} - A flag to indicate if this is in the "founding
   *   period" of the community. In this period the simulation is partial,
   *   because we're adding the founders of the community. They're probably
   *   surrounded by other people and events that we're not modeling because
   *   otherwise we'd end up trying to model the whole universe.
   */

  annual (year, founding = false) {
    if (founding) { this.considerFounder(year) } else { this.adjustYield() }

    // Each polycule of three or more erodes the community's belief in
    // monogamy as a norm each year, until polygamy is fulled accepted.

    this.polycules.forEach(p => {
      if (p.people.length > 2) this.reduceMonogamy()
    })

    // See if you can solve some problems. Then see what new problems may arise.
    this.solveProblems()
    this.newProblems()

    // How does everyone's relationships change?
    this.polycules.forEach(p => p.change(this, year))

    // Age everyone up one year.
    const population = this.getCurrentPopulation()
    population.forEach(p => p.age(this, year))

    // Record what happened.
    this.recordHistory(year)
  }

  /**
   * Runs a simulation of the community for a number of years leading up to the
   * "present" of the Fifth World (144,000 days from the moment the simulation
   * is started).
   * @param years {number} - The number of years that the simulation should run
   *   over (Default: `200`)
   */

  run (years = 200) {
    const until = daysFromNow(144000)
    const end = until.getFullYear()
    const start = Math.min(end - years, end - 50)

    // The further back you go, the more likely it is that your community
    // starts off facing sickness and war.

    const chance = ((years - 100) / 300) * 100
    if (chance < random.int(1, 100)) this.status.sick = true
    if (chance < random.int(1, 100)) this.status.conflict = true

    for (let y = start; y < end; y++) {
      const founding = y < start + 50
      this.annual(y, founding)
    }
  }
}
