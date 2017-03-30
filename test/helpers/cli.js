/* eslint-env jest */

const childProcess = require('child-process-promise')

exports.realCli = function (args, env) {
  return childProcess.spawn('node', ['bin/scriptfodder-publish.js', ...args], {
    capture: [ 'stdout', 'stderr' ],
    env
  })
}

class ProcessExitError {
  constructor (code) {
    this.code = code
  }
}
exports.ProcessExitError = ProcessExitError

exports.requireCli = function (args, env = {}) {
  const argv = ['node', 'script.js', ...args]
  const process = {
    exit: code => { throw new ProcessExitError(code) },
    env
  }
  return require.requireActual('../../dist/index')(argv, process)
}
