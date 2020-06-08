# Node APK Dump

Use AAPT2 to dump APK info and parse it into JSON.

```
const parse = require('apk-dump')

parse('path/to/apk')
  .then(manifest => {
    ...
  })
  .catch(err => {})

// or use with callback
parse('path/to/apk/, (err, manifest) => {
  ...
})
```
