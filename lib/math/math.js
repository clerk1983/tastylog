const roundTo = require('round-to')

const padding = (value) => {
  if (isNaN(parseInt(value))) return '-'
  return roundTo(value, 2).toPrecision(3)
}

const round = (value) => {
  return roundTo(value, 2)
}

module.exports = {
  padding,
  round,
}
