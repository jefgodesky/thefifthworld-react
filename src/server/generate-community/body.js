import random from 'random'

export default class Body {
  constructor (specifiedGender) {
    const rand = random.normal(0, 1)
    this.type = rand()
    this.eyes = random.float(0, 100) < 0.016
      ? { left: 'Blind', right: 'Blind' }
      : { left: 'Healthy', right: 'Healthy' }
    this.ears = random.float(0, 100) < 0.2
      ? { left: 'Deaf', right: 'Deaf' }
      : { left: 'Healthy', right: 'Healthy' }
    this.arms = {
      left: random.float(0, 100) < 0.1 ? 'Disabled' : 'Healthy',
      right: random.float(0, 100) < 0.1 ? 'Disabled' : 'Healthy'
    }
    this.legs = {
      left: random.float(0, 100) < 0.1 ? 'Disabled' : 'Healthy',
      right: random.float(0, 100) < 0.1 ? 'Disabled' : 'Healthy'
    }
    this.achondroplasia = random.float(0, 100) < 0.004
    this.hasPenis = false
    this.hasWomb = true
    this.fertility = 0
    this.scars = []

    this.determineSex(specifiedGender)
  }

  /**
   * Determine the capacity for this body to reproduce sexually as a man and as
   * a woman.
   * @param specifiedGender {string} - (Optional) A string with this person's
   *   gender. Sex organs are strongly correlated with gender, but it's not a
   *   1-to-1 correspondence.
   */

  determineSex (specifiedGender) {
    const roll = random.int(1, 100)
    const both = random.int(1, 10000)
    const neither = random.int(1, 10000)

    if (both) {
      this.hasPenis = true
      this.hasWomb = true
    } else if (neither) {
      this.hasPenis = false
      this.hasWomb = false
    } else {
      // "Feminine woman" in a four- or five-gender system works out to the
      // same math as "woman" in a two- or three-gender system, as does
      // "masculine man" and "man." If no gender was specified, we virtually
      // flip a coin to assign male or female. They might not end up with that
      // gender, but it will suffice for now to figure out the correct
      // probabilities for who gets what bits.

      const condition = specifiedGender === 'Masculine man'
        ? 'Man'
        : specifiedGender === 'Feminine woman'
          ? 'Woman'
          : specifiedGender === undefined
            ? random.boolean() === false ? 'Man' : 'Woman'
            : specifiedGender

      switch (condition) {
        case 'Woman':
          this.hasPenis = roll === 1
          this.hasWomb = roll !== 1
          break
        case 'Man':
          this.hasPenis = roll !== 1
          this.hasWomb = roll === 1
          break
        case 'Masculine woman':
          this.hasPenis = roll > 90
          this.hasWomb = roll <= 90
          break
        case 'Feminine man':
          this.hasPenis = roll <= 90
          this.hasWomb = roll > 90
          break
        default:
          this.hasPenis = roll > 50
          this.hasWomb = roll < 50
          break
      }
    }
  }
}
