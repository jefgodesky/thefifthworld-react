import express from 'express'
import { escape as SQLEscape } from 'sqlstring'
import intersect from '@turf/intersect'
import db from '../db'

import {
  convertLat,
  convertLon,
  loadCoastlines,
  drawCircle
} from '../../shared/utils.geo'

const CommunityCreationRouter = express.Router()

// POST /create-community/1
CommunityCreationRouter.post('/1', async (req, res) => {
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
      step: 2,
      territory: {
        center: [ lat, lon ],
        coastal
      },
      chronicle: [],
      people: []
    }
    const community = await db.run(`INSERT INTO communities (data) VALUES (${SQLEscape(JSON.stringify(data))});`)
    res.redirect(`/create-community/${community.insertId}`)
  }
})

export default CommunityCreationRouter
