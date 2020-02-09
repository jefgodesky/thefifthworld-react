import random from 'random'

import Body from './body'
import History from './history'
import Personality from './personality'
import Polycule from './polycule'
import Sexuality from './sexuality'
import Skills from './skills'

import { allTrue, between, clone, get, isPopulatedArray } from '../../shared/utils'
import { check } from './check'
import { pickRandom } from './shuffle'

import data from '../../data/community-creation'

export default class Person {
  constructor (args = {}) {
    const now = new Date()
    const year = args.born || now.getFullYear()
    if (args && args.mother && args.mother.genotype && args.father && args.father.genotype) {
      this.genotype = Body.makeBaby([ args.mother.genotype, args.father.genotype ], args) || new Body()
    } else {
      this.genotype = new Body(args)
    }

    this.body = new Body({ copy: this.genotype })
    this.personality = new Personality()
    this.skills = new Skills()
    this.sexuality = new Sexuality(this.body, args.mateFor)
    this.gender = args && args.specifiedGender ? args.specifiedGender : this.assignGender(args.numGenders)
    this.attraction = this.getAttraction()

    const randomDistributed = random.normal(0, 1)
    this.intelligence = randomDistributed()
    this.neurodivergent = random.int(1, 100) === 1
    if (this.body.psychopath) this.personality.expressPsychopathy()

    this.born = year
    this.present = year

    this.crimes = { murders: { killed: [], attempted: [] }, sabotage: 0 }
    this.history = new History()
    if (year) this.history.add({ year, tags: [ 'born' ]})

    if (this.genotype.dead) this.die('infant mortality', year)
  }

  /**
   * Assign gender.
   * @param genders {number} - The number
   * @returns {string} - An appropriate gender to assign to this person.
   */

  assignGender (genders = 3) {
    const roll = random.int(1, 100)
    const { hasPenis, hasWomb } = this.body
    const both = hasPenis && hasWomb
    const neither = !hasPenis && !hasWomb
    const intersex = both || neither
    let gender = this.body.hasPenis ? 'Man' : 'Woman'
    if (genders === 3) {
      if (roll > 90 || (intersex && roll > 10)) gender = 'Third gender'
    } else if (genders > 3) {
      if (genders > 4 && (roll > 95 || (intersex && roll > 10))) gender = 'Fifth gender'
      if ((gender === 'Woman' && intersex) || (gender === 'Woman' && roll > 90)) gender = 'Masculine woman'
      if ((gender === 'Man' && intersex) || (gender === 'Man' && roll > 90)) gender = 'Feminine man'
      if (gender === 'Woman') gender = 'Feminine woman'
      if (gender === 'Man') gender = 'Masculine man'
    }
    return gender
  }

  /**
   * Returns an attraction matrix for this person. Starts with a baseline based
   * on gender, but then adds random personal variation.
   * @returns {{Object}} - An array of objects conforming to the format for a
   *   table per the `check` method.
   */

  getAttraction () {
    const traits = Object.keys(this.personality)
    const factors = [ 'attractiveness', ...traits ]
    let table = clone(data.encounterFactors[this.gender])

    // Does physical attractiveness matter more or less to you?
    const deltaVals = []
    for (let i = -5; i < 6; i++) deltaVals.push(i)
    const attractivenessDelta = pickRandom(deltaVals)
    const attractivenessSwap = pickRandom(traits)
    table.forEach(r => {
      if (r.event === 'attractiveness') r.chance = r.chance + attractivenessDelta
      if (r.event === attractivenessSwap) r.chance = r.chance - attractivenessDelta
    })

    // Do various personality traits matter more or less to you?
    traits.forEach(trait => {
      const posDeltaVals = []
      for (let i = 1; i < 6; i++) posDeltaVals.push(i)
      if (this.personality.check(trait)) {
        const delta = pickRandom(posDeltaVals)
        let swap = trait
        while (swap === trait) swap = pickRandom(factors)
        table.forEach(r => {
          if (r.event === trait) r.chance = r.chance + delta
          if (r.event === swap) r.chance = r.chance - delta
        })
      }
    })

    return table
  }

  /**
   * Simulates an encounter between this person and someone else, and tells you
   * if it went well or not.
   * Each person's attraction matrix (see `getAttraction`) defines which
   * factors are most important to each individual. These can be any of the Big
   * Five personality traits or physical attractiveness. These are individually
   * weighted in the attraction matrix. We use this weighting so that each
   * person in the encounter can select a random factor to judge the encounter
   * based upon, depending on their own weighting (e.g., if your attraction
   * matrix has conscientiousness at 25, then you'll probably pick
   * conscientiousness about one quarter of the time). We then use that factor
   * to make a random check on the other person (e.g., if extraversion is the
   * factor that you pick, then the other person needs to pass an extraversion
   * check). If both checks pass, the encounter went well.
   * @param other {Person} - The other person you're encountering.
   * @returns {Object} - Returns an object with three properties: `self` (a
   *   boolean that is `true` if this person liked the `other`), `other` (a
   *   boolean that is `true` if the `other` liked this person), and `mutual`
   *   (a boolean that is `true` if they both liked each other).
   */

  encounter (other) {
    if (other && other.constructor && other.constructor.name === 'Person') {
      if (!this.attraction) this.attraction = this.getAttraction()
      if (!other.attraction) other.attraction = other.getAttraction()

      const sides = [
        { criterion: check(this.attraction, random.int(1, 100)), subject: other },
        { criterion: check(other.attraction, random.int(1, 100)), subject: this }
      ]

      const outcomes = sides.map(side => {
        let chance
        switch (side.criterion) {
          case 'attractiveness':
            chance = between((side.subject.body.attractiveness + 3) * 16, 1, 99)
            return chance > random.int(1, 100)
          case 'neuroticism':
            chance = 100 - side.subject.personality.chance('neuroticism')
            return chance > random.int(1, 100)
          default:
            return side.subject.personality.check(side.criterion)
        }
      })

      return { self: outcomes[0], other: outcomes[1], mutual: outcomes[0] && outcomes[1] }
    } else {
      return false
    }
  }

  /**
   * Meeting a stranger. If you hit it off, you might want to start a
   * relationship with her.
   * If you're already in a polycule, we'll see how the other members of your
   * polycule feel about her. If they all like her, too, then we need to look
   * at our community's norms around monogamy. If we have such a thing, how
   * strong are they, and is everyone in our polycule agreed to break them? If
   * we don't have any such norms, or if everyone's agreed, then we'll add the
   * stranger to the polycule.
   * If there are people in your polycule who don't get along with the stranger
   * or they're not willing to break community norms around monogamy, then the
   * question becomes, will you be unfaithful? That depends on your love for
   * each member of your polycule and your agreeableness (which reflects how
   * much you care about whether or not you hurt someone). This evaluates
   * everyone in the polycule, not just the people who didn't like the
   * stranger, because the decision was a consensus, so you're cheating on all
   * of them, not just the people who didn't like the stranger.
   * IF you're not in a polycule, then you're going to start a life with the
   * stranger, and the only question is if that life will be with this
   * community or somewhere else. If you feel safe here, you'll join this
   * community. If not, you'll leave with the stranger to start your life
   * together somewhere else.
   * @param stranger {Person} - The stranger you've met.
   */

  meet (stranger) {
    const encounter = this.encounter((stranger))
    if (encounter.mutual) {
      if (this.polycule) {
        const others = this.polycule.getOthers(this)
        const agreed = allTrue(others.map(o => o.encounter(stranger).mutual))

        if (agreed) {
          let willAdd = true
          const monogamy = get(this, 'community.traditions.monogamy')
          if (monogamy) {
            this.people.forEach(person => {
              const chance = person.personality.chance('agreeableness') * monogamy
              if (random.int(1, 100) < chance) willAdd = false
            })
          }
          if (willAdd) this.polycule.add(stranger)
        } else {
          const willCheatOn = others.map(other => {
            let willCheat = true
            const tries = Math.max(this.polycule.getLoveFor(this, other), 1)
            for (let i = 0; i < tries; i++) {
              willCheat = willCheat && this.personality.check('agreeableness')
            }
            return willCheat
          })
          if (allTrue(willCheatOn)) this.polycule.cheat([ this, stranger ])
        }
      } else {
        if (this.feelsSafe()) {
          this.polycule = new Polycule(this, stranger)
          if (this.community) {
            this.community.add(stranger)
            this.community.addPolycule(this.polycule)
          }
        } else {
          this.leave()
        }
      }
    }
  }

  /**
   * Marks a characer's death.
   * @param cause {string} - A string indicating the cause of death.
   * @param killer {Person} - (Optional) The person who killed this character.
   *   (Default: `undefined`).
   */

  die (cause = 'natural', killer = undefined) {
    const year = this.present
    this.died = year
    if (this.polycule) this.polycule.remove(this, year)
    const entry = { year, tags: [ 'died' ], cause }
    if (killer) entry.killer = killer
    this.history.add(entry)
  }

  /**
   * Marks when a character leaves the community.
   * @param crime {string} - Optional. If defined, the character did not leave
   *   the community of her own volition, but was exiled for committing some
   *   crime (usually murder or attempted murder). This string is a single word
   *   or very short phrase to describe the crime. It should be usable as a
   *   consistent tag (e.g., 'murder' or 'attempted murder').
   *   (Default: `undefined`)
   */

  leave (crime = undefined) {
    const year = this.present
    this.left = year
    if (this.polycule) this.polycule.remove(this, year)
    const entry = { year, tags: [ 'left' ] }
    if (crime) { entry.tags.push('exile'); entry.crime = crime }
    this.history.add(entry)
  }

  /**
   * Returns the character's age.
   * @param year {number} - Returns how old the character was in this year,
   *   using the earliest of this year, the character's present, the year the
   *   character left the community (if any), and the year the character died
   *   (if known) (Default: `undefined`)
   * @returns {number|undefined} - If the year the character was born is known
   *   and we have some year to measure relative by (either a year is provided,
   *   or the character has a present, or the character left the community and
   *   we've recorded when, or the character died and we've recorded when) then
   *   the character's age at the earliest of those points is returned (for
   *   example, if a character is born in 2300, and leaves the community in
   *   2325, then if you ask for the character's age in 2350, you'll get `25`,
   *   the last time at which we saw him, and not `50`, the age that he might
   *   be if we assume he's still alive somewhere).
   */

  getAge (year = undefined) {
    const { born, died, left, present } = this
    const years = []
    if (typeof year === 'number') years.push(year)
    if (typeof died === 'number') years.push(died)
    if (typeof left === 'number') years.push(left)
    if (typeof present === 'number') years.push(present)
    const mark = Math.min(...years)
    return born && mark ? mark - born : undefined
  }

  /**
   * Processes the character suffering a serious injury.
   * @param special {[string]} - A string specifying anything special to note
   *   about the injury (e.g., it's an injury suffered during a conflcit).
   */

  getHurt (special= []) {
    const outcome = this.body.getHurt()
    const tags = [ 'injury', ...special ]
    if (outcome === 'death') {
      this.die(tags.join(' '))
    } else if (outcome === 'infection') {
      this.getSick([ 'infection', ...tags ])
    } else {
      this.history.add({ year: this.present, tags, outcome })
    }
  }

  /**
   * Processes the character suffering a serious bout of illness.
   * @param special {[string]} - A string specifying anything special to note
   *   about the illness (e.g., it's an infection from a wound, it was a direct
   *   result of a time of sickness, or it was a direct result of lean times).
   */

  getSick (special = []) {
    const outcome = this.body.getSick()
    const tags = [ 'illness', ...special ]
    if (outcome === 'death') {
      this.die(tags.join(' '))
    } else {
      this.history.add({ year: this.present, tags, outcome })
    }
  }

  /**
   * Does this character feel safe about making big decisions like having a
   * child or starting a new relationship? This is based on how many years have
   * passed without want, sickness, or conflict. The more open you are to new
   * experience, the lower your threshold is, and the fewer such good years
   * need to pass for you to feel secure.
   * @returns {boolean} - `true` if the character feels safe and secure in
   *   embarking on some major life change, or `false` if she doesn't.
   */

  feelsSafe () {
    const goodYearsNeeded = Math.ceil((100 - this.personality.chance('openness')) / 10)
    const recent = this.community ? this.community.getRecentHistory(goodYearsNeeded) : []
    return isPopulatedArray(recent)
      ? allTrue(recent.map(y => !y.lean && !y.conflict && !y.sick))
      : true
  }

  /**
   * The character commits or attempts murder.
   * @param victims {[Person]} - An array of people that the character murders.
   *   (Default: `[]`)
   * @param attempted {[Person]} - An array of people that the character tries
   *   but fails to murder. (Default: `[]`)
   */

  murder (victims = [], attempted = []) {
    this.crimes.murders.killed = [ ...this.crimes.murders.killed, ...victims ]
    this.crimes.murders.attempted = [ ...this.crimes.murders.attempted, ...attempted ]
    const year = this.present
    const crime = victims.length > 0 ? 'murder' : attempted.length > 0 ? 'attempted murder' : null

    victims.forEach(victim => {
      victim.die('homicide', this)
    })

    attempted.forEach(victim => {
      if (victim && victim.history) {
        victim.history.add({
          year,
          tags: [ 'crime', 'victim', 'attempted murder' ],
          perpetrator: this
        })
      }
    })

    if (crime) {
      this.history.add({
        year,
        tags: [ 'crime', 'perpetrator', crime ],
        victims,
        attempted
      })
    }
  }

  /**
   * Ages a character.
   * @param community {Community} - (Optional) The community object.
   */

  age (community= undefined) {
    this.present++
    const age = this.getAge(this.present)
    if (age) {
      const hasProblems = community ? community.hasProblems() : false
      const status = community && community.status ? community.status : { conflict: false, sickness: false, lean: false }
      const { conflict, sickness, lean } = status
      this.body.adjustFertility(hasProblems, age)

      // Check for death, injury, or illness
      if (this.body.checkForDyingOfOldAge(age)) this.die('natural')
      if (!this.died) {
        let chanceOfInjury = 8 * (this.personality.chance('openness') / 50)
        if (random.int(1, 1000) < chanceOfInjury) this.getHurt()
        if (conflict) {
          const odds = age > 15 && age < 35 ? 100 : 500
          if (random.int(1, odds) < chanceOfInjury) this.getHurt([ 'in conflict' ])
        }

        let chanceOfIllness = 8 * (this.personality.chance('openness') / 50)
        if (random.int(1, 1000) < chanceOfIllness) this.getSick()
        if (sickness && random.int(1, 1000) < chanceOfIllness * 10) this.getSick([ 'from sickness' ])
        if (lean && random.int(1, 1000) < chanceOfIllness * 2) this.getSick([ 'from sickness' ])
      }

      // People change
      const partners = this.polycule && this.polycule.constructor && this.polycule.constructor.name === 'Polycule'
        ? this.polycule.getOthers(this)
        : []
      if (!this.died) this.personality.change(community, partners)

      // TODO: Relationships and skills.
    }
  }
}
