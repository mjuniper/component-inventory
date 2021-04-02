# component-inventory

This is an attempt to generate a component inventory in our ember monorepo. It is pretty hacky and has some manual steps but I am fairly confident in it.

## steps

1. run ember-container.js in the running ember app and copy its output to component-names-input.json (note, you will need to use ember inspector to get a reference to any ember object as $E);
2. run index.js
3. see output in hub-component-inventory.csv