/* eslint-env jest */
jest.mock('request-promise')

/**
 * These tests are run against the "real" cli by actually starting a subprocess.
 * This means that no mocks are available.
 */

const resetEnvironmentVariables = require('./helpers/environment').resetEnvironmentVariables
const runCli = require('./helpers/cli').realCli

const containsMissingError = expect.stringContaining('ERR! Missing')
const scriptIds = require('./fixtures/script-ids')

const expectNoSuccess = function (msg) {
  return (...args) => {
    console.log(...args)
    throw new Error(msg)
  }
}

describe('CLI Only', () => {
  beforeEach(resetEnvironmentVariables)

  const request = require('request-promise')
  beforeEach(() => {
    request.mockClear()
  })

  const required = {
    'api key': '--api-key=asdf',
    'script id': '--script-id=' + scriptIds.SCRIPT_ID_SUCCESS,
    'version name': '--version-name=2.0.0'
  }
  for (let pair of Object.entries(required)) {
    const missing = pair[0]
    const args = Object.values(required).filter(x => x !== pair[1])

    it(`fails if ${missing} is missing`, () => {
      return runCli(args)
        .then(expectNoSuccess('should error'), ({ stderr, code }) => {
          expect(code).not.toBe(0)
          expect(stderr).toEqual(containsMissingError)
          expect(request).not.toHaveBeenCalled()
        })
    })
  }
})

describe('CLI with environment variables', () => {
  beforeEach(resetEnvironmentVariables)

  const request = require('request-promise')
  beforeEach(() => {
    request.mockClear()
  })

  it('fails if version is missing (given SF_APIKEY and SF_SCRIPTID)', () => {
    return runCli([], {
      env: {
        SF_APIKEY: 'asdff',
        SF_SCRIPTID: scriptIds.SCRIPT_ID_SUCCESS
      }
    }).then(expectNoSuccess('should error'))
      .catch(({ stderr, code }) => {
        expect(code).not.toBe(0)
        expect(stderr).toEqual(containsMissingError)
        expect(request).not.toHaveBeenCalled()
      })
  })

  it('fails if api key is missing (given SF_SCRIPTID, --version-name)', () => {
    return runCli(['--version-name=2.0.0'], {
      env: {
        SF_SCRIPTID: scriptIds.SCRIPT_ID_SUCCESS
      }
    }).then(expectNoSuccess('should error'), ({ stderr, code }) => {
      expect(code).not.toBe(0)
      console.error(stderr)
      expect(stderr).toEqual(containsMissingError)
      expect(request).not.toHaveBeenCalled()
    })
  })

  it('fails if script id is missing (given SF_APIKEY, --version-name)', () => {
    return runCli(['--version-name=2.0.0'], {
      env: {
        SF_APIKEY: 'asdfsdf'
      }
    }).then(expectNoSuccess('should error'), ({ stderr, code }) => {
      expect(code).not.toBe(0)
      expect(stderr).toEqual(containsMissingError)
      expect(request).not.toHaveBeenCalled()
    })
  })
})
