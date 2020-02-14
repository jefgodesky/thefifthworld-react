import { randomValFromNormalDistribution } from '../../shared/utils'

export default class Personality {
  constructor (vals) {
    this.traits = [ 'openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism' ]
    this.traits.forEach(trait => {
      this[trait] = vals && !isNaN(vals[trait]) ? vals[trait] : randomValFromNormalDistribution()
    })
  }
}
