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
      method: 'POST',
      url: `/api/scripts/version/add/${scriptId}?api_key=${this.apiKey}`,
      formData: {
        file: {
          value: file,
          options: {
            filename: versionName + '.zip',
            contentType: 'application/zip'
          }
        },
        name: versionName,
        changes
      }
    }

    return request(opts).then(response => {
      if (response.status === 'error') {
        throw new Error('API Response: ' + response.description)
      }
      return response
    })
  }
}

module.exports = ScriptFodder
