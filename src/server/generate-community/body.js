import random from 'random'

export default class Body {
  constructor (args) {
    if (args && args.parents) {
      return Body.makeBaby(args.parents)
    } else {
      const specifiedGender = args ? args.specifiedGender : undefined
      this.random(specifiedGender)
    }
  }

  random (specifiedGender) {
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


  static makeBaby (parents) {
    let baby
    if (parents && Array.isArray(parents) && parents.length > 1) {
      const bothBodies = parents.slice(0, 1).map(p => p.constructor && p.constructor.name === 'Body').reduce((acc, curr) => acc && curr, true)
      if (bothBodies) {
        const mindex = parents[0].hasWomb ? 0 : parents[1].hasWomb ? 1 : -1
        const findex = mindex === 0 && parents[1].hasPenis ? 1 : mindex === 1 && parents[0].hasPenis ? 0 : -1
        if (mindex > -1 && findex > -1) {
          // We have two parents, and they're both Body objects, and one is
          // able to reproduce sexually as a male and the other is able to
          // reproduce sexually as a female, so they're a viable set of
          // parents. Let's declare some variables to make it easier to refer
          // to them later.

          const mother = parents[mindex]
          const father = parents[findex]

          // Start off by seeding our baby with random values.

          baby = new Body()

          // We're using a random value from a normal distribution to represent
          // body type (a lower number is more ectomorphic, a higher number is
          // more endomorphic, and 0 is perfectly mesomorphic), so here we're
          // trying for "descent with variation" by taking the average of your
          // mother's value and your father's value and then adding a random
          // variance based on their difference, so you're still somewhere
          // between those two.

          const avgType = (father.type + mother.type) / 2
          const diffType = Math.abs(father.type - mother.type)
          const swingType = diffType * (random.int(1, 50) / 100)
          const variationType = random.boolean() === true ? swingType : swingType * -1
          baby.type = avgType + variationType

          // We started off with random values for eyes, ears, and limbs, but
          // if either of your parents were born blind, then there's a much
          // higher chance that you'll be born blind, too. And if both of your
          // parents were born blind, then the chance is higher still. So we're
          // creating two little functions here, `either` and `both`, to make
          // it easier to check if either or both of your parents have a
          // problem like that, and using a different roll to check this if
          // that's the case.

          const either = set => {
            return (mother[set].left !== 'Healthy' && mother[set].right !== 'Healthy') ||
              (father[set].left !== 'Healthy' && father[set].right !== 'Healthy')
          }

          const both = set => {
            return mother[set].left !== 'Healthy' && mother[set].right !== 'Healthy' &&
              father[set].left !== 'Healthy' && father[set].right !== 'Healthy'
          }

          const blindRoll = random.int(1, 4)
          const blind = both('eyes') && blindRoll < 4 ||
            either('eyes') && blindRoll === 1
          if (blind) {
            baby.eyes.left = 'Blind'
            baby.eyes.right = 'Blind'
          }

          const deafRoll = random.int(1, 4)
          const deaf = both('ears') && deafRoll < 4 ||
            either('ears') && deafRoll === 1
          if (deaf) {
            baby.ears.left = 'Deaf'
            baby.ears.right = 'Deaf'
          }

          const armsRoll = random.int(1, 4)
          const arms = both('arms') && armsRoll < 4 ||
            either('arms') && armsRoll === 1
          if (arms) {
            baby.arms.left = 'Disabled'
            baby.arms.right = 'Disabled'
          }

          const legsRoll = random.int(1, 4)
          const legs = both('arms') && legsRoll < 4 ||
            either('arms') && legsRoll === 1
          if (legs) {
            baby.legs.left = 'Disabled'
            baby.legs.right = 'Disabled'
          }

          // Achondroplasia pops up unexpectedly very randomly, but it is genetic,
          // so if one or both of your parents have it, we need to calculate the odds
          // in an altogether different way. And if you inherit the gene from both of
          // your parents, you die.

          if (mother.achondroplasia || father.achondroplasia) {
            const fromMother = mother.achondroplasia && random.boolean() === true
            const fromFather = father.achondroplasia && random.boolean() === true
            if (fromMother || fromFather) {
              this.achondroplasia = true
              if (fromMother && fromFather) this.dead = true
            } else {
              this.achondroplasia = false
            }
          }

          // 25% infant mortality rate
          if (random.int(1, 4) === 1) this.dead = true
        }
      }
    }
    return baby
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
