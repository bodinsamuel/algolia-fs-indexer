#!/usr/bin/env node

import chalk from "chalk";
import clear from "clear";
import figlet from "figlet";
import commander from "commander";
import readline from "readline";
import Algolia from "algoliasearch";

import Explorer, { Document } from "./lib/Explorer";
import { Base, Images } from "./lib/extractors";
import Filesystem from "./lib/Filesystem";
import Indexer from "./lib/Indexer";

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

clear();
console.log(
  chalk.red(figlet.textSync("algolia-fs", { horizontalLayout: "full" }))
);

if (!APPID && !APIKEY) {
  DRYRUN = true;
}

(async () => {
  try {
    let AlgoliaClient;
    if (!DRYRUN) {
      AlgoliaClient = Algolia(APPID, APIKEY);
    }

    const base = "/Users/samuelbodin/Dropbox/scan/";
    const fs = new Filesystem();
    const indexer = new Indexer(INDEXNAME, AlgoliaClient);

    const explorer = new Explorer(base, fs, indexer);

    const stats: any = { found: 0, skipped: 0, indexed: 0, total: 0 };
    explorer.on("found", () => {
      stats.found += 1;
    });
    explorer.on("skipped", () => {
      stats.skipped += 1;
    });
    explorer.on("document", (doc: Document) => {
      indexer.push(doc);
      stats.total += 1;
      if (!stats[doc.type]) stats[doc.type] = 0;
      stats[doc.type] += 1;
    });

    // explorer.on("start", () => console.log("start..."));
    indexer.on("indexed", ({ count }) => (stats.indexed += count));
    explorer.on("end", () => {
      if (!DRYRUN) {
        indexer.indexAll();
      }
    });

    const interval = setInterval(() => {
      readline.cursorTo(process.stdout, 0, 7);
      if (DRYRUN) {
        console.log(chalk.greenBright("Doing a dry run..."));
      }

      console.log(chalk.gray("---------"));
      console.log("");
      console.log(
        `${chalk.cyan.bold("Total")} ${stats.total}`,
        chalk.gray(`[Found ${stats.found} - Skipped ${stats.skipped}]`)
      );
      console.log(` - ${chalk.blueBright("Directories")} ${stats.Dir || 0}`);
      console.log(` - ${chalk.blueBright("Files")} ${stats.File || 0}`);
      console.log("");

      if (!DRYRUN) {
        console.log(chalk.gray("---------"));
        console.log("");
        console.log(`${chalk.cyan.bold("Indexed")} ${stats.indexed}`);
      } else {
        console.log(indexer._items);
        clearInterval(interval);
      }
    }, 100);

    explorer
      .maxFiles(1000)
      .extract([
        new Base()
          .matchFiles(["*.jpg", "*.tif", "*.png"])
          .matchDirs(["*"])
          .extension()
          .filetype(),
        new Images()
          .matchFiles(["*.tif"])
          .size()
          .geoloc()
          .keywords()
          .camera()
          .region()
      ])
      .start();
  } catch (e) {
    if (e._explorer) {
      console.error(e.message);
      return;
    }
    throw e;
  }
})();
