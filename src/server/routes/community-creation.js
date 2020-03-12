import express from 'express'
import axios from 'axios'
import { escape as SQLEscape } from 'sqlstring'
import distance from '@turf/distance'
import Community from '../generate-community/community'
import { clone } from '../../shared/utils'
import config from '../../../config'
import db from '../db'

import specialtyData from '../../data/specialties'

import {
  convertLat,
  convertLon
} from '../../shared/utils.geo'

/**
 * Transforms the key/value pairs of an object into suitable GET parameters.
 * @param body {Object} - An object with key/value pairs.
 * @returns {string} - A string suitable for use as GET parameters.
 */

const returnBody = body => {
  const keys = Object.keys(body)
  const pairs = keys.map(key => `${key}=${encodeURIComponent(body[key])}`)
  return pairs.join('&')
}

/**
 * Update community data in the database.
 * @param data {Object} - An object with the current state of the community
 *   data.
 * @param id {number} - The primary key for the community to update.
 * @returns {Promise<unknown>} - A Promise that resolves when the database has
 *   been updated.
 */

const update = async (data, id) => {
  return db.run(`UPDATE communities SET data=${SQLEscape(JSON.stringify(data))} WHERE id=${SQLEscape(id)};`)
}

/**
 * Tries to extract `lat` and `lon` values from `req.body` and convert them to
 * latitude and longitude. If this fails (either because the values don't exist
 * in `req.body`, or they aren't valid latitude or longitude values, or for any
 * other odd reason), a redirect is issued with error information. Otherwise,
 * an object is returned with the latitude and longitude as numbers.
 * @param req {Object} - The Express request object.
 * @param res {Object} - The Express response object.
 * @param base {string} - A base URL to use when reporting an error.
 * @returns {{lon: *, lat: *}} - An object including the latitude (`lat`) and
 *   longitude (`lon`) values derived as numbers.
 */

const requiresCoords = (req, res, base) => {
  const lat = convertLat(req.body.lat)
  const lon = convertLon(req.body.lon)
  const errorLat = !lat
  const errorLon = !lon
  if (errorLat || errorLon) {
    const error = errorLat && errorLon ? 'both' : errorLat ? 'lat' : 'lon'
    res.redirect(`${base}error=${error}&${returnBody(req.body)}`)
  } else {
    return { lat, lon }
  }
}

/**
 * Saves a new community with the center of its territory specified.
 * @param req {Object} - The Express request object.
 * @param res {Object} - The Express response object.
 * @returns {Promise<void>} - A Promise that resolves with the community saved
 *   to the database and a redirect issued to the next page.
 */

const saveCenter = async (req, res) => {
  const coords = requiresCoords(req, res, '/create-community?step=1&')
  const r = await axios.get(`${config.api}/geo/${coords.lat},${coords.lon}`)
  if (r && r.data && !r.data.error) {
    const commData = {
      parent: r.data.parent,
      territory: {
        center: [ coords.lat, coords.lon ],
        coastal: r.data.coastal,
        ecozone: r.data.ecozone,
        continent: r.data.continent,
        region: r.data.region
      },
      traditions: {},
      chronicle: [],
      people: {}
    }
    const community = await db.run(`INSERT INTO communities (data) VALUES (${SQLEscape(JSON.stringify(commData))});`)
    res.redirect(`/create-community/${community.insertId}`)
  } else {
    res.redirect('/create-community?step=1')
  }
}

/**
 * Save a community's specialties to the database.
 * @param community {Object} - The community data object, containing everything
 *   decided about it to this point.
 * @param id {number} - The ID number for the community record in the database.
 * @param req {Object} - The Express request object.
 * @param res {Object} - The Express response object.
 * @returns {Promise<void>} - A Promise that resolves with the community saved
 *   to the database and a redirect issued to the next page.
 */

const saveSpecialties = async (community, id, req, res) => {
  const { specialty } = req.body
  if (specialty) {
    const specialties = Array.isArray(specialty) ? specialty : [ specialty ]
    if (specialties.length <= 4) {
      let village = 0
      for (let i = 0; i < specialties.length; i++) {
        if (specialtyData.village.yes.indexOf(specialties[i]) > -1) village += 100
        if (specialtyData.village.maybe.indexOf(specialties[i]) > -1) village += 50
      }
      village = (village >= 100)
      community.traditions = { village, specialties, answers: {} }
      if (village) {
        community.territory.places = { C10: null, D7: null, H7: null, S7: null }
      } else {
        community.territory.places = { C10: null, D5: null, H7: null, S7: null }
      }
      await update(community, id)
      res.redirect(`/create-community/${id}`)
    } else {
      res.redirect(`/create-community/${id}?error=toomany&specialties=${encodeURIComponent(specialties.join(';'))}`)
    }
  } else {
    res.redirect(`/create-community/${id}`)
  }
}

/**
 * Save a response to a prompt concerning a specialty.
 * @param community {Object} - An object containing the current data for the
 *   community being created.
 * @param id {number} - The primary key of the community record in the
 *   database.
 * @param req {Object} - The Express request object.
 * @param res {Object} - The Express response object.
 * @returns {Promise<void>} - A Promise that resolves when the database has
 *   been updated and the user has been redirected to the next step.
 */

const saveSpecialtyAnswer = async (community, id, req, res) => {
  const { specialty, response } = req.body
  let { specialties, answers } = community.traditions
  answers[specialty] = response
  if (specialties.length === Object.keys(answers).length) {
    community.traditions.specialties = clone(answers)
    delete community.traditions.answers
  }
  await update(community, id)
  res.redirect(`/create-community/${id}`)
}

/**
 * Save a response to a prompt to name a place in your territory.
 * @param community {Object} - An object containing the current data for the
 *   community being created.
 * @param id {number} - The primary key of the community record in the
 *   database.
 * @param req {Object} - The Express request object.
 * @param res {Object} - The Express response object.
 * @returns {Promise<void>} - A Promise that resolves when the database has
 *   been updated and the user has been redirected to the next step.
 */

const savePlace = async (community, id, req, res) => {
  const coords = requiresCoords(req, res, `/create-community/${id}?`)
  if (coords) {
    const center = clone(community.territory.center)
    const place = [ coords.lon, coords.lat ]
    const d = distance(center.reverse(), place)
    const limit = req.body.card === 'C10' ? 225 : community.traditions.village ? 6.25 : 12.5
    if (d > limit) {
      res.redirect(`/create-community/${id}?error=toofar&${returnBody(req.body)}`)
    } else {
      const { card, name, intro } = req.body
      if (!name || name.length <= 0) {
        res.redirect(`/create-community/${id}?error=noname&${returnBody(req.body)}`)
      } else if (!intro || intro.length <= 0) {
        res.redirect(`/create-community/${id}?error=nointro&${returnBody(req.body)}`)
      } else {
        community.territory.places[card] = {
          lat: coords.lat,
          lon: coords.lon,
          name,
          intro
        }
        await update(community, id)
        res.redirect(`/create-community/${id}`)
      }
    }
  }
}

/**
 * Saves a choice.
 * @param community {Object} - An object containing the current data for the
 *   community being created.
 * @param id {number} - The primary key of the community record in the
 *   database.
 * @param req {Object} - The Express request object.
 * @param res {Object} - The Express response object.
 * @returns {Promise<void>} - A Promise that resolves when the database has
 *   been updated and the user has been redirected to the next step.
 */

const saveChoice = async (community, id, req, res) => {
  switch (req.body.choice) {
    case 'genders':
      community.traditions.genders = req.body.genders; break
    case 'magic':
      community.traditions.magic = req.body.magic; break
    case 'skill':
      community.traditions.skill = req.body.skill; break
    default: break
  }

  await update(community, id)
  res.redirect(`/create-community/${id}`)
}

/**
 * Randomly generate a community.
 * @param community {Object} - An object containing the current data for the
 *   community being created.
 * @param id {number} - The primary key of the community record in the
 *   database.
 * @param req {Object} - The Express request object.
 * @param res {Object} - The Express response object.
 * @returns {Promise<void>} - A Promise that resolves when the database has
 *   been updated and the user has been redirected to the next step.
 */

const generate = async (community, id, req, res) => {
  const c = new Community(community)
  c.run()
  console.log(c.analyze())
  res.redirect(`/create-community/${id}`)
}

const CommunityCreationRouter = express.Router()

// POST /create-community
CommunityCreationRouter.post('/', async (req, res) => {
  const id = req.body.community
  const r = await db.run(`SELECT data FROM communities WHERE id=${SQLEscape(id)}`)
  if (r && r.length > 0 && r[0] && r[0].data) {
    const community = JSON.parse(r[0].data)
    if (!community.traditions || !community.traditions.specialties) {
      await saveSpecialties(community, id, req, res)
    } else if (req.body.specialty) {
      await saveSpecialtyAnswer(community, id, req, res)
    } else if (req.body.card) {
      await savePlace(community, id, req, res)
    } else if (req.body.choice) {
      await saveChoice(community, id, req, res)
    } else if (req.body.generate === 'true') {
      await generate(community, id, req, res)
    }
  } else {
    await saveCenter(req, res)
  }
})

export default CommunityCreationRouter
