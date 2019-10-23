import Page from '../shared/models/page'
import { SQLEscape } from '../server/utils'
import db from '../server/db'

const check = async (table, where) => {
  const c = await db.run(`SELECT COUNT(id) AS count FROM ${table} WHERE ${where};`)
  return c && c[0] && c[0].count <= 0
}

const addPlace = async (id, coords) => {
  const c = await check('places', `page=${id}`)
  if (c) {
    const c = coords.split(',').map(c => c.trim())
    await db.run(`INSERT INTO places (page, location) VALUES (${id}, ST_GeomFromText('POINT(${c.join(' ')})', 4326));`)
  }
}

const addTag = async (id, tag, val) => {
  const c = await check('tags', `page=${id} AND tag=${SQLEscape(tag)} AND value=${SQLEscape(val)}`)
  if (c) {
    await db.run(`INSERT INTO tags (page, tag, value) VALUES (${id}, ${SQLEscape(tag)}, ${SQLEscape(val)});`)
  }
}

const updatePage = async (page) => {
  const content = page.getContent()
  const tags = Page.getTags(content.body)
  for (let tag of Object.keys(tags)) {
    const val = tags[tag]

    switch (tag) {
      case 'Location':
        return addPlace(page.id, val)
      case 'Type':
        // This will continue to be kept in the pages table.
        break;
      default:
        return addTag(page.id, tag, val)
    }
  }
}

const update = async () => {
  const ids = await db.run('SELECT id FROM pages;')
  for (let r of ids) {
    const page = await Page.get(r.id, db)
    updatePage(page)
  }
}

update()
