import random from 'random'
import { clone } from '../../shared/utils'
import { checkUntil } from './check'
import tables from '../../data/community-creation'

export default class Body {
  constructor (args) {
    if (args && args.copy) {
      Object.keys(args.copy).forEach(key => {
        this[key] = clone(args.copy[key])
      })
    } else if (args && args.parents) {
      const { born, specifiedGender } = args
      const baby = Body.makeBaby(born, specifiedGender)
      return baby
    } else {
      const specifiedGender = args ? args.specifiedGender : undefined
      const born = args ? args.born : undefined
      this.random(born, specifiedGender)
    }
  }

  /**
   * Generate a random body.
   * @param born {number} - (Optional) The year this body is born.
   * @param specifiedGender {string} - (Optional) The gender that this person
   *   will eventually grow into (unrealistic, but helpful for when we're
   *   generating random people that an established member of the community
   *   might form a relationship with, to get the people who might join the
   *   community).
   */

  random (born = undefined, specifiedGender = undefined) {
    const rand = random.normal(0, 1)
    const randomLongevity = random.normal(100, 5)
    if (born && typeof born === 'number') this.born = born
    this.type = rand()
    this.longevity = randomLongevity()
    this.eyes = random.float(0, 100) < 0.016
      ? { left: 'Blind', right: 'Blind' }
      : { left: 'Healthy', right: 'Healthy' }
    this.ears = random.float(0, 100) < 0.2
      ? { left: 'Deaf', right: 'Deaf' }
      : { left: 'Healthy', right: 'Healthy' }
    this.arms = {
      left: random.float(0, 100) < 0.1 ? 'Disabled' : 'Healthy',
      right: random.float(0, 100) < 0.1 ? 'Disabled' : 'Healthy'
    }
    this.legs = {
      left: random.float(0, 100) < 0.1 ? 'Disabled' : 'Healthy',
      right: random.float(0, 100) < 0.1 ? 'Disabled' : 'Healthy'
    }
    this.achondroplasia = random.float(0, 100) < 0.004
    this.hasPenis = false
    this.hasWomb = true
    this.fertility = 0
    this.scars = []

    if (random.int(1, 10) === 1) this.makeInfertile()

    this.determineSex(specifiedGender)
  }

  /**
   * Create a baby from two bodies.
   * @param parents {[Body]} - An array of at least two `Body` objects. Only
   *   the first two are considered; all other elements are completely ignored.
   *   One of those first two elements must have `hasWomb` equal to `true`, and
   *   the other must have `hasPenis` equal to `true`. If these conditions are
   *   met, a new `Body` object, with probabilities determined by its parents,
   *   is produced. If not, this method returns `undefined`.
   * @param born {number} - (Optional) The year in which this child is born.
   * @param args {Object} - The arguments object passed to the `Body`
   *   constructor.
   * @returns {Body|undefined} - If two viable parents are provided, a child is
   *   created that blends their traits. If not, it returns `undefined`. There
   *   is a 25% chance of infant mortality, indicated by the `died` property
   *   being set either to the same year as the `born` property (if the `born`
   *   argument was provided) or simply `true` (if no `born` argument was
   *   provided).
   */

  static makeBaby (parents, born, args) {
    let baby
    if (parents && Array.isArray(parents) && parents.length > 1) {
      const bothBodies = parents.slice(0, 1).map(p => p.constructor && p.constructor.name === 'Body').reduce((acc, curr) => acc && curr, true)
      if (bothBodies) {
        const mindex = parents[0].hasWomb ? 0 : parents[1].hasWomb ? 1 : -1
        const findex = mindex === 0 && parents[1].hasPenis ? 1 : mindex === 1 && parents[0].hasPenis ? 0 : -1
        if (mindex > -1 && findex > -1) {
          // We have two parents, and they're both Body objects, and one is
          // able to reproduce sexually as a male and the other is able to
          // reproduce sexually as a female, so they're a viable set of
          // parents. Let's declare some variables to make it easier to refer
          // to them later.

          const mother = parents[mindex]
          const father = parents[findex]

          // Start off by seeding our baby with random values.

          baby = new Body(args)
          if (born && typeof born === 'number') baby.born = born
          const imr = baby.born ? baby.born : true

          // We're trying for "descent with variation" by taking the average of
          // your mother's value and your father's value and then adding a
          // random variance based on their difference, so you're still
          // somewhere between those two.

          const descent = (m, f) => {
            const avg = (m + f) / 2
            const diff = Math.abs(m - f)
            const swing = diff * (random.int(1, 50) / 100)
            const variation = random.boolean() === true ? swing : swing * -1
            return avg + variation
          }

          baby.type = descent(mother.type, father.type)
          baby.longevity = descent(mother.longevity, father.longevity)

          // We started off with random values for eyes, ears, and limbs, but
          // if either of your parents were born blind, then there's a much
          // higher chance that you'll be born blind, too. And if both of your
          // parents were born blind, then the chance is higher still. So we're
          // creating two little functions here, `either` and `both`, to make
          // it easier to check if either or both of your parents have a
          // problem like that, and using a different roll to check this if
          // that's the case.

          const either = set => {
            return (mother[set].left !== 'Healthy' && mother[set].right !== 'Healthy') ||
              (father[set].left !== 'Healthy' && father[set].right !== 'Healthy')
          }

          const both = set => {
            return mother[set].left !== 'Healthy' && mother[set].right !== 'Healthy' &&
              father[set].left !== 'Healthy' && father[set].right !== 'Healthy'
          }

          const blindRoll = random.int(1, 4)
          const blind = (both('eyes') && blindRoll < 4) ||
            (either('eyes') && blindRoll === 1)
          if (blind) {
            baby.eyes.left = 'Blind'
            baby.eyes.right = 'Blind'
          }

          const deafRoll = random.int(1, 4)
          const deaf = (both('ears') && deafRoll < 4) ||
            (either('ears') && deafRoll === 1)
          if (deaf) {
            baby.ears.left = 'Deaf'
            baby.ears.right = 'Deaf'
          }

          const armsRoll = random.int(1, 4)
          const arms = (both('arms') && armsRoll < 4) ||
            (either('arms') && armsRoll === 1)
          if (arms) {
            baby.arms.left = 'Disabled'
            baby.arms.right = 'Disabled'
          }

          const legsRoll = random.int(1, 4)
          const legs = (both('arms') && legsRoll < 4) ||
            (either('arms') && legsRoll === 1)
          if (legs) {
            baby.legs.left = 'Disabled'
            baby.legs.right = 'Disabled'
          }

          // Achondroplasia pops up unexpectedly very randomly, but it is genetic,
          // so if one or both of your parents have it, we need to calculate the odds
          // in an altogether different way. And if you inherit the gene from both of
          // your parents, you die.

          if (mother.achondroplasia || father.achondroplasia) {
            const fromMother = mother.achondroplasia && random.boolean() === true
            const fromFather = father.achondroplasia && random.boolean() === true
            if (fromMother || fromFather) {
              this.achondroplasia = true
              if (fromMother && fromFather) this.dead = imr
            } else {
              this.achondroplasia = false
            }
          }

          // 25% infant mortality rate
          if (random.int(1, 4) === 1) this.dead = imr
        }
      }
    }
    return baby
  }

  /**
   * Determine the capacity for this body to reproduce sexually as a man and as
   * a woman.
   * @param specifiedGender {string} - (Optional) A string with this person's
   *   gender. Sex organs are strongly correlated with gender, but it's not a
   *   1-to-1 correspondence.
   */

  determineSex (specifiedGender) {
    const roll = random.int(1, 100)
    const both = random.int(1, 10000) < 85
    const neither = random.int(1, 10000) < 85

    if (both) {
      this.hasPenis = true
      this.hasWomb = true
    } else if (neither) {
      this.hasPenis = false
      this.hasWomb = false
    } else {
      // "Feminine woman" in a four- or five-gender system works out to the
      // same math as "woman" in a two- or three-gender system, as does
      // "masculine man" and "man." If no gender was specified, we virtually
      // flip a coin to assign male or female. They might not end up with that
      // gender, but it will suffice for now to figure out the correct
      // probabilities for who gets what bits.

      const condition = specifiedGender === 'Masculine man'
        ? 'Man'
        : specifiedGender === 'Feminine woman'
          ? 'Woman'
          : specifiedGender === undefined
            ? random.boolean() === false ? 'Man' : 'Woman'
            : specifiedGender

      switch (condition) {
        case 'Woman':
          this.hasPenis = roll === 1
          this.hasWomb = roll !== 1
          break
        case 'Man':
          this.hasPenis = roll !== 1
          this.hasWomb = roll === 1
          break
        case 'Masculine woman':
          this.hasPenis = roll > 90
          this.hasWomb = roll <= 90
          break
        case 'Feminine man':
          this.hasPenis = roll <= 90
          this.hasWomb = roll > 90
          break
        default:
          this.hasPenis = roll > 50
          this.hasWomb = roll < 50
          break
      }
    }
  }

  /**
   * Returns the person's age in a particular year.
   * @param year {number} - The year in which we're asking for the person's
   *   age.
   * @returns {number|undefined} - If the person has died and we have the year
   *   of her birth and death, and you're asking for her age after she died, it
   *   returns her age at death. If we have the year of her birth, it returns
   *   her age in the year provided. If either there is no year of birth
   *   recorded, or if the year provided is not valid, it returns `undefined`.
   */

  getAge (year) {
    const { born, died } = this
    const ageAtDeath = born && typeof born === 'number' && died && typeof died === 'number' ? died - born : null
    const ageAtYear = born && typeof born === 'number' && year && typeof year === 'number' ? year - born : null

    if (ageAtDeath && ageAtYear) {
      return Math.min(ageAtDeath, ageAtYear)
    } else if (ageAtYear && !ageAtDeath) {
      return ageAtYear
    } else if (ageAtDeath && !ageAtYear) {
      return ageAtDeath
    } else {
      return undefined
    }
  }

  /**
   * Flag this person as infertile and reduce her fertility to zero.
   */

  makeInfertile () {
    this.fertility = 0
    this.infertile = true
  }

  /**
   * Set fertility for a given age.
   * @param hasProblems {boolean} - `true` if the community is in a conflict,
   *   or enduring sickness or lean times.
   * @param age {number} - The person's age in years.
   */

  adjustFertility (hasProblems, age) {
    const { hasWomb, hasPenis, fertility, infertile } = this
    if (!infertile) {
      const mod = hasProblems ? -10 : 20
      const max = age <= 20
        ? Math.max(100 + (-1) * Math.pow(60 + (-3 * age), 2), 0)
        : age > 20 && hasWomb
          ? Math.max(100 + (-1) * Math.pow(6.5 + (-0.325 * age), 2), 0)
          : age > 20 && hasPenis
            ? Math.max(100 + (-1) * Math.pow(4 + (-0.2 * age), 2), 0)
            : 0
      this.fertility = Math.min(Math.max(fertility + mod, 0), max)
    }
  }

  /**
   * Returns `true` if the specified part is disabled, missing, blind, or deaf,
   * or `false` if it is not.
   * @param key {string} - One of `arms`, `legs`, `ears`, or `eyes`.
   * @param side {string} - Either `left` or `right`.
   * @returns {boolean} - `true` if that part is missing or impaired, or
   *   `false` if it is not.
   */

  isGone (key, side) {
    const gone = [ 'Disabled', 'Missing', 'Blind', 'Deaf' ]
    return gone.includes(this[key][side])
  }

  /**
   * Adds a scar.
   * @param location {string} - Where the scar is located.
   */

  takeScar (location) {
    this.scars.push(location)
  }

  /**
   * Makes the person deaf in one ear.
   * @returns {boolean} - `true` if the person is made deaf in one ear, or
   *   `false` if it failed (because she was already deaf in both ears).
   */

  deafen () {
    const check = `${this.ears.left} ${this.ears.right}`
    const side = random.boolean() ? 'right' : 'left'
    const other = side === 'right' ? 'left' : 'right'

    if (this.ears[side] === 'Deaf') {
      this.ears[other] = 'Deaf'
    } else {
      this.ears[side] = 'Deaf'
    }

    return `${this.ears.left} ${this.ears.right}` !== check
  }

  /**
   * Makes the person blind in one eye.
   * @returns {boolean} - `true` if the person is made blind in one eye, or
   *   `false` if it failed (because she was already blind in both eyes).
   */

  blind () {
    const check = `${this.eyes.left} ${this.eyes.right}`
    const side = random.boolean() ? 'right' : 'left'
    const other = side === 'right' ? 'left' : 'right'

    if (this.eyes[side] === 'Blind') {
      this.eyes[other] = 'Blind'
    } else {
      this.eyes[side] = 'Blind'
    }

    return `${this.eyes.left} ${this.eyes.right}` !== check
  }

  /**
   * Checks the person's prognosis when she gets sick.
   * @param canDie {boolean} (Optional) A flag that can indicate that this
   *   person cannot die from this disease. (Default: `true`)
   * @returns {string} - A string indicating the person's prognosis (one of
   *   `death`, `deaf`, `blind`, or `recovery`).
   */

  getSick (canDie = true) {
    const unacceptable = canDie ? [] : [ 'death' ]
    let prognosis = checkUntil(tables.illness, unacceptable)

    switch (prognosis) {
      case 'deaf':
        if (!this.deafen()) prognosis = 'recovery'
        break
      case 'blind':
        if (!this.blind()) prognosis = 'recovery'
        break
      default: break
    }

    return prognosis
  }

  /**
   * Sustain a random injury.
   * @param canDie {boolean} (Optional) A flag that can indicate that this
   *   person cannot die from this injury. (Default: `true`)
   * @returns {string} - A string indicating the outcome of the person's
   *   injury  (one of `death`, `face`, `left arm`, `right arm`, `left leg`,
   *   `right leg`, `infection`, or `recovery`).
   */

  getHurt (canDie = false) {
    const unacceptable = canDie ? [] : [ 'death' ]
    let outcome = checkUntil(tables.injury, unacceptable)
    const roll = random.int(1, 8)

    switch (outcome) {
      case 'face':
        switch (roll) {
          case 1: this.eyes.left = 'Missing'; outcome = 'lost left eye'; break
          case 2: this.eyes.right = 'Missing'; outcome = 'lost right eye'; break
          case 3: this.ears.left = 'Missing'; outcome = 'lost left ear'; break
          case 4: this.ears.right = 'Missing'; outcome = 'lost left ear'; break
          default: this.takeScar('face'); outcome = 'took a scar to the face'; break
        }
        break
      case 'left arm':
        if (roll < 2) {
          this.arms.left = 'Missing'
          outcome = 'lost left arm'
        } else {
          this.takeScar('left arm')
          outcome = 'took a scar to the left arm'
        }
        break
      case 'right arm':
        if (roll < 2) {
          this.arms.right = 'Missing'
          outcome = 'lost right arm'
        } else {
          this.takeScar('right arm')
          outcome = 'took a scar to the right arm'
        }
        break
      case 'left leg':
        if (roll < 2) {
          this.legs.left = 'Missing'
          outcome = 'lost left leg'
        } else {
          this.takeScar('left leg')
          outcome = 'took a scar to the left leg'
        }
        break
      case 'right leg':
        if (roll < 2) {
          this.legs.right = 'Missing'
          outcome = 'lost right leg'
        } else {
          this.takeScar('right leg')
          outcome = 'took a scar to the right leg'
        }
        break
      case 'torso': this.takeScar('torso'); outcome = 'took a scar to the torso'; break
      default: break
    }

    return outcome
  }

  /**
   * Checks if this person dies of old age at a particular age.
   * @param age {number} - The age at which we're checking.
   * @returns {boolean} - `true` if the person dies of old age, or `false` if
   *   she doesn't.
   */

  checkForDyingOfOldAge (age) {
    const chance = (age - this.longevity) * 10
    const check = random.int(1, 100) < chance
    if (check && this.born) this.died = this.born + age
    return check
  }
}
