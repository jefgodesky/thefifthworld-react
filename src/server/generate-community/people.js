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
    blind: random.float(0, 100) < 0.016,
    deaf: random.float(0, 100) < 0.2,
    achondroplasia: random.float(0, 100) < 0.004,
    psychopath: null
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

export {
  generateFounder
}
