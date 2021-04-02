#!/usr/bin/env node

var find = require('findit');
fs = require('fs');

// these are the components that the ember app knows about (ie from the DI container) - see ember-container.js
const componentNames = JSON.parse(fs.readFileSync('./component-names-input.json'));

// directories in the monorepo in which to search for components
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

// the base path in which to search - ie the monorepo packages directory
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
    // see if the component we think we found is in our known components array
    // we want this step because otherwise we will end up with directories that contain other components but that are not actual component names themselves
    // like item, search, pages
    // i'm sure there are other ways of solving this...
    const componentName = componentNames.find(c => c === componentNameFromFile);

    if (componentName) {
      // read the file and see if it is glimmer or classic
      let type = ''
      if (path.includes('.js')) {
        const fileContents = fs.readFileSync(path, 'utf8');
        if (fileContents.includes("from '@glimmer/component';")) {
          type = 'glimmer';
        } else if (fileContents.includes("from '@ember/component';")) {
          type = 'classic';
        }
      }

      // get the package name from the file path
      const package = file.split('/')[0];

      // see if the item is already in our results array
      const resultItem = results.find(result => result[0] === componentName && result[1] === package);
      // this is because we will get multiple paths associated with each component, 1 or more of: directory, index.js, template.js, component-name.js, index.hbs, template.hbs, component-name.hbs, component-name.scss, readme, maybe test files, yada yada yada
      if (!resultItem) {
        // if not, add it
        results.push([ componentName, file.split('/')[0], file, '', '', '', '', '', '' ])
      } else if (type) {
        // if it is already in our results array but this time we have the type, update the type
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
