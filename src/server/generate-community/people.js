import random from 'random'
import { check } from './check'
import shuffle from './shuffle'

/**
 * Generate a character ex nihilo. Used for founders of the community 150-125
 * years before the Fifth World's present.
 * @returns {Object} - An object representing the person.
 */

const generateFounder = () => {
  const randomDistributed = random.normal(0, 1)

  const sexes = [
    { chance: 49.15, event: 'Female' },
    { chance: 49.15, event: 'Male' },
    { chance: 1.7, event: 'Intersex' }
  ]

  let bodyType = ''
  for (let space = 0; space < 4; space++) {
    const shuffled = shuffle('+0-'.split(''))
    bodyType += shuffled[1]
  }

  const eyes = random.float(0, 100) < 0.016
    ? { left: 'Blind', right: 'Blind' }
    : { left: 'Healthy', right: 'Healthy' }

  const ears = random.float(0, 100) < 0.2
    ? { left: 'Deaf', right: 'Deaf' }
    : { left: 'Healthy', right: 'Healthy' }

  const founder = {
    personality: {
      openness: randomDistributed(),
      conscientiousness: randomDistributed(),
      extraversion: randomDistributed(),
      agreeableness: randomDistributed(),
      neuroticism: randomDistributed()
    },
    intelligence: randomDistributed(),
    neurodivergent: random.int(1, 100) === 1,
    sexualOrientation: randomDistributed(),
    sex: check(sexes, random.int(1, 100)),
    fertility: 0,
    bodyType,
    limbs: {
      leftarm: random.float(0, 100) < 0.1 ? 'Disabled' : 'Healthy',
      rightarm: random.float(0, 100) < 0.1 ? 'Disabled' : 'Healthy',
      leftleg: random.float(0, 100) < 0.1 ? 'Disabled' : 'Healthy',
      rightleg: random.float(0, 100) < 0.1 ? 'Disabled' : 'Healthy'
    },
    eyes,
    ears,
    achondroplasia: random.float(0, 100) < 0.004,
    psychopath: null,
    history: []
  }

  // There's a 1% chance this person is a psychopath...
  if (random.int(1, 100) === 1) {
    founder.psychopath = 1
    founder.personality.agreeableness -= 2
    founder.personality.conscientiousness -= 2
    founder.personality.neuroticism += 2
    founder.personality.extraversion += 1
    founder.personality.openness += 1
  }

  return founder
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
 * Age an individual.
 * @param community {Object} - The community object.
 * @param person {Object} - The person to age.
 * @param year {number} - The current year.
 */

const agePerson = (community, person, year) => {
  adjustFertility(person, year)
  const { event } = community.status

  const peaceTable = [
    { chance: 10, event: '+openness' },
    { chance: 10, event: '-openness' },
    { chance: 10, event: '+conscientiousness' },
    { chance: 10, event: '-conscientiousness' },
    { chance: 10, event: '+extraversion' },
    { chance: 10, event: '-extraversion' },
    { chance: 10, event: '+agreeableness' },
    { chance: 10, event: '-agreeableness' },
    { chance: 5, event: '+neuroticism' },
    { chance: 10, event: '-neuroticism' },
    { chance: 1, event: 'sickness' },
    { chance: 1, event: 'injury' }
  ]

  const conflictTable = [
    { chance: 3, event: '+openness' },
    { chance: 3, event: '-openness' },
    { chance: 3, event: '+conscientiousness' },
    { chance: 3, event: '-conscientiousness' },
    { chance: 3, event: '+extraversion' },
    { chance: 5, event: '-extraversion' },
    { chance: 3, event: '+agreeableness' },
    { chance: 5, event: '-agreeableness' },
    { chance: 5, event: '+neuroticism' },
    { chance: 3, event: '-neuroticism' },
    { chance: 26, event: 'sickness' },
    { chance: 25, event: 'injury' }
  ]

  const sicknessTable = [
    { chance: 4, event: '+openness' },
    { chance: 4, event: '-openness' },
    { chance: 4, event: '+conscientiousness' },
    { chance: 4, event: '-conscientiousness' },
    { chance: 4, event: '+extraversion' },
    { chance: 6, event: '-extraversion' },
    { chance: 4, event: '+agreeableness' },
    { chance: 6, event: '-agreeableness' },
    { chance: 6, event: '+neuroticism' },
    { chance: 4, event: '-neuroticism' },
    { chance: 40, event: 'sickness' },
    { chance: 11, event: 'injury' }
  ]

  const leantable = [
    { chance: 8, event: '+openness' },
    { chance: 8, event: '-openness' },
    { chance: 8, event: '+conscientiousness' },
    { chance: 8, event: '-conscientiousness' },
    { chance: 8, event: '+extraversion' },
    { chance: 10, event: '-extraversion' },
    { chance: 8, event: '+agreeableness' },
    { chance: 10, event: '-agreeableness' },
    { chance: 10, event: '+neuroticism' },
    { chance: 8, event: '-neuroticism' },
    { chance: 6, event: 'sickness' },
    { chance: 5, event: 'injury' }
  ]

  const table = event === 'conflict'
    ? conflictTable
    : event === 'sickness'
      ? sicknessTable
      : event === 'lean'
        ? leantable
        : peaceTable
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
    default:
      break
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
  generateFounder,
  age
}
