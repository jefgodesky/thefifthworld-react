import Body from './body'
import Personality from './personality'

export default class Genotype {
  constructor (body, personality) {
    const givenBody = (body && body.constructor && body.constructor.name === 'Body')
    const givenPersonality = (personality && personality.constructor && personality.constructor.name === 'Personality')
    this.body = givenBody ? Body.copy(body) : new Body()
    this.personality = givenPersonality ? Personality.copy(personality) : new Personality()
  }
}
