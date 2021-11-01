const fs = require('fs')

const dir = './data'

const parseDir = () => {
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
}

createDir = () => {
  try {
    fs.mkdirSync(dir)

    console.log(`>>> ${dir} is created!`)
  } catch (err) {
    console.error(`>>> Error while creating ${dir}.`, err)
  }
}

deleteDir = () => {
  try {
    fs.rmSync(dir, { recursive: true })

    console.log(`>>> ${dir} is deleted!`)
  } catch (err) {
    console.error(`>>> Error while deleting ${dir}.`, err)
  }
}

exports.prepareDir = () => {
  if (fs.existsSync(dir)) {
    console.log('>>> Directory exists! Deleting directory ...')
    deleteDir()
    console.log('>>> Creating new directory ...')
    createDir()
  } else {
    console.log('>>> Directory not found.')
    console.log('>>> Creating new directory ...')
    createDir()
  }
}
