import random from 'random'
import tables from '../../data/community-creation'
import skills from '../../data/skills'
import { clone, get } from '../../shared/utils'
import { checkUntil } from './check'
import shuffle from './shuffle'

/**
 * This class defines the behavior of individuals in community creation.
 */

export default class Person {
  constructor (args) {
    if (args === undefined) {
      this.random()
    } else if (args && args.community) {
      this.random(args.community, args.born, args.gender)
    }
  }

  /**
   * Generates a random person.
   * @param community {Community} - The community the person is from.
   * @param born {number} - The year this person is born.
   * @param specifiedGender {string|null} - The gender that the person should
   *   be. (Default: `null`)
   * @param mateFor {string|null} - The gender of the person that this person
   *   is a potential mate for (and so must be at least nominally attracted
   *   to). This is used when generating potential mates. (Default: `null`)
   */

  random (community = null, born = null, specifiedGender = null, mateFor = null) {
    const randomDistributed = random.normal(0, 1)
    const longevity = random.normal(90, 5)

    this.born = born
    this.longevity = longevity()

    this.body = {
      type: randomDistributed(),
      eyes: random.float(0, 100) < 0.016
        ? { left: 'Blind', right: 'Blind' }
        : { left: 'Healthy', right: 'Healthy' },
      ears: random.float(0, 100) < 0.2
        ? { left: 'Deaf', right: 'Deaf' }
        : { left: 'Healthy', right: 'Healthy' },
      arms: {
        left: random.float(0, 100) < 0.1 ? 'Disabled' : 'Healthy',
        right: random.float(0, 100) < 0.1 ? 'Disabled' : 'Healthy'
      },
      legs: {
        left: random.float(0, 100) < 0.1 ? 'Disabled' : 'Healthy',
        right: random.float(0, 100) < 0.1 ? 'Disabled' : 'Healthy'
      },
      scars: [],
      achondroplasia: random.float(0, 100) < 0.004,
      fertility: 0,
      hasPenis: false,
      hasWomb: true
    }

    this.personality = {
      openness: randomDistributed(),
      conscientiousness: randomDistributed(),
      extraversion: randomDistributed(),
      agreeableness: randomDistributed(),
      neuroticism: randomDistributed()
    }

    this.intelligence = randomDistributed()
    this.neurodivergent = random.int(1, 100) === 1
    this.psychopath = null

    if (specifiedGender) {
      this.gender = specifiedGender
      this.chooseSex()
    } else {
      this.chooseSex()
      this.assignGender(community)
    }

    this.determineSexuality(mateFor)

    this.history = []
    this.partners = []
    this.children = []
    this.skills = {
      mastered: []
    }

    // There's a 1% chance this person is a psychopath...
    if (random.int(1, 100) === 1) this.makePsychopath()
  }

  /**
   * This person is a psychopath. Mark as such and make necessary adjustments
   * to personality scores.
   */

  makePsychopath () {
    if (typeof this.psychopath !== 'number') {
      this.psychopath = 1
      this.personality.agreeableness -= 2
      this.personality.conscientiousness -= 2
      this.personality.neuroticism += 2
      this.personality.extraversion += 1
      this.personality.openness += 1
    }
  }

  /**
   * Choose sexual characteristics.
   */

  chooseSex () {
    const { gender } = this
    const roll = random.int(1, 100)
    const both = random.int(1, 10000)
    const neither = random.int(1, 10000)

    if (both < 85) {
      this.body.hasWomb = true
      this.body.hasPenis = true
    } else if (neither < 85) {
      this.body.hasWomb = false
      this.body.hasPenis = false
    } else {
      const condition = gender === 'Masculine man'
        ? 'Man'
        : gender === 'Feminine woman'
          ? 'Woman'
          : gender
      switch (condition) {
        case 'Woman':
          this.body.hasWomb = roll <= 98
          this.body.hasPenis = roll === 99
          break
        case 'Man':
          this.body.hasWomb = roll === 99
          this.body.hasPenis = roll <= 98
          break
        case 'Masculine woman':
          this.body.hasWomb = roll < 90
          this.body.hasPenis = roll > 90
          break
        case 'Feminine man':
          this.body.hasWomb = roll > 90
          this.body.hasPenis = roll < 90
          break
        default:
          this.body.hasWomb = roll < 50
          this.body.hasPenis = roll > 50
          break
      }
    }
  }

  /**
   * Assign gender.
   * @param community {Object} - The community object.
   */

  assignGender (community) {
    const roll = random.int(1, 100)
    const { hasPenis, hasWomb } = this.body
    const both = hasPenis && hasWomb
    const neither = !hasPenis && !hasWomb
    const intersex = both || neither
    const genders = get(community, 'traditions.genders')
    let g = this.body.hasWomb ? 'Woman' : this.body.hasPenis ? 'Man' : 'Woman'
    if (genders === 3) {
      if (roll > 90 || (intersex && roll > 10)) g = 'Third gender'
    } else if (genders > 3) {
      if (roll > 95 || (intersex && roll > 5)) g = 'Fifth gender'
      if ((g === 'Woman' && intersex) || (g === 'Woman' && roll > 90)) g = 'Masculine woman'
      if ((g === 'Man' && intersex) || (g === 'Man' && roll > 90)) g = 'Feminine man'
      if (g === 'Woman') g = 'Feminine woman'
      if (g === 'Man') g = 'Masculine man'
    }
    this.gender = g
  }

  /**
   * Determines a character's sexuality.
   * @param mateFor {string|null} - The gender of the character that this
   *   character is being created as a potential mate for. Used when generating
   *   potential mates for a character. (Default: `null`)
   */

  determineSexuality (mateFor) {
    const asexual = random.int(1, 100)
    if (!mateFor && asexual === 100) {
      this.sexuality = {
        androphilia: 0,
        gynephilia: 0,
        skoliophilia: 0
      }
    } else {
      const biases = { androphilia: 0, gynephilia: 0, skoliophilia: 0 }
      if (mateFor) {
        const androphilic = [ 'Feminine man', 'Man', 'Masculine man' ]
        const gynephilic = [ 'Masculine woman', 'Woman', 'Feminine woman' ]
        const skoliophilic = [ 'Masculine woman', 'Feminine man', 'Third gender', 'Fifth gender' ]
        biases.androphilia = androphilic.indexOf(mateFor) + 1
        biases.gynephilia = gynephilic.indexOf(mateFor) + 1
        biases.skoliophilia = skoliophilic.indexOf(mateFor) + 1
      }

      const roll = random.int(1, 10)
      const { hasPenis, hasWomb } = this.body

      if (roll < 10) {
        // Heterosexual bias
        if (hasPenis) biases.gynephilia += random.int(1, 3)
        if (hasWomb) biases.androphilia += random.int(1, 3)
      } else {
        // Homosexual bias
        if (hasPenis) biases.androphilia += random.int(1, 3)
        if (hasWomb) biases.gynephilia += random.int(1, 3)
        biases.skoliophilia += random.int(1, 3)
      }

      const { androphilia, gynephilia, skoliophilia } = biases
      const total = androphilia + gynephilia + skoliophilia

      this.sexuality = {
        androphilia: total ? androphilia / total : 0,
        gynephilia: total ? gynephilia / total : 0,
        skoliophilia: total ? skoliophilia / total : 0
      }
    }
  }

  /**
   * Make a personality adjustment.
   * @param adjustment {string} - A string specifying the type of personality
   *   adjustment to make. The first character should either be `+` (indicating
   *   that the trait should be increased) or `-` (indicating that it should be
   *   decreased), followed by the trait to adjust (one of the Big Five
   *   personality traits). Thus, the valid values are `+openness`,
   *   `-openness`, `+conscientiousness`, `-conscientiousness`,
   *   `+extraversion`, `-extraversion`, `+agreeableness`, `-agreeableness`,
   *   `+neuroticism`, or `-neuroticism`.
   */

  adjustPersonality (adjustment) {
    const dir = adjustment.substr(0, 1)
    const trait = adjustment.substr(1)
    if (dir === '-') {
      this.personality[trait] = Math.max(this.personality[trait] - 1, -3)
    } else {
      this.personality[trait] = Math.min(this.personality[trait] + 1, 3)
    }
  }

  /**
   * Adjust an individual's fertility. Men over the age of 16 and women between
   * the ages of 16 and 50 will see their fertility increase (or rebound from an
   * event like giving birth) each year. Women over the age of 50 will see their
   * fertility decrease each year.
   * @param year {number} - The current year, used to calculate the person's age.
   */

  adjustFertility (year) {
    if (typeof this.born === 'number') {
      const age = year - this.born
      const { hasPenis, hasWomb } = this.body
      if (age > 16 && (hasPenis || hasWomb)) {
        if (hasPenis || (hasWomb && age < 50)) {
          this.body.fertility = Math.min(this.body.fertility + 20, 100)
        } else {
          this.body.fertility = Math.max(this.body.fertility - 20, 0)
        }
      }
    }
  }

  /**
   * Kills the character.
   * @param tag {string} - Used in the history entry. Expected values are
   *   `infection`, `illness`, or `injury`. Any other value will simply pass
   *   through as a tag, with a generic entry.
   * @param community {Object} - The community object.
   * @param year {number} - The year that the character dies.
   */

  die (tag, community, year) {
    if (typeof year === 'number') {
      const age = typeof this.born === 'number' ? year - this.born : null
      let desc = null
      switch (tag) {
        case 'infection': desc = 'Died from infection following injury'; break
        case 'illness': desc = 'Died due to illnness'; break
        case 'injury': desc = 'Suffered a fatal injury'; break
        default: desc = 'Died'; break
      }
      const entry = age ? `${desc}, age ${age}` : desc

      this.died = year
      this.history.push({ year, entry, tag })
    } else {
      this.died = true
    }

    if (community && community.status && typeof community.status.discord === 'number') {
      let disturbance = 1
      community.status.discord += disturbance
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
    return gone.includes(this.body[key][side])
  }

  /**
   * Returns a random scar location.
   * @param year {number} - The year this happened.
   * @returns {string} - A random scar location.
   */

  takeRandomScar (year) {
    const possibleLocations = [ 'torso', 'right arm', 'right leg', 'left arm', 'left leg', 'head' ]
    const scar = shuffle(possibleLocations).pop()
    this.body.scars.push(scar)
    if (year) this.history.push({ year, event: `Suffered an injury to the ${scar}`, tag: 'injury' })
  }

  /**
   * If injury or illness means that you lose an arm, a leg, an ear, or an eye,
   * we use this method to determine if it's the right or the left.
   * @param key {string} - Either 'arms', 'legs', 'ears', or 'eyes'.
   * @returns {string|null} - Returns `left` or `right` if one was chosen, or
   *   `null` if both the left and right are already disabled, missing, blind,
   *   or deaf.
   */

  leftOrRight (key) {
    const leftGone = this.isGone(key, 'left')
    const rightGone = this.isGone(key, 'right')
    if (leftGone && rightGone) {
      return null
    } else if (leftGone) {
      return 'right'
    } else if (rightGone) {
      return 'left'
    } else {
      return random.int(0, 1) === 0 ? 'left' : 'right'
    }
  }

  /**
   * Removes a person's ear or eye.
   * @param part {string} - Either `ears` or `eyes`.
   * @param cause {string} - What caused the loss of the ear or eye. Valid
   *   values are `illness`, `infection`, or `injury`.
   * @param year {number} - The year this happened.
   */

  loseEarOrEye (part, cause, year) {
    const side = this.leftOrRight(part)
    const total = side === 'left'
      ? this.isGone(part, 'right')
      : this.isGone(part, 'left')
    if (side) this.body[part][side] = part === 'ears' ? 'Deaf' : 'Blind'

    if (year) {
      let entry = null
      const faculty = part === 'ears' ? 'hearing' : 'sight'
      const sing = part === 'ears' ? 'ear' : 'eye'
      const disability = part === 'ears' ? 'deafness' : 'blindness'

      if (side === null && cause === 'illness') {
        entry = 'Recovered from illness'
      } else if (side === null && cause === 'infection') {
        entry = 'Suffered injury which became infected, but recovered'
      } else if (side === null && cause === 'injury') {
        entry = 'Suffered a head wound'
      } else {
        entry = cause === 'infection'
          ? `Infected injury led to loss of ${faculty} in ${side} ear`
          : `Lost ${faculty} in ${side} ${sing} due to ${cause}`
        if (side !== null && total) {
          entry = `${entry}, resulting in total ${disability}`
        }
      }

      this.history.push({ year, entry, tag: cause })
    }
  }

  /**
   * Removes a random limb.
   * @param year {number} - The year this happened.
   */

  loseLimb (year) {
    const limbs = [
      [ 'arms', 'right' ], [ 'arms', 'left' ],
      [ 'legs', 'right' ], [ 'legs', 'left' ]
    ]
    const candidates = shuffle(limbs.filter(limb => !this.isGone(limb[0], limb[1])))

    if (year && candidates.length === 0) {
      this.takeRandomScar(year)
    } else {
      const limb = candidates.pop()
      this.body[limb[0]][limb[1]] = 'Missing'

      if (year) {
        this.history.push({
          year,
          entry: `Lost ${limb[1]} ${limb[0].substr(0, 3)} due to injury`,
          tag: 'injury'
        })
      }
    }
  }

  /**
   * What happens when someone gets sick?
   * @param community {Object} - The community object.
   * @param year {number} - The current year.
   * @param infection {boolean} - If `true`, the illness follows from an infected
   *   injury. (Default: `false`)
   * @param canDie {boolean} - Whether or not the character can die.  For
   *   example, when generating candidates for marriage, they need to be
   *   aged up, so obviously none of them should die before that can happen.
   *   (Default: `true`)
   */

  getSick (community, year, infection = false, canDie = true) {
    const table = infection ? tables.infection : tables.illness
    const unacceptable = canDie ? [] : [ 'death' ]
    const prognosis = checkUntil(table, unacceptable)
    const tag = infection ? 'infection' : 'illness'

    switch (prognosis) {
      case 'death': this.die(tag, community, year); break
      case 'deaf': this.loseEarOrEye('ears', tag, year); break
      case 'blindness': this.loseEarOrEye('eyes', tag, year); break
      default:
        const event = infection
          ? 'Recovered after injury became infected'
          : 'Recovered from illness'
        this.history.push({ year, event, tag })
        break
    }

    // If you survived, this might mean that you have a new calling to learn
    // magic. If this came from an infection, we already checked for this, so
    // we won't do it a second time.
    if (!infection) {
      this.checkMagicalCalling(community, year)
      this.delaySkill()
    }
  }

  /**
   * What happens when someone is injured?
   * @param community {Object} - The community object.
   * @param year {number} - The current year.
   * @param canDie {boolean} - Whether or not the character can die.  For
   *   example, when generating candidates for marriage, they need to be
   *   aged up, so obviously none of them should die before that can happen.
   *   (Default: `true`)
   */

  getHurt (community, year, canDie = true) {
    const unacceptable = canDie ? [] : [ 'death' ]
    const outcome = checkUntil(tables.injury, unacceptable)

    switch (outcome) {
      case 'killed': this.die('injury', community, year); break
      case 'deaf': this.loseEarOrEye('ears', 'injury', year); break
      case 'blind': this.loseEarOrEye('eyes', 'injury', year); break
      case 'limb': this.loseLimb(year); break
      case 'infection': this.getSick(community, year, true, canDie); break
      default: this.takeRandomScar(year); break
    }

    // If you survived, this might mean that you have a new calling to
    // learn magic.
    this.checkMagicalCalling(community, year)
    this.delaySkill()
  }

  /**
   * Delay skill learning. This happens when a person is ill, injured, starts a
   * new relationship, has a baby, or otherwise spends the year focused on
   * other pursuits.
   */

  delaySkill () {
    if (this.skills.willMaster !== undefined) this.skills.willMaster++
  }

  /**
   * Calculates a number representing a person's calling to learn magic.
   * @param community {Object} - The community object.
   * @returns {number} - A number representing the power of this person's
   *   calling to learn magic. This is read as a percentage, as in a 90%
   *   calling or a 115% calling.
   */

  magicalCalling (community) {
    let calling = 0
    const specialGenders = [ 'Third gender', 'Fifth gender' ]
    const semiSpecialGenders = [ 'Masculine woman', 'Feminine man' ]
    const maleGenders = [ 'Feminine man', 'Man', 'Masculine man' ]
    const femaleGenders = [ 'Masculine woman', 'Woman', 'Feminine woman' ]
    const magicTradition = get(community, 'traditions.magic')
    const isSecret = magicTradition && magicTradition === 'secret'

    // Basically, if your community thinks of magic as something that only
    // specific, special people can do, then you have a very strong calling if
    // either of your parents practiced magic, and very little else matters.
    // If your community thinks that anyone can practice magic, then those
    // things about you that stand out, especially those things that cross
    // boundaries, mark you as special and sacred.

    const factors = {
      isMotherMagic: isSecret ? 60 : 5,
      isFatherMagic: isSecret ? 60 : 5,
      isIntersex: isSecret ? 5 : 20,
      isSpecialGender: isSecret ? 5 : 20,
      isHomosexual: isSecret ? 2 : 10,
      isNeurodivergent: isSecret ? 6 : 25,
      isLittlePerson: isSecret ? 5 : 20,
      perIncident: isSecret ? 1 : 5
    }

    const mother = this.mother ? community.people[this.mother] : null
    const father = this.father ? community.people[this.father] : null
    if (mother && mother.skills.mastered.includes('Magic')) calling += factors.isMotherMagic
    if (father && father.skills.mastered.includes('Magic')) calling += factors.isFatherMagic
    if (specialGenders.includes(this.gender)) calling += factors.isSpecialGender
    if (semiSpecialGenders.includes(this.gender)) calling += factors.isSpecialGender / 2
    if (this.neurodivergent) calling += factors.isNeurodivergent
    if (this.achondroplasia) calling += factors.isLittlePerson

    const { hasPenis, hasWomb } = this.body
    const intersex = (hasPenis && hasWomb) || (!hasPenis && !hasWomb)
    if (intersex) calling += factors.isIntersex

    const { androphilia, gynephilia, skoliophilia } = this.sexuality
    calling += maleGenders.includes(this.gender) && androphilia ? androphilia * factors.isHomosexual : 0
    calling += femaleGenders.includes(this.gender) && gynephilia ? gynephilia * factors.isHomosexual : 0
    calling += skoliophilia ? skoliophilia * factors.isHomosexual : 0

    const injuries = this.history.filter(entry => entry.tag === 'injury')
    const illnesses = this.history.filter(entry => entry.tag === 'illness')
    calling += (injuries.length + illnesses.length) * factors.perIncident

    return calling
  }

  /**
   * Does the character face a crisis that forces her to begin learning magic?
   * @param community {Object} - The community object.
   * @param year {number} - The year this happened.
   */

  checkMagicalCalling (community, year) {
    if (!this.skills.mastered.includes('Magic') && !this.skills.learning === 'Magic') {
      if (random.int(1, 100) < this.magicalCalling(community)) {
        this.startLearning('Magic', year)
      }
    }
  }

  /**
   * Returns the skills that a person is ready to begin learning (including
   * some skills entered multiple times to make them more likely to be picked,
   * for example if the community encourages its members to learn that skill or
   * if several members have learned it and can teach it to others).
   * @param community {Object} - The community object.
   * @param specialize {string|boolean} - The name of a skill to specialize in
   *   if the person should specialize further, or `false` if there's no
   *   requirement to specialize right now.
   * @returns {[string]} - An array of strings providing the names of skills
   *   that the person is ready to learn.
   */

  skillsToLearn (community, specialize = false) {
    const favored = community && community.traditions && community.traditions.skill
      ? community.traditions.skill : false
    let learnable = specialize
      ? clone(skills.filter(skill => skill.name === specialize)).pop().specializations.map(skill => skill.name)
      : skills.map(skill => skill.name)

    if (!specialize) {
      skills.forEach(skill => {
        if (skill.specializations && this.skills.mastered.includes(skill.name)) {
          learnable = [ ...learnable, ...skill.specializations.map(skill => skill.name) ]
        }
      })
    }

    // Remove things you've already learned.
    learnable = learnable.filter(skill => !this.skills.mastered.includes(skill))

    // If your community encourages a particular skill and you haven't
    // mastered it yet, there's some social pressure to do so. How effective
    // that pressure is depends on how agreeable you are.

    if (favored && learnable.includes(favored) && !this.skills.mastered.includes(favored)) {
      const pressure = Math.max(Math.ceil(this.personality.agreeableness + 1), 0)
      for (let p = 0; p < pressure; p++) learnable = [ ...learnable, favored ]
    }

    // The more people who have mastered a skill in your community, the more
    // likely it is that you'll learn it from them.

    if (community && community.people) {
      let communityMastery = []
      const living = Object.values(community.people).filter(p => !p.died)
      living.forEach(teacher => {
        const { mastered } = teacher.skills
        if (mastered && Array.isArray(mastered) && mastered.length > 0) {
          communityMastery = [ ...communityMastery, ...mastered ]
        }
      })
      communityMastery.forEach(skill => {
        if (learnable.includes(skill)) learnable = [...learnable, skill]
      })
    }

    return shuffle(learnable)
  }

  /**
   * Start learning a skill.
   * @param skill {string} - The name of the skill you're starting to learn.
   * @param year {number} - The year when you start learning it.
   */

  startLearning (skill, year) {
    if (typeof skill === 'string' && skill !== '' && typeof year === 'number') {
      this.skills.learning = skill
      if (year && typeof this.intelligence === 'number') {
        this.skills.willMaster = Math.ceil(year + 5 - this.intelligence)
        this.history.push({ year, entry: `Began learning ${skill.toLowerCase()}`, tag: 'skill' })
      }
    }
  }

  /**
   * Picks a random skill to start learning.
   * @param community {Object} - The community object.
   * @param year {number} - The year in which the person starts learning this
   *   new skill.
   * @param prev {string} - The name of the skill that the person most recently
   *   learned. If it has specializations, or is itself a specialization, then
   *   there's a 50% chance that the person will specialize further in that
   *   skill.
   */

  pickNewSkill (community, year, prev = null) {
    let couldSpecialize = null
    skills.forEach(skill => {
      const { name, specializations } = skill
      const hasSpecalizations = specializations && Array.isArray(specializations) && specializations.length > 0
      const matches = hasSpecalizations ? specializations.filter(skill => skill.name === prev) : []
      if (hasSpecalizations && (name === prev || matches.length > 0)) couldSpecialize = name
    })

    let learnable = couldSpecialize && random.int(0, 1) === 1
      ? this.skillsToLearn(community, couldSpecialize)
      : this.skillsToLearn(community)
    const discouraged = skills.filter(skill => skill.discouraged).map(skill => skill.name)
    const rare = skills.filter(skill => skill.rare).map(skill => skill.name)
    const younger = skills.filter(skill => skill.younger).map(skill => skill.name)
    const age = typeof year === 'number' && this.born && typeof this.born === 'number' ? year - this.born : null

    if (discouraged.includes(learnable[0])) learnable = shuffle(learnable)
    if (rare.includes(learnable[0])) learnable = shuffle(learnable)
    if (age && younger.includes(learnable[0]) && age > 56) learnable = shuffle(learnable)
    if (learnable[0] === 'Magic' && random.int(1, 100) > this.magicalCalling(community)) learnable = shuffle(learnable)
    this.startLearning(learnable[0], year)
  }

  /**
   * Age a character. This includes checking for infant mortality and dying of
   * old age, executing the personal event currently assigned to the person,
   * adjusting fertility, calling family and breakup events, and managing skill
   * learning. This is, in essence, the "core loop" for developing individual
   * characters, called by the "core loop" of the Community object's `age`
   * method.
   * @param community {Object} - The community object.
   * @param year {number} - The year.
   * @param canDie {boolean} - Whether or not the character can die.  For
   *   example, when generating candidates for marriage, they need to be
   *   aged up, so obviously none of them should die before that can happen.
   *   (Default: `true`)
   */

  age (community, year, canDie = true) {
    const age = typeof year === 'number' && typeof this.born === 'number' ? year - this.born : false

    // Dying of old age
    if (age && canDie && age > this.longevity) {
      const chance = (age - this.longevity) * 10
      if (random.int(1, 100) < chance) this.die(null, community, year)
    }

    // Infant mortality
    if (age && age < 5) {
      let flip = 0
      for (let i = 0; i < age; i++) flip = Math.max(flip, random.int(1, 100))
      if (flip < 50) this.event = 'sickness'
    }

    // Handling personal events, but first checking to see if the character
    // died of old age.

    if (!this.died) {
      if (age) this.adjustFertility(year)

      const traits = Object.keys(this.personality)
      let adjustments = []
      traits.forEach(trait => {
        adjustments = [ ...adjustments, `+${trait}`, `-${trait}` ]
      })

      if (adjustments.includes(this.event)) this.adjustPersonality(this.event)
      if (this.event === 'sickness') this.getSick(community, year, canDie)
      if (this.event === 'injury') this.getHurt(community, year, canDie)
    }

    // Handling skills, but first checking again if the character died because
    // it's possible she just died of illness or injury.

    if (!this.died) {
      let skillJustMastered = null
      const { learning, willMaster } = this.skills
      if (typeof learning === 'string' && typeof willMaster === 'number' && learning !== null && willMaster < year) {
        skillJustMastered = this.skills.learning
        this.skills.mastered = [ ...this.skills.mastered, skillJustMastered ]
        if (year) this.history.push({ year, entry: `Recognized as a master of ${skillJustMastered.toLowerCase()}`, tag: 'skills' })
        this.skills.learning = null
      }

      if (age && age > 14 && !this.skills.learning) this.pickNewSkill(community, year, skillJustMastered)
    }
  }
}
