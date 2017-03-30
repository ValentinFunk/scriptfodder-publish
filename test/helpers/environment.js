exports.resetEnvironmentVariables = function () {
  delete process.env.SF_SCRIPTID
  delete process.env.SF_APIKEY
}
