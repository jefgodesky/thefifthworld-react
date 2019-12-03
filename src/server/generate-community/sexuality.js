import random from 'random'

export default class Sexuality {
  constructor(body, mateFor) {
    if (!mateFor && random.int(1, 100) === 100) {
      this.androphilia = 0
      this.gynephilia = 0
      this.skoliophilia = 0
    } else {
      const biases = { androphilia: 0, gynephilia: 0, skoliophilia: 0 }
      if (mateFor) {
        const androphilic = [ 'Feminine man', 'Man', 'Masculine man' ]
        const gynephilic = [ 'Masculine woman', 'Woman', 'Feminine woman' ]
        const skoliophilic = [ 'Masculine woman', 'Feminine man', 'Third gender', 'Fifth gender' ]
        biases.androphilia = androphilic.indexOf(mateFor) + 1
        biases.gynephilia = gynephilic.indexOf(mateFor) + 1
        biases.skoliophilia = skoliophilic.indexOf(mateFor) + 1
      }

      const roll = random.int(1, 10)
      const { hasPenis, hasWomb } = body
      const preferred = random.int(1, 3)
      const notPreferred = random.int(0, 1)

      if (roll < 10) {
        // Heterosexual bias
        if (hasPenis) {
          biases.gynephilia += preferred
          biases.androphilia += notPreferred
        }
        if (hasWomb) {
          biases.gynephilia += notPreferred
          biases.androphilia += preferred
        }
        biases.skoliophilia += random.boolean() ? notPreferred : notPreferred / 2
      } else {
        // Homosexual bias
        if (hasPenis) {
          biases.gynephilia += notPreferred
          biases.androphilia += preferred
        }
        if (hasWomb) {
          biases.gynephilia += preferred
          biases.androphilia += notPreferred
        }
        biases.skoliophilia += random.boolean() ? preferred : preferred / 2
      }

      const { androphilia, gynephilia, skoliophilia } = biases
      const total = androphilia + gynephilia + skoliophilia

      this.androphilia = total ? androphilia / total : 0,
      this.gynephilia = total ? gynephilia / total : 0
      this.skoliophilia = total ? skoliophilia / total : 0
    }
  }
}
