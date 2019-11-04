import random from 'random'
import { check, checkUntil } from './check'
import shuffle from './shuffle'
import tables from '../../data/community-creation'

/**
 * Generate a character ex nihilo.
 * @param community {Object} - The community object.
 * @param born {number} - The year that the character is born.
 * @param age {number} - How old the character should be (Default: 0).
 * @returns {Object} - An object representing the person.
 */

const generatePerson = (community, born, age = 0) => {
  const randomDistributed = random.normal(0, 1)
  const longevity = random.normal(90, 5)

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
    sex: check(tables.sexes, random.int(1, 100)),
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
    history: []
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
  const unacceptable = canDie ? [] : [ 'death' ]
  const prognosis = checkUntil(table, unacceptable)
  switch (prognosis) {
    case 'death':
      const age = year - person.born
      person.died = year
      const event = infection
        ? `Died from infection following injury, age ${age}`
        : `Died due to illnness, age ${age}`
      person.history.push({ year, event })
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
        person.history.push({ year, event })
      } else if (person.ears.left === 'Deaf') {
        person.ears.right = 'Deaf'
        const event = infection
          ? 'Infected injury led to loss of hearing in right ear, resulting in total deafness'
          : 'Lost hearing in right ear due to illness, resulting in total deafness'
        person.history.push({ year, event })
      } else if (person.ears.right === 'Deaf') {
        person.ears.left = 'Deaf'
        const event = infection
          ? 'Infected injury led to loss of hearing in left ear, resulting in total deafness'
          : 'Lost hearing in left ear due to illness, resulting in total deafness'
        person.history.push({ year, event })
      } else {
        const ear = random.int(0, 1) === 1 ? 'left' : 'right'
        const event = infection
          ? `Infected injury led to loss of hearing in ${ear} ear`
          : `Lost hearing in ${ear} ear due to illness`
        person.ears[ear] = 'Deaf'
        person.history.push({ year, event })
      }
      break
    case 'blindness':
      if (person.eyes.left === 'Blind' && person.eyes.right === 'Blind') {
        const event = infection
          ? 'Suffered injury which became infected, but recovered'
          : 'Recovered from illness'
        person.history.push({ year, event })
      } else if (person.eyes.left === 'Blind') {
        const event = infection
          ? 'Infected injury led to loss of sight in right eye, resulting in total blindness'
          : 'Lost sight in right eye due to illness, resulting in total blindness'
        person.eyes.right = 'Blind'
        person.history.push({ year, event })
      } else if (person.eyes.right === 'Blind') {
        const event = infection
          ? 'Infected injury led to loss of sight in left eye, resulting in total blindness'
          : 'Lost sight in left eye due to illness, resulting in total blindness'
        person.eyes.left = 'Blind'
        person.history.push({ year, event })
      } else {
        const eye = random.int(0, 1) === 1 ? 'left' : 'right'
        const event = infection
          ? `Infected injury led to loss of sight in ${eye} eye`
          : `Lost sight in ${eye} ear due to illness`
        person.eyes[eye] = 'Blind'
        person.history.push({ year, event })
      }
      break
    default:
      person.history.push({ year, event: 'Recovered from illness' })
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
  const outcome = checkUntil(tables.injury, unacceptable)
  switch (outcome) {
    case 'deaf':
      if (person.ears.left === 'Deaf' && person.ears.right === 'Deaf') {
        person.scars.push('head')
        person.history.push({ year, event: 'Suffered a head wound' })
      } else if (person.ears.left === 'Deaf') {
        person.ears.right = 'Deaf'
        person.scars.push('right ear')
        person.history.push({ year, event: 'Lost hearing in right ear due to injury, resulting in total deafness' })
      } else if (person.ears.right === 'Deaf') {
        person.ears.left = 'Deaf'
        person.scars.push('left ear')
        person.history.push({ year, event: 'Lost hearing in left ear due to injury, resulting in total deafness' })
      } else {
        const ear = random.int(0, 1) === 1 ? 'left' : 'right'
        person.ears[ear] = 'Deaf'
        person.scars.push(`${ear} ear`)
        person.history.push({ year, event: `Lost hearing in ${ear} ear due to injury` })
      }
      break
    case 'blindness':
      if (person.eyes.left === 'Blind' && person.eyes.right === 'Blind') {
        person.scars.push('head')
        person.history.push({ year, event: 'Suffered a head wound' })
      } else if (person.eyes.left === 'Blind') {
        person.eyes.right = 'Blind'
        person.scars.push('right eye')
        person.history.push({ year, event: 'Lost sight in right eye due to injury, resulting in total blindness' })
      } else if (person.eyes.right === 'Blind') {
        person.eyes.left = 'Blind'
        person.scars.push('left eye')
        person.history.push({ year, event: 'Lost sight in left eye due to injury, resulting in total blindness' })
      } else {
        const eye = random.int(0, 1) === 1 ? 'left' : 'right'
        person.eyes[eye] = 'Blind'
        person.scars.push(`${eye} eye`)
        person.history.push({ year, event: `Lost sight in ${eye} eye due to injury` })
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
        person.history.push({ year, event: `Lost ${limbs[limb]} due to injury` })
      } else {
        person.scars.push('torso')
        person.history.push({ year, event: 'Suffered an injury to the torso' })
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
      person.history.push({ year, event: `Suffered an injury to the ${randomScarLocation}` })
      break
  }
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
        getSick(community, person, year, canDie)
        break
      default:
        getInjured(community, person, year, canDie)
        break
    }
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
