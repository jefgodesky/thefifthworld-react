import random from 'random'

import { randomValFromNormalDistribution } from '../../shared/utils'

export default class Body {
  constructor () {
    this.longevity = Math.round(randomValFromNormalDistribution(80, 10))
    this.attractiveness = randomValFromNormalDistribution()
    this.type = randomValFromNormalDistribution()
    this.eyes = random.int(1, 1000) <= 16
      ? { left: 'blind', right: 'blind' }
      : { left: 'healthy', right: 'healthy' }
  }
}
