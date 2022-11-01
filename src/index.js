/*
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const Generator = require('yeoman-generator')
const path = require('path')
const upath = require('upath')

const { utils } = require('@adobe/generator-app-common-lib')

/*
      'initializing',
      'prompting',
      'configuring',
      'default',
      'writing',
      'conflicts',
      'install',
      'end'
      */

class AemSpaGenerator extends Generator {
  constructor (args, opts) {
    super(args, opts)
  }

  async initializing () {
    // all paths are relative to root
    this.extFolder = 'src/aem-spa-1'
    this.webSrcFolder = path.join(this.extFolder, 'web-src')
    this.extConfigPath = path.join(this.extFolder, 'ext.config.yaml')
    this.configName = 'aem/spa/1'

    // props are used by templates
    this.props = {
      projectName: utils.readPackageJson(this).name
    }
  }

  async writing () {
    const unixExtConfigPath = upath.toUnix(this.extConfigPath)
    // add the extension point config in root
    utils.writeKeyAppConfig(
      this,
      // key
      'extensions.' + this.configName,
      // value
      {
        // posix separator

        $include: unixExtConfigPath
      }
    )

    // add extension point operation
    utils.writeKeyYAMLConfig(
      this,
      this.extConfigPath,
      // key
      'operations', {
        view: [
          { type: 'web', impl: 'index.html' }
        ]
      }
    )

    // add web-src path, relative to config file
    utils.writeKeyYAMLConfig(this, this.extConfigPath, 'web', path.relative(this.extFolder, this.webSrcFolder))

    // add web-src folder
    const destFolder = this.webSrcFolder
    this.sourceRoot(path.join(__dirname, './templates/'))

    // all files in the templates sub-folder will be copied to destFolder, except files with underscore
    this.fs.copyTpl(
      this.templatePath('**/*'),
      this.destinationPath(destFolder),
      this.props,
      {},
      {}
    )

    utils.addDependencies(this, {
      "@adobe/aem-headless-client-js": "^3.1.0",
      "@adobe/aem-react-editable-components": "^1.1.6",
      "@adobe/aem-spa-component-mapping": "^1.1.1",
      "@adobe/aem-spa-page-model-manager": "^1.3.11",
      "@adobe/aio-sdk": "^3.0.0",
      "buffer": "^6.0.3",
      "node-sass": "^7.0.3",
      "normalize-scss": "^7.0.1",
      "querystring-es3": "^0.2.1",
      "react": "^16.13.1",
      "react-currency-format": "^1.1.0",
      "react-dom": "^16.13.1",
      "react-router-dom": "^5.2.0",
      "util": "^0.12.5"
    })
    utils.addDependencies(
      this,
      {
        "@babel/core": "^7.8.7",
        "@babel/plugin-transform-react-jsx": "^7.8.3",
        "@babel/polyfill": "^7.8.7",
        "@babel/preset-env": "^7.8.7",
        "@parcel/packager-raw-url": "^2.7.0",
        "@parcel/transformer-sass": "^2.7.0",
        "@parcel/transformer-svg-react": "^2.0.1",
        "@parcel/transformer-webmanifest": "^2.7.0"
      },
      true
    )

    utils.appendStubVarsToDotenv(
      this,
      'please provide your AEM host (e.g. http://localhost:4502)',
      [
        'REACT_APP_HOST_URI'
      ]
    )
    
    utils.appendStubVarsToDotenv(
      this,
      'please provide your AEM GraphQL endpoint (e.g. "/content/_cq_graphql/wknd-shared/endpoint.json")',
      [
        'REACT_APP_GRAPHQL_ENDPOINT'
      ]
    )

    utils.appendStubVarsToDotenv(
      this,
      'Authentication methods: choose one from "basic", "dev-token", "service-token" or leave blank to use no authentication',
      [
        'REACT_APP_AUTH_METHOD'
      ]
    )

    utils.appendStubVarsToDotenv(
      this,
      'For Basic auth, use AEM ["user","pass"] pair (e.g. for Local AEM Author instance)',
      [
        'REACT_APP_BASIC_AUTH_USER',
        'REACT_APP_BASIC_AUTH_PASS'
      ]
    )

    utils.appendStubVarsToDotenv(
      this,
      'For Bearer auth, use DEV token from Cloud console',
      [
        'REACT_APP_DEV_TOKEN'
      ]
    )

    utils.appendStubVarsToDotenv(
      this,
      'For Service toke auth, provide path to service token file downloaded from Cloud console (e.g. path/to/service-token.json)',
      [
        'REACT_APP_SERVICE_TOKEN'
      ]
    )
  }
}

module.exports = AemSpaGenerator
