import random from 'random'
import tables from '../../data/community-creation'
import { pickRandom } from './shuffle'

export default class Sexuality {
  constructor (body, mateFor) {
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

      this.androphilia = total ? androphilia / total : 0
      this.gynephilia = total ? gynephilia / total : 0
      this.skoliophilia = total ? skoliophilia / total : 0
    }
  }

  /**
   * Reports if this person is asexual.
   * @returns {boolean} - Returns `true` if this person is asexual, or `false`
   *   if she isn't.
   */

  isAsexual () {
    const { androphilia, gynephilia, skoliophilia } = this
    const total = androphilia + gynephilia + skoliophilia
    return total === 0
  }

  /**
   * Returns an array of strings representing the spread of genders that this
   * character might from a relationship with, based on her sexuality.
   * @param genders {number} - (Optional) The number of genders recognized by
   *   this person's community. (Default: `3`)
   * @param num {number} - (Optional) The number of potential partners whose
   *   genders should be identified. (Default: `10`)
   * @returns {[string]} - An array of strings identifying the genders that
   *   this person would prefer to form a relationship with, which can be used
   *   to generate an array of individuals representative of the people that
   *   this person would be attracted to.
   */

  getGenderPreferences (genders = 3, num = 10) {
    const arr = []
    const g = tables.genders[genders]
    if (g) {
      const { gynephilic, androphilic, skoliophilic } = g
      const w = Math.round(this.gynephilia * num)
      const m = Math.round(this.androphilia * num)
      const nb = Math.round(this.skoliophilia * num)
      for (let i = 0; i < w; i++) arr.push(pickRandom(gynephilic))
      for (let i = 0; i < m; i++) arr.push(pickRandom(androphilic))
      for (let i = 0; i < nb; i++) arr.push(pickRandom(skoliophilic))
    }
    return arr
  }
}
