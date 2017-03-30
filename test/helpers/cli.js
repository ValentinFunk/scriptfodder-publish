/* eslint-env jest */

const childProcess = require('child-process-promise')

exports.realCli = function (args, options) {
  return childProcess.spawn('node', ['bin/scriptfodder-publish.js', ...args], Object.assign({
    capture: [ 'stdout', 'stderr' ]
  }, options)).then(o => console.log(o) || o)
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
