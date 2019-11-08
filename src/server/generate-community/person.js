import random from 'random'
import tables from '../../data/community-creation'
import skills from '../../data/skills'
import { clone, get } from '../../shared/utils'
import { check, checkUntil } from './check'
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
   */

  random (community = null, born = null, specifiedGender = null) {
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
      achondroplasia: random.float(0, 100) < 0.004
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

    // Without a punishing heteronormative society, there will no doubt be a
    // lot more gay people in the Fifth World, but 50% is a little high even
    // so. Population dynamics would seem to require at least some skew towards
    // heterosexuality. To reflect this, we take two random numbers and pick
    // the lowest (lower on the Kinsey Scale, e.g., more heterosexual). This
    // should mean a 25/75 split of homosexual and heterosexual relationships,
    // on average, which seems about right.

    this.sexualOrientation = Math.min(randomDistributed(), randomDistributed())
    this.chooseSexGender(community, specifiedGender)
    this.fertility = 0

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
   * Choose sex and gender.
   * @param community {Object} - The community object.
   * @param gender {string} - If given a string, that will be set to the
   *   person's gender, and a sex will be determined based on that. If not,
   *   we'll determine sex randomly, and then determine a gender based on sex.
   *   (Default: `null`)
   * @returns {Object} - An object with two properties: `sex`, a string
   *   providing the person's sex, and `gender`, a string providing the
   *   person's gender.
   */

  chooseSexGender (community, gender = null) {
    this.sex = null
    this.gender = null

    const genders = get(community, 'traditions.genders') || 3
    const roll = random.int(1, 100)

    if (gender) {
      // A gender has been specified, so we need to determine a randomized sex.
      this.gender = gender
      switch (gender) {
        case 'Woman': this.sex = roll <= 98 ? 'Female' : roll <= 99 ? 'Intersex' : 'Male'; break
        case 'Man': this.sex = roll <= 98 ? 'Male' : roll <= 99 ? 'Intersex' : 'Female'; break
        case 'Third gender': this.sex = roll <= 48 ? 'Female' : roll <= 99 ? 'Male' : 'Intersex'; break
        case 'Feminine woman': this.sex = roll <= 98 ? 'Female' : roll <= 99 ? 'Intersex' : 'Male'; break
        case 'Masculine woman': this.sex = roll <= 95 ? 'Female' : roll <= 99 ? 'Male' : 'Intersex'; break
        case 'Masculine man': this.sex = roll <= 98 ? 'Male' : roll <= 99 ? 'Intersex' : 'Female'; break
        case 'Feminine man': this.sex = roll <= 95 ? 'Male' : roll <= 99 ? 'Female' : 'Intersex'; break
        case 'Fifth gender': this.sex = roll <= 49 ? 'Female' : roll <= 99 ? 'Male' : 'Intersex'; break
        default: this.sex = roll <= 48 ? 'Female' : roll <= 99 ? 'Male' : 'Intersex'; break
      }
    } else {
      // We're determining a random sex first, and then a random gender based
      // on that sex.
      this.sex = check(tables.sexes, random.int(1, 100))
      switch (genders) {
        case 2:
          // Just two genders. In this setup, 99% of females are women and 1%
          // are men. Likewise, 99% of males are men and 1% are women.
          if (this.sex === 'Female') {
            this.gender = roll <= 99 ? 'Woman' : 'Man'
          } else if (this.sex === 'Male') {
            this.gender = roll <= 99 ? 'Man' : 'Woman'
          } else {
            this.gender = roll <= 50 ? 'Woman' : 'Man'
          }
          break
        case 4:
          // Four genders separates feminine women (you might call them
          // "femmes" if you find that easier) and masculine women (you might
          // call them "butch") as two distinct genders. Likewise, they split
          // masculine men ("macho"?) and feminine men (I don't know that our
          // heteronormative society has any term for this that isn't intensely
          // derogatory in a way that a society with four genders would utterly
          // reject) into two distinct genders. This gives us a bit of a more
          // even split, with 2/3 of females as feminine women and 1/3 as
          // masculine women, and correspondingly 2/3 of males as masculine men
          // and 1/3 as feminine men.
          if (this.sex === 'Female') {
            this.gender = roll <= 66 ? 'Feminine woman' : roll <= 99 ? 'Masculine woman' : 'Feminine man'
          } else if (this.sex === 'Male') {
            this.gender = roll <= 66 ? 'Masculine man' : roll <= 99 ? 'Feminine man' : 'Masculine woman'
          } else {
            this.gender = roll <= 33 ? 'Masculine woman' : roll <= 66 ? 'Feminine man' : roll <= 83 ? 'Feminine woman' : 'Masculine man'
          }
          break
        case 5:
          // Five genders work a lot like four genders, but with an even more
          // androgynous fifth gender between masculine women and feminine men.
          if (this.sex === 'Female') {
            this.gender = roll <= 55 ? 'Feminine woman' : roll <= 92 ? 'Masculine woman' : roll <= 97 ? 'Fifth gender' : roll <= 99 ? 'Feminine man' : 'Masculine man'
          } else if (this.sex === 'Male') {
            this.gender = roll <= 55 ? 'Masculine man' : roll <= 92 ? 'Feminine man' : roll <= 97 ? 'Fifth gender' : roll <= 99 ? 'Masculine woman' : 'Feminine woman'
          } else {
            this.gender = roll <= 58 ? 'Fifth gender' : roll <= 78 ? 'Feminine man' : roll <= 98 ? 'Masculine woman' : roll <= 99 ? 'Feminine woman' : 'Masculine man'
          }
          break
        default:
          // The default is three genders: women, men, and a third gender that
          // encompasses what we today might consider non-binary genders.
          if (this.sex === 'Female') {
            this.gender = roll <= 90 ? 'Woman' : roll <= 99 ? 'Third gender' : 'Man'
          } else if (this.sex === 'Male') {
            this.gender = roll <= 90 ? 'Man' : roll <= 99 ? 'Third gender' : 'Woman'
          } else {
            this.gender = roll <= 80 ? 'Third gender' : roll <= 90 ? 'Woman' : 'Man'
          }
          break
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
      if (age > 16 && (this.sex === 'Male' || age < 50)) {
        this.fertility = Math.min(this.fertility + 20, 100)
      } else {
        this.fertility = Math.max(this.fertility - 20, 0)
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
    if (this.sex === 'Intersex') calling += factors.isIntersex
    if (specialGenders.includes(this.gender)) calling += factors.isSpecialGender
    if (semiSpecialGenders.includes(this.gender)) calling += factors.isSpecialGender / 2
    if (this.sexualOrientation > 2) calling += factors.isHomosexual
    if (this.neurodivergent) calling += factors.isNeurodivergent
    if (this.achondroplasia) calling += factors.isLittlePerson

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
      // const familyEvents = [ '+openness', '+extraversion', '+agreeableness' ]
      // const breakupEvents = [ '-extraversion', '-agreeableness', '+neuroticism' ]
      let adjustments = []
      traits.forEach(trait => {
        adjustments = [ ...adjustments, `+${trait}`, `-${trait}` ]
      })

      if (adjustments.includes(this.event)) this.adjustPersonality(this.event)
      // if (familyEvents.includes(this.event)) this.familyEvent(year)
      // if (breakupEvents.includes(this.event)) this.breakup(year)
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
