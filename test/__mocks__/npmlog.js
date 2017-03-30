/* eslint-env jest */

const npmlog = jest
  .genMockFromModule('npmlog')

npmlog.error.mockImplementation((...args) => {
  console.error(...args)
})

module.exports = npmlog
