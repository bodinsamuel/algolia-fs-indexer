import mm from "micromatch";
import { Item, FileType } from "./Filesystem";

class Extractor {
  name: string;
  _dirs: string[];
  _files: string[];

  constructor() {
    this.name = "";

    this._dirs = [];
    this._files = [];
  }

  matchDirs(match: string[]) {
    this._dirs = match;
    return this;
  }

  matchFiles(match: string[]) {
    this._files = match;
    return this;
  }

  run(_file: Item): object | null {
    return null;
  }

  _filter(file: Item): boolean {
    if (
      (this._dirs.length <= 0 && file.type === FileType.Directory) ||
      (this._files.length <= 0 && file.type === FileType.File)
    ) {
      return false;
    }

    if (file.type === FileType.File) {
      return mm.any(file.name, this._files);
    } else if (file.type === FileType.Directory) {
      return mm.any(file.name, this._dirs);
    }
    return true;
  }
}

export default Extractor;
