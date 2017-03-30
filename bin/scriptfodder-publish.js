#!/usr/bin/env node

/* istanbul ignore next */
try {
  require('../dist')(process.argv, process)
} catch (err) {
  if (err.code === 'MODULE_NOT_FOUND') {
    require('babel-register')
    require('../src')(process.argv, process)
  } else {
    console.error(err)
    process.exit(1)
  }
}
