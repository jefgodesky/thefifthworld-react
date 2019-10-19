import express from 'express'
import { escape as SQLEscape } from 'sqlstring'
import { clone } from '../../shared/utils'
import intersect from '@turf/intersect'
import db from '../db'

import specialtyData from '../../data/specialties'

import {
  convertLat,
  convertLon,
  loadCoastlines,
  drawCircle
} from '../../shared/utils.geo'

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
 * Saves a new community with the center of its territory specified.
 * @param req {Object} - The Express request object.
 * @param res {Object} - The Express response object.
 * @returns {Promise<void>} - A Promise that resolves with the community saved
 *   to the database and a redirect issued to the next page.
 */

const saveCenter = async (req, res) => {
  const lat = convertLat(req.body.lat)
  const lon = convertLon(req.body.lon)
  const errorLat = !lat
  const errorLon = !lon
  if (errorLat || errorLon) {
    const error = errorLat && errorLon ? 'both' : errorLat ? 'lat' : 'lon'
    res.redirect(`/create-community?step=1&error=${error}&lat=${encodeURIComponent(req.body.lat)}&lon=${encodeURIComponent(req.body.lon)}`)
  } else {
    // Is it coastal?
    let coastal = false
    const range = drawCircle(lat, lon)
    const coastlines = await loadCoastlines()
    while (!coastal && coastlines.length > 0) {
      const coll = coastlines.shift()
      if (coll) {
        while (!coastal && coll.features.length > 0) {
          const feature = coll.features.shift()
          if (intersect(range, feature) !== null) coastal = true
        }
      }
    }

    // Save data
    const data = {
      territory: {
        center: [ lat, lon ],
        coastal
      },
      traditions: {},
      chronicle: [],
      people: []
    }
    const community = await db.run(`INSERT INTO communities (data) VALUES (${SQLEscape(JSON.stringify(data))});`)
    res.redirect(`/create-community/${community.insertId}`)
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
      let village = false
      for (let i = 0; i < specialties.length; i++) {
        if (specialtyData.village.indexOf(specialties[i]) > -1) village = true
      }
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
 * @param id {number} - THe primary key of the commmunity record in the
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
    }
  } else {
    await saveCenter(req, res)
  }
})

export default CommunityCreationRouter
