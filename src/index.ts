#!/usr/bin/env node

import chalk from "chalk";
import clear from "clear";
import figlet from "figlet";
import commander from "commander";
import readline from "readline";
import Algolia from "algoliasearch";

import Explorer from "./lib/Explorer";
import { Images } from "./lib/extractors";
import Filesystem from "./lib/Filesystem";
import Indexer from "./lib/Indexer";
import Processor from "./lib/Processor";

import { Item } from "./types/Filesystem";
import { Document } from "./types/Document";
import Filter from "./lib/Filter";

// ************************************************ START
commander
  .version("0.0.1")
  .option("-d, --dryrun", "Print exploration results without indexing", true)
  .option("-a, --app <id>", "Use this Algolia App <id>")
  .option("-k, --key <string>", "Use this Algolia Api <Key>")
  .option(
    "-i, --index <name>",
    "Use this Algolia Index <name> to store results",
    "fs-index"
  )
  .parse(process.argv);

const APPID = process.env.APPID || commander.app;
const APIKEY = process.env.APIKEY || commander.key;
const INDEXNAME = process.env.INDEXNAME || commander.index;
let DRYRUN = commander.dryrun;
const base = "/Users/samuelbodin/Dropbox/scan/";

clear();
console.log(
  chalk.red(figlet.textSync("algolia-fs", { horizontalLayout: "full" }))
);

if (!APPID && !APIKEY) {
  DRYRUN = true;
}

try {
  let AlgoliaClient;
  if (!DRYRUN) {
    AlgoliaClient = Algolia(APPID, APIKEY);
  }

  let interval: any;
  const stats: any = {
    found: 0,
    skipped: 0,
    todo: { total: 0, Dir: 0, File: 0 },
    processed: 0,
    indexed: 0
  };

  // Classes
  const fs = new Filesystem();
  const explorer = new Explorer(base, fs);
  const indexer = new Indexer(INDEXNAME, AlgoliaClient);
  const processor = new Processor();

  explorer.filter(
    new Filter().matchFiles(["*.jpg", "*.tif", "*.png"]).matchDirs(["*01*"])
  );

  processor.extract(
    new Images()
      .filter(new Filter().matchFiles(["*.tif"]))
      .size()
      .geoloc()
      .keywords()
      .camera()
      .region()
  );

  // Events
  explorer.on("read", count => {
    stats.found += count;
  });
  explorer.on("skipped", () => {
    stats.skipped += 1;
  });
  explorer.on("item", (item: Item) => {
    processor.push(item);
    stats.todo.total += 1;
    stats.todo[item.type] += 1;
  });

  processor.on("document", (doc: Document) => {
    stats.processed += 1;
    indexer.push(doc);
  });

  indexer.on("indexed", ({ count }) => (stats.indexed += count));

  // Terminal output
  const draw = () => {
    readline.cursorTo(process.stdout, 0, 7);
    readline.clearScreenDown(process.stdout);
    if (DRYRUN) {
      console.log(chalk.greenBright("Doing a dry run..."));
    }

    console.log(chalk.gray("---------"));
    console.log(chalk.gray(`Read ${stats.found} - Skipped ${stats.skipped}`));
    console.log(chalk.gray("---------"));

    console.log(`${chalk.cyan.bold("Found")} ${stats.todo.total}`);
    console.log(` - ${chalk.blueBright("Directories")} ${stats.todo.Dir || 0}`);
    console.log(` - ${chalk.blueBright("Files")} ${stats.todo.File || 0}`);

    console.log(chalk.gray("---------"));
    console.log(`${chalk.cyan.bold("Processing")} ${processor._processing}`);
    console.log(`${chalk.cyan.bold("Done")} ${stats.processed}`);

    if (!DRYRUN) {
      console.log(chalk.gray("---------"));
      console.log("");
      console.log(`${chalk.cyan.bold("Indexed")} ${stats.indexed}`);
    }
    if (
      explorer.end &&
      processor.remaining === 0 &&
      processor.processing === 0 &&
      (indexer.remaining === 0 || DRYRUN)
    ) {
      console.log(chalk.gray("---------"));
      console.log(chalk.greenBright("Done"));
      clearInterval(interval);
    }
  };

  // Just let node.js do an initial output
  setTimeout(() => {
    draw();
    interval = setInterval(draw, 100);
    explorer.start();
  }, 0);
} catch (e) {
  if (e._explorer) {
    console.error(e.message);
  } else {
    throw e;
  }
}
