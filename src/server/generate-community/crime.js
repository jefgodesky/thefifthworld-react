import random from 'random'

import { anyTrue, intersection, isPopulatedArray } from '../../shared/utils'

/**
 * Consider assaulting or murdering someone.
 * @param attacker {Person} - The person who is considering an act of violence.
 * @return {string} - Either `attack` if the person decides to attack, `kill`
 *   if she means to kill her, or `no` if she decides against violence.
 */

const considerViolence = (attacker) => {
  const willAttack = !attacker.personality.check('agreeableness', 25, 'or')
  const willKill = !attacker.personality.check('agreeableness', 50, 'or')
  if (willAttack && willKill) {
    return 'kill'
  } else if (willAttack) {
    return 'attack'
  } else {
    return 'no'
  }
}

/**
 * Figures out if an assault is successful or not.
 * @param attacker {Person} - The person who is assaulting the defender.
 * @param defender {Person} - The person being assaulted by the attacker.
 * @returns {boolean} - `true` if the attacker succeeds in doing injury to the
 *   defender, or `false` if the defender successfully fends her off.
 */

const assault = (attacker, defender) => {
  const skillsForAttacker = [
    'Deception', 'Sorcery', 'Running', 'Scouting', 'Archery', 'Throwing atlatl darts',
    'Shooting a blowgun', 'Throwing a bola', 'Shooting a sling', 'Using a spear'
  ]
  const skillsForDefender = [ 'Running', 'Scouting' ]
  const attackerSkills = intersection(attacker.skills.mastered, skillsForAttacker)
  const defenderSkills = intersection(defender.skills.mastered, skillsForDefender)
  let attackRolls = []
  for (let a = 0; a < attackerSkills.length + 1; a++) {
    const defenseRolls = []
    for (let d = 0; d < defenderSkills.length + 1; d++) defenseRolls.push(random.boolean())
    attackRolls.push(!anyTrue(defenseRolls))
  }
  attackRolls = attackRolls.sort(a => { return a ? -1 : 1 })
  return isPopulatedArray(attackRolls) ? attackRolls[0] : false
}

export {
  considerViolence,
  assault
}
