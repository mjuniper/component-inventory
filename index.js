#!/usr/bin/env node

var find = require('findit');
fs = require('fs');

// these are the components that the ember app knows about (ie from the DI container) - see ember-container.js
const componentNames = JSON.parse(fs.readFileSync('./component-names-input.json'));

const directoriesToSearch = [
  'activation-engine/addon/components',
  'community-engine/addon/components',
  'content-library-engine/addon/components',
  'ember-arcgis-hub-components/addon/components',
  'ember-arcgis-opendata-components/addon/components',
  'events-engine/addon/components',
  'feedback-engine/addon/components',
  'initiative-editor-engine/addon/components',
  'layout-editor-engine/addon/components',
  'opendata-ui/app/components',
  'overview-engine/addon/components',
  'solutions-engine/addon/components',
  'teams-engine/addon/components',
];

const BASE_PATH = '/Users/mich7501/Dev/opendata-ui/packages/';
var finder = find(BASE_PATH);

const results = [[ 'COMPONENT', 'PACKAGE', 'PATH', 'DESCRIPTION', 'GLIMMER/CLASSIC', 'ACCESSIBLE', 'HAS STORY', 'WHERE USED', 'DISPOSITION (deprecate, remove, glimmerify, stencilify, refactor, move...)' ]];

finder.on('path', function (path, stat) {
  // if (!path.includes('layout/toolbar-snackbar')) { return; }

  if (directoriesToSearch.some(d => path.includes(d))) {
    // console.log('\n===')
    // console.log('the file is in one of the specified directories');
    // console.log(path);

    const file = path
    .replace(BASE_PATH, '')
    .replace(/\.hbs|\.js|\.md/, '') // remove file extension
    .replace(/\/component$|\/index$|\/template$|\/readme$/, ''); // remove file name if it is generic (but not if it is the actual component name)

    const componentNameFromFile = file.split('/components/')[1];
    // console.log(`componentNameFromFile: ${componentNameFromFile}`);
    // find the component name by looking for the one we found in the file system in our known components array
    // we want this step because otherwise we will end up with directories that contain other components but that are not actual component names themselves
    // like item, search, pages
    const componentName = componentNames.find(c => c === componentNameFromFile);

    // read the file and see if it is glimmer or classic
    if (componentName) {
      let type = ''
      if (path.includes('.js')) {
        const fileContents = fs.readFileSync(path, 'utf8');
        if (fileContents.includes("from '@glimmer/component';")) {
          type = 'glimmer';
        } else if (fileContents.includes("from '@ember/component';")) {
          type = 'classic';
        }
      }

      const package = file.split('/')[0];
      const resultItem = results.find(result => result[0] === componentName && result[1] === package);

      if (!resultItem) {
        results.push([ componentName, file.split('/')[0], file, '', '', '', '', '', '' ])
      } else if (type) {
        // update the type
        resultItem[4] = type;
      }
    }
  }
});

finder.on('error', function (err) {
  console.log(err);
});

finder.on('end', function () {
    const stringOutput = results.map(line => line.join(', ')).sort().join('\n');

    fs.writeFileSync('./hub-component-inventory.csv', stringOutput);
    console.log(stringOutput);
    console.log(`Found ${results.length - 1} components`);

    fs.writeFileSync('component-names-output.json', JSON.stringify(results.filter((_, idx) => idx > 0).map(line => line[0])));
});
