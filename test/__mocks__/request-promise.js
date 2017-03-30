/* eslint-env jest */
const scriptIds = require('../fixtures/script-ids')

const requestPromise = jest
  .genMockFromModule('request-promise')
  .mockImplementation(mockRequestPromise)

requestPromise.defaults.mockImplementation(defaults => {
  const mocked = jest.fn((options) => mockRequestPromise(Object.assign(defaults, options)))
  requestPromise.mock = mocked.mock
  return mocked
})

const responses = {
  [scriptIds.SCRIPT_ID_BAD_NETWORK]: () => Promise.reject(new Error('Network error')),
  [scriptIds.SCRIPT_ID_BAD_UPLOAD]: () => Promise.resolve({ 'status': 'error', 'description': 'Upload failed' }),
  [scriptIds.SCRIPT_ID_SUCCESS]: () => Promise.resolve({ 'status': 'success' })
}

const actualRequestPromise = require.requireActual('request-promise')

/* eslint-disable consistent-return */
function mockRequestPromise (options) {
  const { url } = options

  // Uploading file
  const matches = url.match(/\/api\/scripts\/version\/add\/(.*)\?api_key=(.*)/)
  if (matches) {
    const version = matches[1]
    if (responses[version]) {
      return responses[version]()
    }
  }

  return actualRequestPromise(options)
}
/* eslint-enable consistent-return */

module.exports = requestPromise
