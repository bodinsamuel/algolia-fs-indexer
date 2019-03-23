#!/usr/bin/env node

// import path from 'path';
import chalk from 'chalk';
import clear from 'clear';
import figlet from 'figlet';
import commander from 'commander';
import Algolia from 'algoliasearch';

import Explorer from './lib/Explorer';
import Filesystem from './lib/Filesystem';
import Indexer from './lib/Indexer';
import Processor from './lib/Processor';

import { Item } from './types/Filesystem';
import { Document } from './types/Document';
import Filter from './lib/Filter';
import Terminal from './lib/Terminal';

// ************************************************ START
// let DIR = __dirname;
let DIR = '/Users/samuelbodin/code/crawler';
commander
  .version('0.0.1')
  .option('-d, --dryrun', 'Print exploration results without indexing', true)
  .option('-a, --app <id>', 'Use this Algolia App <id>')
  .option('-k, --key <string>', 'Use this Algolia Api <Key>')
  .option(
    '-i, --index <name>',
    'Use this Algolia Index <name> to store results',
    'fs-index'
  )
  .usage('[options] <dir>')
  .arguments('<dir>')
  .action(function(dir) {
    DIR = dir;
  })
  .parse(process.argv);

const APPID = process.env.APPID || commander.app;
const APIKEY = process.env.APIKEY || commander.key;
const INDEXNAME = process.env.INDEXNAME || commander.index;
let DRYRUN = commander.dryrun;

clear();
console.log(
  chalk.red(figlet.textSync('algolia-fs', { horizontalLayout: 'full' }))
);

if (!APPID && !APIKEY) {
  DRYRUN = true;
}

let AlgoliaClient;
if (!DRYRUN) {
  AlgoliaClient = Algolia(APPID, APIKEY);
}

(async () => {
  // Classes
  const fs = new Filesystem();
  const explorer = new Explorer(DIR, fs);
  const processor = new Processor(500);
  const indexer = new Indexer(INDEXNAME, AlgoliaClient);
  const terminal = new Terminal(DRYRUN, explorer, processor, indexer);
  try {
    // Events
    explorer.on('item', (item: Item) => {
      processor.push(item);
    });

    processor.on('document', (doc: Document) => {
      indexer.push(doc);
    });

    explorer.filter(new Filter().matchFiles(['*']).matchDirs(['*']));

    terminal.start();
    await explorer.start();
  } catch (e) {
    terminal.stop();
    console.error(e);
  }
})();
