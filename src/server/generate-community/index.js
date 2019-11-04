import random from 'random'
import { daysFromNow } from '../../shared/utils'
import { generateFounder, age } from './people'
import { check } from './check'

/**
 * Roll for the community's current status.
 * @param community {Object} - The community object.
 */

const getCommunityStatus = community => {
  const { discord } = community.status
  const threshold = community.traditions.village ? 150 : 30
  const living = community.people.filter(person => !person.died)
  const overpopulated = living.length > threshold

  const overpopulatedTable = [
    { chance: 10, event: 'conflict' },
    { chance: 25, event: 'sickness' },
    { chance: 50, event: 'lean' },
    { chance: 15, event: 'peace' }
  ]
  const normalTable = [
    { chance: 1, event: 'conflict' },
    { chance: 2, event: 'sickness' },
    { chance: 4, event: 'lean' },
    { chance: 93, event: 'peace' }
  ]
  const eventTable = overpopulated ? overpopulatedTable : normalTable

  let roll = random.int(1, 100)
  for (let i = 0; i < discord; i++) {
    roll = Math.min(roll, random.int(1, 100))
  }
  const event = check(eventTable, roll)

  community.status.event = event
  const maxDiscord = Math.max(discord - 1, 10)
  let newDiscord = discord
  switch (event) {
    case 'conflict': newDiscord += 3; break
    case 'sickness': newDiscord += 2; break
    case 'lean': newDiscord += 1; break
    case 'peace': newDiscord -= 1; break
  }
  community.status.discord = Math.min(Math.max(0, newDiscord), maxDiscord)
}

/**
 * We're only covering the last 150 years of this community's history, so we
 * need founders to come in at staggered points in its early history. For
 * a given year, this adds a random number of founders if we're still in the
 * founding period.
 * @param community {Object} - The community object.
 * @param year {number} - The year currently being run.
 */

const addFounder = (community, year) => {
  const founders = community.traditions.village ? 20 : 4
  const living = community.people.filter(person => !person.died)
  if (living.length < founders) {
    const num = random.int(0, 2)
    for (let i = 0; i < num; i++) {
      const founder = generateFounder()
      founder.born = year
      community.people.push(founder)
    }
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
  age(community, year)
  if (founding) {
    addFounder(community, year)
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
  const randomizer = random.normal(15, 1)
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
