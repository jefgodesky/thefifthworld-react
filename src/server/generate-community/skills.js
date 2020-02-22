import random from 'random'

import skills from '../../data/skills'
import { between, get, intersection, isPopulatedArray } from '../../shared/utils'

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

    // Add skills the community has mastered, if they're things that this
    // person is eligible to learn.
    const people = community ? community.getPeople() : []
    const masters = people.flatMap(p => p.skills.mastered).filter(s => base.includes(s))

    // Remove the skills that you've already mastered, as well as magic because
    // magic has a whole other thing going on.
    return [ ...base, ...masters ]
      .filter(s => !this.mastered.includes(s))
      .filter(s => s !== 'Magic')
  }

  /**
   * Sets a new skill that the person begins learning.
   * @param skill {string} - The name of the skill to begin learning.
   * @param intelligence {number} - The intelligence of the learner. This is a
   *   normally-distributed value with a mean of zero and a standard deviation
   *   of 1. A higher intelligence means that it takes less time to learn a
   *   skill, while a lower intelligence will require a longer time.
   */

  startLearning (skill, intelligence = 0) {
    const required = Math.round(7 + (intelligence * -1))
    this.learning = {
      skill,
      progress: 0,
      required
    }
  }

  /**
   * Progress in learning a skill.
   */

  progress () {
    if (this.learning && !isNaN(this.learning.progress)) {
      this.learning.progress++
      if (this.learning.progress >= this.learning.required) {
        this.mastered = [ ...this.mastered, this.learning.skill ]
        delete this.learning
      }
    }
  }

  /**
   * Returns a person magical calling, based on the person's own personal
   * history and her community's beliefs about magic.
   * @param person {Person} - The person who's calling we're testing.
   * @param community {Community} - The community that the person belongs to.
   * @returns {number} - A number between 0 and 100, providing the chance that
   *   she'll experience a calling to learn magic.
   */

  static getMagicalCalling (person, community) {
    const magic = get(community, 'traditions.magic') || 'open'
    const isSecret = magic !== 'open'
    const factors = {
      motherIsWizard: isSecret ? 50 : 5,
      fatherIsWizard: isSecret ? 50 : 5,
      isIntersex: isSecret ? 1 : 10,
      isMagicalGender: isSecret ? 1 : 10,
      isDwarf: isSecret ? 1 : 10,
      disorders: isSecret ? 1 : 5,
      sickness: isSecret ? 1 : 4,
      injury: isSecret ? 1 : 2
    }

    const mother = person.mother && community && community.people[person.mother] ? community.people[person.mother] : null
    const motherSkills = mother ? get(mother, 'skills.mastered') : []
    const motherIsWizard = isPopulatedArray(motherSkills) && motherSkills.includes('Magic') ? factors.motherIsWizard : 0

    const father = person.father && community && community.people[person.father] ? community.people[person.father] : null
    const fatherSkills = father ? get(father, 'skills.mastered') : []
    const fatherIsWizard = isPopulatedArray(fatherSkills) && fatherSkills.includes('Magic') ? factors.fatherIsWizard : 0

    const hasBothGenitalia = person.body.male && person.body.female
    const hasNeitherGenitalia = !person.body.male && !person.body.female
    const isIntersex = hasBothGenitalia || hasNeitherGenitalia ? factors.isIntersex : 0

    const magicalGenders = [ 'Third gender', 'Fifth gender', 'Masculine woman', 'Feminine man' ]
    const isMagicalGender = magicalGenders.includes(person.gender) ? factors.isMagicalGender : 0

    const isDwarf = person.body.achondroplasia ? factors.isDwarf : 0

    const specialDisorders = [ 'schizophrenia', 'obsessive-compulsive', 'schizoid', 'depression', 'anxiety', 'bipolar', 'borderline', 'histrionic', 'autism' ]
    const mySpecialDisorders = intersection(person.personality.disorders, specialDisorders)
    const disorders = mySpecialDisorders.length * factors.disorders

    const injuries = person.history.get({ tag: 'injury' }).length * factors.injury
    const sickness = person.history.get({ tag: 'sickness' }).length * factors.sickness

    const myFactors = [
      motherIsWizard, fatherIsWizard, isIntersex, isMagicalGender, isDwarf,
      disorders, injuries, sickness
    ]

    return between(myFactors.reduce((acc, curr) => acc + curr, 0), isSecret ? 1 : 2, 90)
  }

  /**
   * Should this person begin learning magic?
   * @param person {Person} - The person we're considering.
   * @param community {Community} - The community this person belongs to.
   * @returns {boolean} - `true` if this person begins learning magic, or
   *   `false` if she does not.
   */

  static considerMagic (person, community) {
    if (!person.skills.mastered.includes('Magic')) {
      if (random.int(1, 100) < Skills.getMagicalCalling(person, community)) {
        person.skills.startLearning('Magic', person.intelligence)
        return true
      }
    }
    return false
  }

  /**
   * Should this person begin learning the skill that the community favors?
   * @param person {Person} - The person we're considering.
   * @param community {Community} - The community this person belongs to.
   * @returns {boolean} - `true` if this person begins learning the community's
   *   favored skill, or `false` if she doesn't.
   */

  static considerFavoredSkill (person, community) {
    const favored = get(community, 'traditions.skill')
    if (favored && !person.skills.mastered.includes(favored)) {
      const willConform = person.personality.check('agreeableness', 2)
      if (willConform) {
        person.skills.startLearning(favored, person.intelligence)
        return true
      }
    }
    return false
  }

  /**
   * Should this person begin learning medicine in response to recent sickness?
   * @param person {Person} - The person we're considering.
   * @param yearsSick {number} - How many years in the past decade has the
   *   community faced sickness? (Default: `0`)
   * @returns {boolean} - `true` if this person begins learning medicine, or
   *   `false` if she doesn't.
   */

  static considerHealing (person, yearsSick = 0) {
    if (!person.skills.mastered.includes('Medicine')) {
      const chance = (person.personality.chance('agreeableness') / 15) * Math.max(yearsSick, 1)
      const willConform = random.int(1, 100) < chance
      if (willConform) {
        person.skills.startLearning('Medicine', person.intelligence)
        return true
      }
    }
    return false
  }

  /**
   * Should this person begin learning deescalation in response to recent
   * conflict?
   * @param person {Person} - The person we're considering.
   * @param yearsConflict {number} - How many years in the past decade has the
   *   community been in a conflict? (Default: `0`)
   * @returns {boolean} - `true` if this person begins learning deescalation,
   *   or `false` if she doesn't.
   */

  static considerDeescalation (person, yearsConflict = 0) {
    if (!person.skills.mastered.includes('Deescalation')) {
      const chance = (person.personality.chance('agreeableness') / 15) * Math.max(yearsConflict, 1)
      const willConform = random.int(1, 100) < chance
      if (willConform) {
        person.skills.startLearning('Deescalation', person.intelligence)
        return true
      }
    }
    return false
  }
}
