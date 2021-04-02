#!/usr/bin/env node

// used to compare two lists of components

// one is filtered by looking them up in our known list of components that we generated from the di container in the ember app
// two skips that filter step

fs = require('fs');

const one = JSON.parse(fs.readFileSync('one.json', 'utf-8'));
const two = JSON.parse(fs.readFileSync('two.json', 'utf-8'));

const results = [];

two
// .map(c => c.split('/components/')[1])
.forEach(c => {
  if (!one.includes(c)) {
    results.push(c);
  }
});

console.log('components in two but not one:');
results.forEach(x => console.log(x));