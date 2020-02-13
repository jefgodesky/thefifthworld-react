import { clone } from '../../shared/utils'

export default class Community {
  constructor (data) {
    if (data) {
      Object.keys(data).forEach(key => {
        this[key] = clone(data[key])
      })
    }
  }

  run () {
    console.log('running community...')
  }

  analyze () {
    return 'analyze community'
  }
}
