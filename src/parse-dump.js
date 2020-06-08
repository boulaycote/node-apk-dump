// taken from https://github.com/frankkoenigstein/aapt2-dump-badging2json

const valueEx = /\s*(([^=]+)=)?'([^']*)'/gm

module.exports = function (dump) {
  const dumpObject = dump
    .match(/[^\r\n]+/g) // split lines
    .map(line => line.match(/^\s*([^:\s]+)[:]?\s*(.*)/))
    // extract line key value
    .map(([, g1, g2]) => [g1, g2])
    // split values
    .map(([key, value]) => {
      const ms = []
      let m = valueEx.exec(value)
      while (m !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === valueEx.lastIndex) {
          valueEx.lastIndex++
        }
        ms.push(m)
        m = valueEx.exec(value)
      }
      return [key, ms]
    })
    // extract interesting match groups
    .map(([key, values]) => [key, values.map(match => [match[2], match[3]])])
    // reduce to array or object if values are named
    .map(([key, values]) => [
      key,
      values.reduce((acc, [name, value]) => {
        if (!name) {
          if (!acc) {
            acc = []
          }
          acc = [...acc, value]
        } else {
          if (!acc) {
            acc = {}
          }
          acc[name] = value
        }
        return acc
      }, null)
    ])
    // use single value of arrays with length 1
    .map(([key, values]) => {
      if (Array.isArray(values) && values.length === 1) {
        return [key, values.shift()]
      }
      return [key, values]
    })
    // combine duplicate line keys
    .reduce((acc, [key, values]) => {
      // in case of duplicate keys, create array
      if (acc[key]) {
        // if already an array just push new value
        if (Array.isArray(acc[key])) {
          acc[key].push(values)
        } else {
          // create array with values
          acc[key] = [acc[key], values]
        }
      } else {
        acc[key] = values
      }
      return acc
    }, {})
  return dumpObject
}
