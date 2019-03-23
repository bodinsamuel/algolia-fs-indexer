import readline from "readline";
import chalk from "chalk";
import Explorer from "./Explorer";
import Processor from "./Processor";
import Indexer from "./Indexer";
import { Item } from "../types/Filesystem";

export interface Stats {
  found: number;
  skipped: number;
  todo: { total: number; Dir: number; File: number };
  processed: number;
  indexed: number;
}

class Terminal {
  private stats: Stats = {
    found: 0,
    skipped: 0,
    todo: { total: 0, Dir: 0, File: 0 },
    processed: 0,
    indexed: 0
  };
  private interval: any;
  private dryrun: boolean;
  private explorer: Explorer;
  private processor: Processor;
  private indexer: Indexer;

  constructor(
    dryrun: boolean,
    explorer: Explorer,
    processor: Processor,
    indexer: Indexer
  ) {
    this.dryrun = dryrun;
    this.explorer = explorer;
    this.processor = processor;
    this.indexer = indexer;

    explorer.on("read", count => {
      this.stats.found += count;
    });
    explorer.on("skipped", () => {
      this.stats.skipped += 1;
    });
    explorer.on("item", (item: Item) => {
      this.stats.todo.total += 1;
      this.stats.todo[item.type] += 1;
    });
    processor.on("document", () => {
      this.stats.processed += 1;
    });
    indexer.on("indexed", ({ count }) => {
      this.stats.indexed += count;
    });
  }

  start(): void {
    this.draw();
    this.interval = setInterval(() => this.draw(), 100);
  }

  stop(): void {
    if (this.interval) clearInterval(this.interval);
  }

  // Terminal output
  draw(): void {
    const stats = this.stats;

    readline.cursorTo(process.stdout, 0, 6);
    readline.clearScreenDown(process.stdout);
    if (this.dryrun) {
      console.log(chalk.greenBright("Doing a dry run..."));
    }

    console.log(chalk.gray("---------"));
    console.log(chalk.gray(`Read ${stats.found} - Skipped ${stats.skipped}`));
    console.log(chalk.gray("---------"));

    console.log(`${chalk.cyan.bold("Found")} ${stats.todo.total}`);
    console.log(` - ${chalk.blueBright("Directories")} ${stats.todo.Dir || 0}`);
    console.log(` - ${chalk.blueBright("Files")} ${stats.todo.File || 0}`);

    console.log(chalk.gray("---------"));
    console.log(
      `${chalk.cyan.bold("Processing")} ${this.processor._processing}`
    );
    console.log(`${chalk.cyan.bold("Done")} ${stats.processed}`);

    if (!this.dryrun) {
      console.log(chalk.gray("---------"));
      console.log("");
      console.log(`${chalk.cyan.bold("Indexed")} ${stats.indexed}`);
    }

    if (
      this.explorer.end &&
      this.processor.remaining === 0 &&
      this.processor.processing === 0 &&
      (this.indexer.remaining === 0 || this.dryrun)
    ) {
      console.log(chalk.gray("---------"));
      console.log(chalk.greenBright("Done"));
      console.log(this.indexer._items);
      this.stop();
    }
  }
}

export default Terminal;
