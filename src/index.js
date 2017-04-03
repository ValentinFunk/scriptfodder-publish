const ScriptFodder = require('./lib/scriptfodder')
const log = require('npmlog')
const nopt = require('nopt')
const _ = require('lodash')
const archiver = require('archiver')
const fs = require('fs')
log.heading = 'scriptfodder-publish'
const humanize = require('humanize')
const path = require('path')

require('dotenv').config()

const knownOptions = {
  'api-key': String,
  version: Boolean,
  help: Boolean,
  'script-id': Number,
  'version-name': String,
  'relative-to': String,
  'version-from-package': Boolean
}

const shortHands = {
  v: ['--version'],
  h: ['--help']
}

function zipArchive (glob, globOptions) {
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

    archive.glob(glob, globOptions).finalize()
  })
}

const ownPkg = require('../package.json')
module.exports = async function (argv, process) {
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
   OR
  --version-from-package  Get version name from package.json in CWD
  --changes-file=<String> Path of the file containing the changelog
  --relative-to           Add files to zip relative to this folder.
                          e.g. scriptfodder-publish --relative-to=dist
                          will add all files in dist under / in the zip archive                
`)
    process.exit(0)
  }

  if (!options.apiKey) {
    log.error('Missing api key. (--api-key=<String>)')
    process.exit(1)
  }

  if (options.versionName && options.versionFromPackage) {
    log.error('Incompatible options --version-name and --version-from-package')
    process.exit(1)
  } else if (options.versionFromPackage) {
    try {
      options.versionName = JSON.parse(fs.readFileSync('package.json')).version
    } catch (e) {
      log.error('version', 'Could not determine version from package.json: ', e.message)
      log.verbose(e)
      process.exit(1)
    }
  } else if (!options.versionName) {
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

  let changes = '*No changelog.*'
  if (options.changesFile) {
    try {
      changes = fs.readFileSync(options.changesFile)
    } catch (e) {
      log.error('Could not load file ' + options.changesFile, e)
    }
  } else {
    log.verbose('No changelog file given, trying CHANGELOG_<version>.tmp.md')
    try {
      const version = JSON.parse(fs.readFileSync('package.json')).version
      const filename = `CHANGELOG_${version}.tmp.md`
      changes = fs.readFileSync(filename)
    } catch (e) {
      log.verbose('Could not read file: ', e)
    }
  }

  const globOptions = {}
  if (options.relativeTo) {
    globOptions.cwd = path.resolve(options.relativeTo)
  }

  const gmodIgnorePath = path.resolve(globOptions.cwd || '.', '.gmodignore')
  if (fs.existsSync(gmodIgnorePath)) {
    globOptions.ignore = fs.readFileSync(gmodIgnorePath, 'utf-8').split(/[\r\n]+/).filter(Boolean)
  }

  const { data, fileSize } = await zipArchive(options.glob, globOptions)
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
