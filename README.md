# scriptfodder-publish

[![Build Status](https://travis-ci.org/Kamshak/scriptfodder-publish.svg?branch=master)](https://travis-ci.org/Kamshak/scriptfodder-publish)
[![npm version](https://badge.fury.io/js/scriptfodder-publish.svg)](https://badge.fury.io/js/scriptfodder-publish)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

Package to publish new versions of addons to ScriptFodder

## Usage 

CLI:
```
scriptfodder-publish
Uploads a new version to an existing scriptfodder script.

Usage:
  scriptfodder-publish [glob]

  glob is a pattern that is zipped and uploaded. Default is ** which
  uploads everything in the current working directory.
Options:
  -h --help               Show this screen.
  -v --version            Show version.
  --api-key=<String>      Scriptfodder API Key
  --script-id=<Number>    Scriptfodder Script ID
  --version-name=<String> Name of the new version
  --changes-file=<String> Path of the file containing the changelog
```

Api Key and Script Id can be configured via environment variables as well:
- SF_APIKEY
- SF_SCRIPTID

## License
The MIT License
```
Copyright (c) 2017 Valentin Funk

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```
