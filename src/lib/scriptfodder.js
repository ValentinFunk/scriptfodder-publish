const request = require('request-promise').defaults({
  headers: {
    'user-agent': 'scriptfodder-publish'
  },
  baseUrl: 'https://scriptfodder.com',
  json: true
})

class ScriptFodder {
  constructor (apiKey) {
    this.apiKey = apiKey
    this.request = request.defaults({
      qs: {
        'api_key': this.apiKey
      }
    })
  }

  uploadVersion ({
    scriptId,
    changes,
    versionName,
    file
  }) {
    const opts = {
      url: `/api/scripts/version/add/${scriptId}`,
      formData: {
        file: {
          value: file,
          contentType: 'application/zip'
        },
        name: versionName,
        changes
      }
    }

    return request(opts)
  }
}

module.exports = ScriptFodder
