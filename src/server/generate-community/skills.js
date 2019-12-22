import random from 'random'
import skills from '../../data/skills'
import { pickRandom } from './shuffle'
import { between, get } from '../../shared/utils'

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
    const motherSkills = get(person, 'body.mother.skills.mastered')
    const fatherSkills = get(person, 'body.father.skills.mastered')
    const motherIsWizard = motherSkills && motherSkills.includes('Magic') ? factors.motherIsWizard : 0
    const fatherIsWizard = fatherSkills && fatherSkills.includes('Magic') ? factors.fatherIsWizard : 0
    const hasBothGenitalia = person.body.hasPenis && person.body.hasWomb
    const hasNeitherGenitalia = !person.body.hasPenis && !person.body.hasWomb
    const isIntersex = hasBothGenitalia || hasNeitherGenitalia ? factors.isIntersex : 0
    const magicalGenders = [ 'Third gender', 'Fifth gender', 'Masculine woman', 'Feminine man' ]
    const isMagicalGender = magicalGenders.includes(person.gender) ? factors.isMagicalGender : 0
    const isDwarf = person.body.achondroplasia ? factors.isDwarf : 0
    const isNeurodivergent = person.neurodivergent ? factors.isNeurodivergent : 0

    return between(motherIsWizard + fatherIsWizard + isIntersex + isMagicalGender + isDwarf + isNeurodivergent, min, 95)
  }

  /**
   * Pick a skill for this person to start learning.
   * @param person {Person} - The Person object.
   * @param community {Community} - The Community object.
   */

  static pick (person, community) {
    person.skills.learning = undefined
    const needed = Math.round(7 + (person.intelligence * -1))

    // Check for magical calling
    if (!person.skills.mastered.includes('Magic')) {
      const tradition = get(community, 'traditions.magic')
      const calling = Skills.getMagicalCalling(person, tradition === 'secret')
      if (random.int(1, 100) < calling) {
        person.skills.learning = {
          skill: 'Magic',
          progress: 0,
          needed
        }
      }
    }

    // If it wasn't magic, maybe it's the community's favored skill?
    let willConform = true
    for (let i = 0; i < 4; i++) willConform = willConform && person.personality.check('agreeableness')
    if ((person.skills.learning === undefined) && willConform) {
      const favored = get(community, 'traditions.skill')
      if (favored) {
        person.skills.learning = {
          skill: favored,
          progress: 0,
          needed
        }
      }
    }

    // If it wasn't magic and it wasn't the community's favored skill, we use
    // the normal process
    if (person.skills.learning === undefined) {
      const list = person.skills.getLearnableSkills(community)
      person.skills.learning = {
        skill: pickRandom(list),
        progress: 0,
        needed
      }
    }
  }

  /**
   * Marks progress in mastering a skill that you're learning.
   */

  advance () {
    if (this.learning) {
      this.learning.progress++
      const { progress, needed, skill } = this.learning
      if (progress >= needed) {
        this.mastered = [ ...this.mastered, skill ]
        this.learning = undefined
      }
    }
  }
}
