#!/usr/bin/env node

import chalk from "chalk";
import clear from "clear";
import figlet from "figlet";

import Explorer from "./lib/explorer";
import { Base } from "./lib/extractors";
import Filesystem from "./lib/filesystem";

(async () => {
  clear();
  console.log(
    chalk.red(figlet.textSync("algolia-fs", { horizontalLayout: "full" }))
  );

  try {
    const base = "/Users/samuelbodin/Dropbox/Photo/";
    const fs = new Filesystem();
    const explorer = await new Explorer(base, fs)
      .maxFiles(1000)
      .extract([
        new Base()
          .withFiles()
          .match(["*.jpg"])
          .extension()
          .filetype()
        // new Extractors.Images().faces()
      ])
      .explore();
    console.log(explorer.items);
  } catch (e) {
    if (e._explorer) {
      console.error(e.message);
      return;
    }
    throw e;
  }
})();
