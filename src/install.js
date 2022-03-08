const https = require("https");
const os = require("os");
const fs = require("fs");
const path = require("path");
const decompress = require("decompress");

const MAX_ATTEMPTS = 3;
const AAPT2_VERSION = "7.1.2-7984345";

async function download(attemptsLeft, platform) {
  const url = `https://dl.google.com/dl/android/maven2/com/android/tools/build/aapt2/${AAPT2_VERSION}/aapt2-${AAPT2_VERSION}-${platform}.jar`;

  console.info(`Downloading from ${url}`);

  const tempDir = `${__dirname}/../tmp/`;
  const tempFile = `${tempDir}/platform-tools-${platform}.jar`;
  const toolDir = `${__dirname}/../tool/${platform}`;

  fs.mkdirSync(tempDir, { recursive: true });
  fs.mkdirSync(toolDir, { recursive: true });

  const file = fs.createWriteStream(tempFile);

  https.get(url, (response) => {
    response.pipe(file);
    response.on("end", async () => {
      try {
        const file = await decompress(tempFile, toolDir, {
          filter: (file) => path.basename(file.path, ".exe") === "aapt2",
        });
        fs.chmodSync(`${toolDir}/${file[0].path}`, "755");
        console.info('Success!')
      } catch (err) {
        console.error(err);
        if (attemptsLeft === 0) {
          throw err;
        } else {
          return download(attemptsLeft - 1, platform);
        }
      } finally {
        fs.unlinkSync(tempFile);
        fs.rmdirSync(tempDir);
      }
    });
  });
}

function downloadForPlatform() {
  let platform = os.platform();

  if (platform === "darwin") platform = "osx";
  if (platform === "win32") platform = "windows";

  download(MAX_ATTEMPTS, platform);
}

downloadForPlatform();
