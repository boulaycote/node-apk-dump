'use strict'

const { exec } = require('child_process')
const os = require('os')
const fs = require('fs')
const VError = require('verror')
const parseDump = require('./parse-dump')

const toolDir = `${__dirname}/../tool`

module.exports = function (filename, callback) {
  callback = callback || function () {}

  let platform = os.platform()

  if (platform === 'darwin') platform = 'osx'

  const tool = `${toolDir}/${platform}/aapt2`

  return new Promise((resolve, reject) => {
    fs.access(tool, fs.X_OK, err => {
      if (err) {
        const verror = new VError(
          err,
          'aapt2 not found. Did you run install.js?'
        )
        reject(verror)
        callback(verror, null)
      } else {
        const cmd = [tool, 'dump', 'badging', filename].join(' ')

        exec(cmd, (err, stdout, stderr) => {
          const error = err || stderr

          if (error) {
            const verror = new VError(
              error,
              `There was a problem running ${cmd}`
            )
            reject(verror)
            callback(verror, null)
          } else {
            const result = parseDump(stdout)

            console.log(stdout)
            console.log(result)
            resolve(result)
            callback(null, result)
          }
        })
      }
    })
  })
}
