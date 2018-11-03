/**
 * Returns a "slugified" version of the original string.
 * @param orig {string} - A string to "slugify."
 * @returns {string} - The "slugified" version of the original string.
 */

const slugify = orig => {
  const a = 'àáäâèéëêìíïîòóöôùúüûñçßÿœæŕśńṕẃǵǹḿǘẍźḧ·/_,:;'
  const b = 'aaaaeeeeiiiioooouuuuncsyoarsnpwgnmuxzh------'
  const p = new RegExp(a.split('').join('|'), 'g')

  if (!orig) { return '' }

  return orig.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(p, c =>
      b.charAt(a.indexOf(c)))
    .replace(/&/g, '-and-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

export default slugify
