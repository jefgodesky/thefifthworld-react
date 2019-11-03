import random from 'random'
import { daysFromNow } from '../../shared/utils'
import { generateFounder } from './people'
import { check } from './check'

/**
 * Roll for the community's current status.
 * @param community {Object} - The community object.
 */

const getCommunityStatus = community => {
  const threshold = community.traditions.village ? 150 : 30
  const living = community.people.filter(person => !person.died)
  const overpopulated = living.length > threshold

  const overpopulatedTable = [
    { chance: 10, event: 'conflict ' },
    { chance: 25, event: 'sickness' },
    { chance: 50, event: 'lean' },
    { chance: 15, event: 'peace' }
  ]
  const normalTable = [
    { chance: 1, event: 'conflict ' },
    { chance: 2, event: 'sickness' },
    { chance: 4, event: 'lean' },
    { chance: 93, event: 'peace' }
  ]
  const eventTable = overpopulated ? overpopulatedTable : normalTable

  const randomizer = random.int(1, 100)
  const event = check(eventTable, randomizer())
  community.status.event = event
  switch (event) {
    case 'conflict': community.status.discord += 3; break
    case 'sickness': community.status.discord += 2; break
    case 'lean': community.status.discord += 1; break
    case 'peace': community.status.discord -= 1; break
  }
  community.status.discord = Math.max(0, community.status.discord)
}

const addFounder = community => {
  const founders = community.traditions.village ? 50 : 10
  const living = community.people.filter(person => !person.died)
  const randomizer = random.int(1, 100)
  if (living.length < founders && randomizer() < 25) {
    const founder = generateFounder()
    community.people.push(founder)
  }
}

/**
 * See what happens each year.
 * @param community {Object} - The community object.
 * @param year {number} - The year being run.
 * @param founding {boolean} - If `true`, then this is in the 'founding'
 *   period, and we might introduce a new character ex nihilo simply because
 *   we're not tracing this all the way back to the beginning and we need to
 *   start somewhere.
 */

const runYear = (community, year, founding) => {
  getCommunityStatus(community)
  if (founding) {
    addFounder(community)
  }
  community.chronicle.push(Object.assign({}, { year }, community.status))
}

/**
 * Loop through years to run.
 * @param community {Object} - The commmunity object.
 */

const generateCommunity = community => {
  // The present of the Fifth World is 144,000 days from today (one b'ak'tun in
  // the Maya Long Count calendar). Our simulation begins 150 years before that
  // (144000 - (150 * 365)).
  const fromDate = daysFromNow(89250)
  const toDate = daysFromNow(144000)
  const fromYear = fromDate.getFullYear()
  const toYear = toDate.getFullYear()

  // Set initial discord
  const randomizer = random.normal(7, 1)
  community.status = {
    discord: Math.floor(randomizer())
  }

  // Cycle through years
  for (let year = fromYear; year < toYear; year++) {
    const founding = year < fromYear + 25
    runYear(community, year, founding)
  }
}

export default generateCommunity
