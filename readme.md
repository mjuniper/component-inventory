# component-inventory

This is an attempt to generate a component inventory in our ember monorepo. It is pretty hacky and has some manual steps but I am fairly confident in it.

## steps

1. run `ember-container.js` in the console of the running ember app and copy its output to `component-names-input.json` (note, you will need to use ember inspector to get a reference to any ember object as `$E`);
1. in index.js, update `BASE_PATH` to point to the monorepo `packages` directory
1. run `index.js`
1. see output in `hub-component-inventory.csv`