import config from '../../config'
import elasticsearch from 'elasticsearch'

const es = elasticsearch.Client({
  host: config.es
})

export default es
