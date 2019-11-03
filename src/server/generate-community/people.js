import random from 'random'
import { check } from './check'
import shuffle from './shuffle'

const generateFounder = () => {
  const randomPercent = random.int(1, 100)
  const randomDistributed = random.normal(0, 1)

  const sexes = [
    { chance: 49.15, event: 'Female' },
    { chance: 49.15, event: 'Male' },
    { chance: 1.7, event: 'Intersex' }
  ]

  let bodyType = ''
  for (let space = 0; space < 4; space++) {
    const shuffled = shuffle('+0-'.split())
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
    neurodivergent: randomPercent() === 1,
    sexualOrientation: randomDistributed(),
    sex: check(sexes, randomPercent()),
    bodyType
  }

  console.log(founder)
  return founder
}

export {
  generateFounder
}
