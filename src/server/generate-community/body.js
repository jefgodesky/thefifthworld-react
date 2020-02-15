import random from 'random'

import { randomValFromNormalDistribution } from '../../shared/utils'

export default class Body {
  constructor () {
    this.longevity = Math.round(randomValFromNormalDistribution(80, 10))
    this.attractiveness = randomValFromNormalDistribution()
    this.type = randomValFromNormalDistribution()
    this.eyes = random.int(1, 1000) <= 4
      ? { left: 'blind', right: 'blind' }
      : { left: 'healthy', right: 'healthy' }
    this.ears = random.int(1, 1000) <= 1
      ? { left: 'deaf', right: 'deaf' }
      : { left: 'healthy', right: 'healthy' }
    this.arms = {
      left: random.int(1, 1000) <= 1 ? 'disabled' : 'healthy',
      right: random.int(1, 1000) <= 1 ? 'disabled' : 'healthy'
    }
    this.legs = {
      left: random.int(1, 1000) <= 1 ? 'disabled' : 'healthy',
      right: random.int(1, 1000) <= 1 ? 'disabled' : 'healthy'
    }
    this.achondroplasia = random.int(1, 10000) === 1

    const both = random.int(1, 10000) < 85
    const neither = random.int(1, 10000) < 85

    if (both) {
      this.male = true
      this.female = true
    } else if (neither) {
      this.male = false
      this.female = false
    } else if (random.boolean()) {
      this.male = true
      this.female = false
    } else {
      this.male = false
      this.female = true
    }

    this.fertility = 0
    this.scars = []
  }
}
