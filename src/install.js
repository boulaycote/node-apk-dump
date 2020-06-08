const https = require('https')
const os = require('os')
const fs = require('fs')
const path = require('path')
const decompress = require('decompress')

const toolDir = `${__dirname}/../tool`

const MAX_ATTEMPTS = 3
const AAPT2_VERSION = '4.0.0-6051327'

async function download(attemptsLeft, platform) {
  const url = `https://dl.google.com/dl/android/maven2/com/android/tools/build/aapt2/${AAPT2_VERSION}/aapt2-${AAPT2_VERSION}-${platform}.jar`

  const tempFile = `/tmp/platform-tools-${new Date().getTime()}-${platform}.jar`
  const dir = `${toolDir}/${platform}`
  const file = fs.createWriteStream(tempFile)

  https.get(url, response => {
    response.pipe(file)
    response.on('end', async () => {
      try {
        await decompress(tempFile, dir, {
          filter: file => path.basename(file.path) === 'aapt2'
        })
        fs.chmodSync(`${dir}/aapt2`, '755')
        fs.unlinkSync(tempFile)
      } catch (ex) {
        if (attemptsLeft === 0) {
          throw err
        } else {
          return get(attemptsLeft - 1, platform)
        }
      }
    })
  })
}

function downloadForPlatform() {
  let platform = os.platform()

  if (platform === 'darwin') platform = 'osx'

  download(MAX_ATTEMPTS, platform)
}

downloadForPlatform()
