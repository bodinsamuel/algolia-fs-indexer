import mm from "micromatch";
import { Item, FileType } from "../types/Filesystem";

class Filter {
  private dirs: string[];
  private files: string[];

  constructor() {
    this.dirs = [];
    this.files = [];
  }

  matchDirs(match: string[]) {
    this.dirs = match;
    return this;
  }

  matchFiles(match: string[]) {
    this.files = match;
    return this;
  }

  check(file: Item): boolean {
    if (
      (this.dirs.length <= 0 && file.type === FileType.Directory) ||
      (this.files.length <= 0 && file.type === FileType.File)
    ) {
      return false;
    }

    if (file.type === FileType.File) {
      return mm.any(file.name, this.files);
    } else if (file.type === FileType.Directory) {
      return mm.any(file.fullPath, this.dirs, { matchBase: true });
    }

    return false;
  }
}

export default Filter;
