/* eslint-env jest */

require('./helpers/assertion')
const scriptIds = require('./fixtures/script-ids')
const fs = require('fs')

/**
 * Tests are run without spawning a subprocess.
 */
const cli = require('./helpers/cli').requireCli

const expectNoFailure = function (msg) {
  return (...args) => {
    console.log(...args)
    throw new Error(msg)
  }
}

const API_KEY = 'adsfasdf'
const VERSION_NAME = '2.0.0'

describe('uploading a new version', () => {
  const request = require('request-promise')

  beforeEach(() => {
    request.mock.calls = []
    request.mock.instances = []
  })

  it('uploads correctly using command line arguments (no changelog)', () => {
    const args = [
      `--script-id=${scriptIds.SCRIPT_ID_SUCCESS}`,
      `--version-name=${VERSION_NAME}`,
      `--api-key=${API_KEY}`,
      '*'
    ]
    return cli(args)
      .then(result => {
        expect(request).toHaveBeenCalledWithObject({
          formData: {
            name: VERSION_NAME
          }
        })

        const args = request.mock.calls[0]
        expect(args[0].url).toEqual(`/api/scripts/version/add/${scriptIds.SCRIPT_ID_SUCCESS}?api_key=${API_KEY}`)
      }, expectNoFailure('Failed'))
  })

  it('uploads correctly using env vars (no changelog)', () => {
    const args = [
      `--version-name=${VERSION_NAME}`,
      '*'
    ]
    return cli(args, {
      SF_APIKEY: API_KEY,
      SF_SCRIPTID: scriptIds.SCRIPT_ID_SUCCESS
    })
      .then(result => {
        expect(request).toHaveBeenCalledWithObject({
          formData: {
            name: VERSION_NAME
          }
        })

        const args = request.mock.calls[0]
        expect(args[0].url).toEqual(`/api/scripts/version/add/${scriptIds.SCRIPT_ID_SUCCESS}?api_key=${API_KEY}`)
      }, expectNoFailure('Failed'))
  })

  it('reads the version from package.json with --version-from-package', () => {
    const args = [
      `--script-id=${scriptIds.SCRIPT_ID_SUCCESS}`,
      `--version-from-package`,
      `--api-key=${API_KEY}`,
      '*'
    ]

    return cli(args)
      .then(result => {
        expect(request).toHaveBeenCalledWithObject({
          formData: {
            name: JSON.parse(fs.readFileSync('package.json')).version

          }
        })
      }, expectNoFailure('Failed'))
  })

  it('reads the changelog correctly and uploads it', () => {
    const changesFile = 'test/fixtures/changelog_test.md'
    const args = [
      `--script-id=${scriptIds.SCRIPT_ID_SUCCESS}`,
      `--version-name=${VERSION_NAME}`,
      `--api-key=${API_KEY}`,
      `--changes-file=${changesFile}`,
      '*'
    ]
    return cli(args)
      .then(result => {
        expect(request).toHaveBeenCalledWithObject({
          formData: {
            changes: fs.readFileSync(changesFile)
          }
        })
      }, expectNoFailure('Failed'))
  })
})
