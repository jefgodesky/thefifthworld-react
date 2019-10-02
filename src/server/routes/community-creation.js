import express from 'express'
import { convertLat, convertLon } from '../../shared/utils.geo'
// import { escape as SQLEscape } from 'sqlstring'
// import db from '../db'

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
    console.log([ lat, lon ])
    res.redirect('/create-community?step=1')
  }
})

export default CommunityCreationRouter
