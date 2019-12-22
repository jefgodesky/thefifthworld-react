import skills from '../../data/skills'
import { between } from '../../shared/utils'

export default class Skills {
  constructor () {
    this.mastered = []
  }

  /**
   * Returns a list of skills that this person could learn, with additional
   * "votes" added to represent others in the community that she could learn
   * this skill from. It does not include any of the skills that she has
   * already mastered.
   * @param community {Community} - The community object.
   * @returns {string[]} - An array of strings presenting the names of skills
   *   that this person could learn.
   */

  getLearnableSkills (community) {
    let base = []
    skills.forEach(s => {
      if (this.mastered.includes(s.name)) {
        const specializations = s.specializations ? s.specializations.map(s => s.name) : []
        base = [ ...base, s.name, ...specializations ]
      } else {
        base = [ ...base, s.name ]
      }
    })

    // Add skills the community has mastered
    const people = community ? community.getCurrentPopulation() : []
    let masters = []
    people.forEach(p => {
      masters = [ ...masters, ...p.skills.mastered ]
    })

    // Remove the skills that you've already mastered, as well as magic because
    // magic has a whole other thing going on.
    return [ ...base, ...masters ]
      .filter(s => !this.mastered.includes(s))
      .filter(s => s !== 'Magic')
  }

  /**
   * Returns your magical calling — the chance that you'll be called to
   * become a wizard, expressed as a percentage. This is based on your traits
   * and the beliefs of your community.
   * @param person {Person} - The Person object to evaluate.
   * @param isSecret {boolean} - If `true`, then the community considers magic
   *   something secret, typically passed from parent to child. If `false`,
   *   the community considers magic something open to anyone.
   * @returns {number} - A number between 1 and 95, expressing your chances of
   *   having a magical calling.
   */

  static getMagicalCalling (person, isSecret) {
    const factors = {
      motherIsWizard: isSecret ? 75 : 25,
      fatherIsWizard: isSecret ? 75 : 25,
      isIntersex: isSecret ? 5 : 35,
      isMagicalGender: isSecret ? 5 : 35,
      isDwarf: isSecret ? 5 : 35,
      isNeurodivergent: isSecret ? 5 : 35
    }

    const min = isSecret ? 1 : 10
    const motherIsWizard = person.body.mother.skills.mastered.includes('Magic') ? factors.motherIsWizard : 0
    const fatherIsWizard = person.body.father.skills.mastered.includes('Magic') ? factors.fatherIsWizard : 0
    const hasBothGenitalia = person.body.hasPenis && person.body.hasWomb
    const hasNeitherGenitalia = !person.body.hasPenis && !person.body.hasWomb
    const isIntersex = hasBothGenitalia || hasNeitherGenitalia ? factors.isIntersex : 0
    const magicalGenders = [ 'Third gender', 'Fifth gender', 'Masculine woman', 'Feminine man' ]
    const isMagicalGender = magicalGenders.includes(person.gender) ? factors.isMagicalGender : 0
    const isDwarf = person.body.achondroplasia ? factors.isDwarf : 0
    const isNeurodivergent = person.neurodivergent ? factors.isNeurodivergent : 0

    return between(motherIsWizard + fatherIsWizard + isIntersex + isMagicalGender + isDwarf + isNeurodivergent, min, 95)
  }
}
