const fs = require('fs')

fs.readdir('./data', function (err, files) {
  if (err) {
    return console.log('Unable to scan directory: ' + err)
  }
  files.forEach(function (file) {
    console.log(
      'import * as ' + file.replace('.json', '') + " from './" + file + "'",
    )
  })
})
