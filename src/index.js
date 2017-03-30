const ScriptFodder = require('./lib/scriptfodder')
const log = require('npmlog')
const nopt = require('nopt')
const _ = require('lodash')
const archiver = require('archiver')
const fs = require('fs')
log.heading = 'scriptfodder-publish'
const humanize = require('humanize')

const knownOptions = {
  'api-key': String,
  version: Boolean,
  help: Boolean,
  'script-id': Number,
  'version-name': String
}

const shortHands = {
  v: ['--version'],
  h: ['--help']
}

function zipArchive (glob) {
  return new Promise((resolve, reject) => {
    var archive = archiver('zip')

    var bufs = []
    archive.on('data', function (d) { bufs.push(d) })

    archive.on('end', function () {
      var buf = Buffer.concat(bufs)
      resolve({
        data: buf,
        fileSize: archive.pointer()
      })
    })

    archive.on('error', function (e) {
      reject(e)
    })

    archive.glob(glob).finalize()
  })
}

const ownPkg = require('../package.json')
module.exports = async function (argv) {
  const parsedArgs = nopt(knownOptions, shortHands, argv)
  let options = _.defaults(_.mapKeys(parsedArgs, function (value, key) {
    return _.camelCase(key)
  }), {
    apiKey: process.env.SF_APIKEY,
    scriptId: process.env.SF_SCRIPTID,
    glob: '**'
  })

  if (options.version) {
    console.log(ownPkg.version || 'development')
    process.exit(0)
  }

  if (options.help) {
    console.log(`
scriptfodder-publish
Uploads a new version to an existing scriptfodder script.

Usage:
  scriptfodder-publish [glob]

  glob is a pattern that is zipped and uploaded. Default is ** which
  uploads everything in the current working directory.
Options:
  -h --help               Show this screen.
  -v --version            Show version.
  --api-key=<String>      Scriptfodder API Key
  --script-id=<Number>    Scriptfodder Script ID
  --version-name=<String> Name of the new version
  --changes-file=<String> Path of the file containing the changelog
`)
    process.exit(0)
  }

  if (!options.apiKey) {
    log.error('Missing api key. (--api-key=<String>)')
    process.exit(1)
  }

  if (!options.versionName) {
    log.error('Missing version name. (--version-name=<String>)')
    process.exit(1)
  }

  if (!options.scriptId) {
    log.error('Missing script id. (--script-id=<Number>)')
    process.exit(1)
  }

  if (options.argv.remain[0]) {
    options.glob = options.argv.remain[0]
  }

  let changes = '*No changes given.*'
  if (options.changesFile) {
    try {
      changes = fs.readFileSync(options.changesFile)
    } catch (e) {
      log.error('Could not load file ' + options.changesFile, e)
    }
  }

  const { data, fileSize } = await zipArchive(options.glob)
  log.info('Upload', `Uploading new version: ${humanize.filesize(fileSize)}`)

  const client = new ScriptFodder(options.apiKey)
  try {
    const result = await client.uploadVersion({
      scriptId: options.scriptId,
      versionName: options.versionName,
      changes,
      file: data
    })
    log.info('Upload', `Upload finished. Status: ${result.status}`)
  } catch (e) {
    log.error('Upload', e.message)
    log.verbose(e)
  }
}
