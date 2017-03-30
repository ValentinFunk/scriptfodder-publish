/* eslint-env jest */

const _ = require('lodash')
const matchers = require('jest-matchers/build/matchers')

expect.extend({
  toHaveBeenCalledWithObject (received, argument) {
    if (received.mock.calls.length === 0) {
      return {
        message: () => 'Function has not been called',
        pass: false
      }
    }

    const passed = _.some(received.mock.calls, (args) => {
      if (!args[0]) {
        return false
      }

      let match = matchers.toMatchObject(
        args[0],
        argument
      )
      return match.pass
    })

    return {
      message: () => ('Arguments did not match the template'),
      pass: passed
    }
  }
})
