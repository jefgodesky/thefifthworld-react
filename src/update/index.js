import Page from '../shared/models/page'
import db from '../server/db'

const updatePage = async (page) => {
  const content = page.getContent()
  const { body } = content
  const bracketed = body.match(/\[\[(.+?)\]\]/gm)
  if (bracketed) {
    const tags = bracketed.map(m => m.match(/\[\[(.+?):(.+?)\]\]/)).filter(m => m !== null)
    tags.forEach(t => {
      const tag = t[1]
      const val = t[2]

      switch (tag) {
        case 'Location':
          // This is a location; save it as a place
          break;
        case 'Type':
          // This will continue to be kept in the pages table.
          break;
        default:
          // Save to the tags table
          console.log(`${tag} = ${val}`)
          break;
      }
    })
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
