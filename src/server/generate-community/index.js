import { daysFromNow } from '../../shared/utils'

const generateCommunity = community => {
  const fromDate = daysFromNow(89250) // 150 years before toDate
  const toDate = daysFromNow(144000) // 144,000 days from today
  const fromYear = fromDate.getFullYear()
  const toYear = toDate.getFullYear()
  for (let year = fromYear; year < toYear; year++) {
    community.chronicle.push({ year })
  }
}

export default generateCommunity
