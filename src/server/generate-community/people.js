import random from 'random'
import { check, checkUntil } from './check'
import shuffle from './shuffle'
import skills from '../../data/skills'
import tables from '../../data/community-creation'

/**
 * Choose sex and gender.
 * @param community {Object} - The community object.
 * @param gender {string} - If given a string, that will be set to the person's
 *   gender, and a sex will be determined based on that. If not, we'll
 *   determine sex randomly, and then determine a gender based on sex.
 *   (Default: `null`)
 * @returns {Object} - An object with two properties: `sex`, a string providing
 *   the person's sex, and `gender`, a string providing the person's gender.
 */

const chooseSexGender = (community, gender = null) => {
  const res = { sex: null, gender: null }
  const roll = random.int(1, 100)
  if (gender) {
    res.gender = gender
    switch (gender) {
      case 'Woman': res.sex = roll <= 98 ? 'Female' : roll <= 99 ? 'Intersex' : 'Male'; break
      case 'Man': res.sex = roll <= 98 ? 'Male' : roll <= 99 ? 'Intersex' : 'Female'; break
      case 'Third gender': res.sex = roll <= 48 ? 'Female' : roll <= 99 ? 'Male' : 'Intersex'; break
      case 'Feminine woman': res.sex = roll <= 98 ? 'Female' : roll <= 99 ? 'Intersex' : 'Male'; break
      case 'Masculine woman': res.sex = roll <= 95 ? 'Female' : roll <= 99 ? 'Male' : 'Intersex'; break
      case 'Masculine man': res.sex = roll <= 98 ? 'Male' : roll <= 99 ? 'Intersex' : 'Female'; break
      case 'Feminine man': res.sex = roll <= 95 ? 'Male' : roll <= 99 ? 'Female' : 'Intersex'; break
      case 'Fifth gender': res.sex = roll <= 49 ? 'Female' : roll <= 99 ? 'Male' : 'Intersex'; break
      default: res.sex = roll <= 48 ? 'Female' : roll <= 99 ? 'Male' : 'Intersex'; break
    }
  } else {
    res.sex = check(tables.sexes, random.int(1, 100))
    switch (community.traditions.genders) {
      case 2:
        if (res.sex === 'Female') {
          res.gender = roll <= 99 ? 'Woman' : 'Man'
        } else if (res.sex === 'Male') {
          res.gender = roll <= 99 ? 'Man' : 'Woman'
        } else {
          res.gender = roll <= 50 ? 'Woman' : 'Man'
        }
        break
      case 4:
        if (res.sex === 'Female') {
          res.gender = roll <= 66 ? 'Feminine woman' : roll <= 99 ? 'Masculine woman' : 'Feminine man'
        } else if (res.sex === 'Male') {
          res.gender = roll <= 66 ? 'Masculine man' : roll <= 99 ? 'Feminine man' : 'Masculine woman'
        } else {
          res.gender = roll <= 33 ? 'Masculine woman' : roll <= 66 ? 'Feminine man' : roll <= 83 ? 'Feminine woman' : 'Masculine man'
        }
        break
      case 5:
        if (res.sex === 'Female') {
          res.gender = roll <= 55 ? 'Feminine woman' : roll <= 92 ? 'Masculine woman' : roll <= 97 ? 'Fifth gender' : roll <= 99 ? 'Feminine man' : 'Masculine man'
        } else if (res.sex === 'Male') {
          res.gender = roll <= 55 ? 'Masculine man' : roll <= 92 ? 'Feminine man' : roll <= 97 ? 'Fifth gender' : roll <= 99 ? 'Masculine woman' : 'Feminine woman'
        } else {
          res.gender = roll <= 58 ? 'Fifth gender' : roll <= 78 ? 'Feminine man' : roll <= 98 ? 'Masculine woman' : roll <= 99 ? 'Feminine woman' : 'Masculine man'
        }
        break
      default:
        if (res.sex === 'Female') {
          res.gender = roll <= 90 ? 'Woman' : roll <= 99 ? 'Third gender' : 'Man'
        } else if (res.sex === 'Male') {
          res.gender = roll <= 90 ? 'Man' : roll <= 99 ? 'Third gender' : 'Woman'
        } else {
          res.gender = roll <= 80 ? 'Third gender' : roll <= 90 ? 'Woman' : 'Man'
        }
        break
    }
  }

  return res
}

/**
 * Generate a character ex nihilo.
 * @param community {Object} - The community object.
 * @param born {number} - The year that the character is born.
 * @param age {number} - How old the character should be (Default: 0).
 * @param chosenGender {string} - The gender that the person should be, if
 *   that's important (as it is when generating potential relationship
 *   partners). Setting this to `null` means it's randomly chosen.
 *   (Default: `null`)
 * @returns {Object} - An object representing the person.
 */

const generatePerson = (community, born, age = 0, chosenGender = null) => {
  const randomDistributed = random.normal(0, 1)
  const longevity = random.normal(90, 5)
  const { sex, gender } = chooseSexGender(community, chosenGender)

  const eyes = random.float(0, 100) < 0.016
    ? { left: 'Blind', right: 'Blind' }
    : { left: 'Healthy', right: 'Healthy' }

  const ears = random.float(0, 100) < 0.2
    ? { left: 'Deaf', right: 'Deaf' }
    : { left: 'Healthy', right: 'Healthy' }

  const person = {
    born,
    personality: {
      openness: randomDistributed(),
      conscientiousness: randomDistributed(),
      extraversion: randomDistributed(),
      agreeableness: randomDistributed(),
      neuroticism: randomDistributed()
    },
    longevity: longevity(),
    intelligence: randomDistributed(),
    neurodivergent: random.int(1, 100) === 1,
    sexualOrientation: randomDistributed(),
    sex,
    gender,
    fertility: 0,
    bodyType: randomDistributed(),
    limbs: {
      leftarm: random.float(0, 100) < 0.1 ? 'Disabled' : 'Healthy',
      rightarm: random.float(0, 100) < 0.1 ? 'Disabled' : 'Healthy',
      leftleg: random.float(0, 100) < 0.1 ? 'Disabled' : 'Healthy',
      rightleg: random.float(0, 100) < 0.1 ? 'Disabled' : 'Healthy'
    },
    eyes,
    ears,
    scars: [],
    achondroplasia: random.float(0, 100) < 0.004,
    psychopath: null,
    history: [],
    skills: {
      mastered: []
    }
  }

  // There's a 1% chance this person is a psychopath...
  if (random.int(1, 100) === 1) {
    person.psychopath = 1
    person.personality.agreeableness -= 2
    person.personality.conscientiousness -= 2
    person.personality.neuroticism += 2
    person.personality.extraversion += 1
    person.personality.openness += 1
  }

  // Age up
  for (let a = 0; a < age; a++) {
    agePerson(community, person, born + a)
  }

  return person
}

/**
 * Adjust an individual's fertility. Men over the age of 16 and women between
 * the ages of 16 and 50 will see their fertility increase (or rebound from an
 * event like giving birth) each year. Women over the age of 50 will see their
 * fertility decrease each year.
 * @param person {Object} - The person object.
 * @param year {number} - The current year, used to calculate the person's age.
 */

const adjustFertility = (person, year) => {
  const age = year - person.born

  if (age > 16 && (person.sex === 'Male' || age < 50)) {
    person.fertility = Math.min(person.fertility + 20, 100)
  } else {
    person.fertility = Math.max(person.fertility - 20, 0)
  }
}

/**
 * What happens when someone gets sick?
 * @param community {Object} - The community object.
 * @param person {Object} - The person object.
 * @param year {number} - The current year.
 * @param infection {boolean} - If `true`, the illness follows from an infected
 *   injury. (Default: `false`)
 * @param canDie {boolean} - Whether or not the character can die.  For
 *   example, when generating candidates for marriage, they need to be
 *   aged up, so obviously none of them should die before that can happen.
 *   (Default: `true`)
 */

const getSick = (community, person, year, infection = false, canDie = true) => {
  const table = infection ? tables.infection : tables.illness
  const tag = infection ? 'injury' : 'illness'
  const unacceptable = canDie ? [] : [ 'death' ]
  const prognosis = checkUntil(table, unacceptable)
  let event = null
  switch (prognosis) {
    case 'death':
      const age = year - person.born
      person.died = year
      event = infection
        ? `Died from infection following injury, age ${age}`
        : `Died due to illnness, age ${age}`
      person.history.push({ year, event, tag })
      if (community && community.status && community.status.discord) {
        community.status.discord += 2
        if (age < 20) community.status.discord++
      }
      break
    case 'deaf':
      if (person.ears.left === 'Deaf' && person.ears.right === 'Deaf') {
        const event = infection
          ? 'Suffered injury which became infected, but recovered'
          : 'Recovered from illness'
        person.history.push({ year, event, tag })
      } else if (person.ears.left === 'Deaf') {
        person.ears.right = 'Deaf'
        const event = infection
          ? 'Infected injury led to loss of hearing in right ear, resulting in total deafness'
          : 'Lost hearing in right ear due to illness, resulting in total deafness'
        person.history.push({ year, event, tag })
      } else if (person.ears.right === 'Deaf') {
        person.ears.left = 'Deaf'
        const event = infection
          ? 'Infected injury led to loss of hearing in left ear, resulting in total deafness'
          : 'Lost hearing in left ear due to illness, resulting in total deafness'
        person.history.push({ year, event, tag })
      } else {
        const ear = random.int(0, 1) === 1 ? 'left' : 'right'
        const event = infection
          ? `Infected injury led to loss of hearing in ${ear} ear`
          : `Lost hearing in ${ear} ear due to illness`
        person.ears[ear] = 'Deaf'
        person.history.push({ year, event, tag })
      }
      break
    case 'blindness':
      if (person.eyes.left === 'Blind' && person.eyes.right === 'Blind') {
        const event = infection
          ? 'Suffered injury which became infected, but recovered'
          : 'Recovered from illness'
        person.history.push({ year, event, tag })
      } else if (person.eyes.left === 'Blind') {
        const event = infection
          ? 'Infected injury led to loss of sight in right eye, resulting in total blindness'
          : 'Lost sight in right eye due to illness, resulting in total blindness'
        person.eyes.right = 'Blind'
        person.history.push({ year, event, tag })
      } else if (person.eyes.right === 'Blind') {
        const event = infection
          ? 'Infected injury led to loss of sight in left eye, resulting in total blindness'
          : 'Lost sight in left eye due to illness, resulting in total blindness'
        person.eyes.left = 'Blind'
        person.history.push({ year, event, tag })
      } else {
        const eye = random.int(0, 1) === 1 ? 'left' : 'right'
        const event = infection
          ? `Infected injury led to loss of sight in ${eye} eye`
          : `Lost sight in ${eye} ear due to illness`
        person.eyes[eye] = 'Blind'
        person.history.push({ year, event, tag })
      }
      break
    default:
      event = infection
        ? 'Recovered after injury became infected'
        : 'Recovered from illness'
      person.history.push({ year, event, tag })
      break
  }
}

/**
 * What happens when someone gets injured?
 * @param community {Object} - The community object.
 * @param person {Object} - The person object.
 * @param year {number} - The current year.
 * @param canDie {boolean} - Whether or not the character can die.  For
 *   example, when generating candidates for marriage, they need to be
 *   aged up, so obviously none of them should die before that can happen.
 *   (Default: `true`)
 */

const getInjured = (community, person, year, canDie = true) => {
  const possibleLocations = [ 'torso', 'right arm', 'right leg', 'left arm', 'left leg', 'head' ]
  const randomScarLocation = shuffle(possibleLocations).pop()

  const unacceptable = canDie ? [] : [ 'killed' ]
  const tag = 'injury'
  const outcome = checkUntil(tables.injury, unacceptable)
  switch (outcome) {
    case 'deaf':
      if (person.ears.left === 'Deaf' && person.ears.right === 'Deaf') {
        person.scars.push('head')
        person.history.push({ year, event: 'Suffered a head wound', tag })
      } else if (person.ears.left === 'Deaf') {
        person.ears.right = 'Deaf'
        person.scars.push('right ear')
        person.history.push({ year, event: 'Lost hearing in right ear due to injury, resulting in total deafness', tag })
      } else if (person.ears.right === 'Deaf') {
        person.ears.left = 'Deaf'
        person.scars.push('left ear')
        person.history.push({ year, event: 'Lost hearing in left ear due to injury, resulting in total deafness', tag })
      } else {
        const ear = random.int(0, 1) === 1 ? 'left' : 'right'
        person.ears[ear] = 'Deaf'
        person.scars.push(`${ear} ear`)
        person.history.push({ year, event: `Lost hearing in ${ear} ear due to injury`, tag })
      }
      break
    case 'blindness':
      if (person.eyes.left === 'Blind' && person.eyes.right === 'Blind') {
        person.scars.push('head')
        person.history.push({ year, event: 'Suffered a head wound', tag })
      } else if (person.eyes.left === 'Blind') {
        person.eyes.right = 'Blind'
        person.scars.push('right eye')
        person.history.push({ year, event: 'Lost sight in right eye due to injury, resulting in total blindness', tag })
      } else if (person.eyes.right === 'Blind') {
        person.eyes.left = 'Blind'
        person.scars.push('left eye')
        person.history.push({ year, event: 'Lost sight in left eye due to injury, resulting in total blindness', tag })
      } else {
        const eye = random.int(0, 1) === 1 ? 'left' : 'right'
        person.eyes[eye] = 'Blind'
        person.scars.push(`${eye} eye`)
        person.history.push({ year, event: `Lost sight in ${eye} eye due to injury`, tag })
      }
      break
    case 'limb':
      const limbs = { leftarm: 'left arm', rightarm: 'right arm', leftleg: 'left leg', rightleg: 'right leg' }
      const candidates = Object.keys(limbs).filter(limb => person.limbs[limb] === 'Healthy')
      const shuffledCandidates = shuffle(candidates)
      if (shuffledCandidates.length > 0) {
        const limb = shuffledCandidates.pop()
        person.scars.push(limbs[limb])
        person.limbs[limb] = 'Missing'
        person.history.push({ year, event: `Lost ${limbs[limb]} due to injury`, tag })
      } else {
        person.scars.push('torso')
        person.history.push({ year, event: 'Suffered an injury to the torso', tag })
      }
      break
    case 'killed':
      const age = year - person.born
      person.died = year
      person.history.push({ year, event: `Suffered a fatal injury, age ${age}` })
      if (community && community.status && community.status.discord) {
        community.status.discord += 2
        if (age < 20) community.status.discord++
      }
      break
    case 'infection':
      person.scars.push(randomScarLocation)
      getSick(community, person, year, true)
      break
    default:
      person.scars.push(randomScarLocation)
      person.history.push({ year, event: `Suffered an injury to the ${randomScarLocation}`, tag })
      break
  }
}

/**
 * Returns whether or not the person can learn magic.
 * @param community {Object} - The community object.
 * @param person {Object} - The person
 * @returns {boolean} - Returns `true` if the person has a calling to begin
 *   learning magic, or `false` if she doesn't.
 */

const checkMagicalCalling = (community, person) => {
  let calling = 0
  const specialGenders = [ 'Third gender', 'Fifth gender' ]
  const semiSpecialGenders = [ 'Masculine woman', 'Feminine man' ]
  const isSecret = community.traditions.magic === 'secret'
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

  // TODO: If mother knows magic
  // TODO: If father knows magic
  if (person.sex === 'Intersex') calling += factors.isIntersex
  if (specialGenders.includes(person.gender)) calling += factors.isSpecialGender
  if (semiSpecialGenders.includes(person.gender)) calling += factors.isSpecialGender
  if (person.sexualOrientation > 2) calling += factors.isHomosexual
  if (person.neurodivergent) calling += factors.isNeurodivergent
  if (person.achondroplasia) calling += factors.isLittlePerson

  const injuries = person.history.filter(entry => entry.tag === 'injury')
  const illnesses = person.history.filter(entry => entry.tag === 'illnesses')
  calling += (injuries.length + illnesses.length) * factors.perIncident

  return random.int(1, 100) < calling
}

/**
 * Choose a new skill to learn.
 * @param community {Object} - The community object.
 * @param person {Object} - The person learning.
 * @param year {number} - The year when the person is starting to learn.
 * @param lastSkill {string} - The last skill that the person learned. If that
 *   skill has specializations, there's a 50% chance that the person picks up
 *   a specialization next. (Default: `null`)
 */

const startLearning = (community, person, year, lastSkill = null) => {
  const base = skills.map(skill => skill.name)

  const specializations = {}
  skills.forEach(skill => {
    if (skill.specializations) {
      specializations[skill.name] = skill.specializations.map(skill => skill.name)
    }
  })

  const discouraged = skills.filter(skill => skill.discouraged).map(skill => skill.name)
  const rare = skills.filter(skill => skill.rare).map(skill => skill.name)
  const younger = skills.filter(skill => skill.younger).map(skill => skill.name)

  let candidates = []
  if (lastSkill && specializations[lastSkill] && random.int(1, 2) === 1) {
    candidates = specializations[lastSkill]
  } else {
    const favored = community.traditions.skill
    candidates = [ ...base, favored, favored, favored, favored, favored ]
    person.skills.mastered.forEach(skill => {
      if (specializations[skill]) candidates = [ ...candidates, ...specializations[skill] ]
    })
  }
  candidates = candidates.filter(skill => !person.skills.mastered.includes(skill))

  let shuffled = shuffle(candidates)

  if (discouraged.includes(shuffled[0])) shuffled = shuffle(candidates)
  if (rare.includes(shuffled[0])) shuffled = shuffle(candidates)
  if (younger.includes(shuffled[0]) && year - person.born > 56) shuffled = shuffle(candidates)
  if (shuffled[0] === 'Magic' && !checkMagicalCalling(community, person)) shuffled = shuffle(candidates)

  person.skills.learning = shuffled[0]
  person.skills.willMaster = Math.ceil(year + 5 - person.intelligence)
}

/**
 * Age an individual.
 * @param community {Object} - The community object.
 * @param person {Object} - The person to age.
 * @param year {number} - The current year.
 * @param canDie {boolean} - Whether or not the character can die.  For
 *   example, when generating candidates for marriage, they need to be
 *   aged up, so obviously none of them should die before that can happen.
 *   (Default: `true`)
 */

const agePerson = (community, person, year, canDie = true) => {
  adjustFertility(person, year)
  const event = community && community.status && community.status.event
    ? community.status.event
    : 'peace'
  const age = year - person.born

  if (canDie && age > person.longevity) {
    const chance = (age - person.longevity) * 10
    if (random.int(1, 100) < chance) {
      person.died = year
      person.history.push({ year, event: `Passed away at the age of ${age}` })
    }
  }

  if (!person.died && age < 5) {
    let chance = 0
    for (let i = 0; i < age; i++) {
      chance = Math.max(chance, random.int(1, 100))
    }
    if (chance < 50) getSick(community, person, year, canDie)
  } else if (!person.died) {
    let table = tables.personalEventsAtPeace
    switch (event) {
      case 'conflict': table = tables.personalEventsInConflict; break
      case 'sickness': table = tables.personalEventsInSickness; break
      case 'lean': table = tables.personalEventsInLeanTimes; break
    }
    const personal = check(table, random.int(1, 100))

    switch (personal) {
      case '+openness':
        if (person.personality.openness < 3) {
          person.personality.openness += 1
          // familyEvent(community, person, year)
        }
        break
      case '-openness':
        if (person.personality.openness > -3) person.personality.openness -= 1
        break
      case '+conscientiousness':
        if (person.personality.conscientiousness < 3) person.personality.conscientiousness += 1
        break
      case '-conscientiousness':
        if (person.personality.conscientiousness > -3) person.personality.conscientiousness -= 1
        break
      case '+extraversion':
        if (person.personality.extraversion < 3) {
          person.personality.extraversion += 1
          // familyEvent(community, person, year)
        }
        break
      case '-extraversion':
        if (person.personality.extraversion > -3) {
          person.personality.extraversion -= 1
          // breakup(community, person, year)
        }
        break
      case '+agreeableness':
        if (person.personality.agreeableness < 3) {
          person.personality.agreeableness += 1
          // familyEvent(community, person, year)
        }
        break
      case '-agreeableness':
        if (person.personality.agreeableness > -3) {
          person.personality.agreeableness -= 1
          // breakup(community, person, year)
        }
        break
      case '+neuroticism':
        if (person.personality.neuroticism < 3) {
          person.personality.neuroticism += 1
          // breakup(community, person, year)
        }
        break
      case '-neuroticism':
        if (person.personality.neuroticism > -3) person.personality.neuroticism -= 1
        break
      case 'sickness':
        if (person.skills.willMaster) person.skills.willMaster++
        getSick(community, person, year, canDie)
        break
      case 'injury':
        if (person.skills.willMaster) person.skills.willMaster++
        getInjured(community, person, year, canDie)
        break
      default:
        break
    }
  }

  if (person.skills.willMaster < year) {
    person.skills.mastered = [ ...person.skills.mastered, person.skills.learning ]
    person.skills.learning = null
  }

  if (age > 14 && !person.skills.learning) {
    startLearning(community, person, year)
  }
}

/**
 * Age everyone in the community.
 * @param community {Object} - The community object.
 * @param year {number} - The current year.
 */

const age = (community, year) => {
  community.people.filter(person => !person.died).forEach(person => {
    agePerson(community, person, year)
  })
}

export {
  generatePerson,
  age
}
