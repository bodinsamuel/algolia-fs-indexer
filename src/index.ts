#!/usr/bin/env node

import chalk from "chalk";
import clear from "clear";
import figlet from "figlet";
import Algolia from "algoliasearch";

import Explorer from "./lib/Explorer";
import { Base, Images } from "./lib/extractors";
import Filesystem from "./lib/Filesystem";
import Indexer from "./lib/Indexer";

(async () => {
  clear();
  console.log(
    chalk.red(figlet.textSync("algolia-fs", { horizontalLayout: "full" }))
  );

  try {
    const AlgoliaClient = Algolia("KECOEVPMGH", process.env.APIKEY as string);

    const base = "/Users/samuelbodin/Dropbox/scan/A001";
    const fs = new Filesystem();
    const indexer = new Indexer(AlgoliaClient);

    await new Explorer(base, fs, indexer)
      .maxFiles(1000)
      .extract([
        new Base()
          .withFiles()
          .match(["*.jpg", "*.tif"])
          .extension()
          .filetype(),
        new Images()
          .size()
          .geoloc()
          .keywords()
          .camera()
      ])
      .explore();

    // console.log(indexer._items);
    // indexer.index();
  } catch (e) {
    if (e._explorer) {
      console.error(e.message);
      return;
    }
    throw e;
  }
})();
