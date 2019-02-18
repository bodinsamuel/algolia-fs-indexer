import mm from 'micromatch';
import { Item, FileType } from '../types/Filesystem';

class Filter {
  _dirs: string[];
  _files: string[];

  constructor() {
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

  check(file: Item): boolean {
    if (
      (this._dirs.length <= 0 && file.type === FileType.Directory) ||
      (this._files.length <= 0 && file.type === FileType.File)
    ) {
      return false;
    }

    if (file.type === FileType.File) {
      return mm.any(file.name, this._files, { dot: true });
    } else if (file.type === FileType.Directory) {
      return mm.any(file.name, this._dirs);
    }

    return true;
  }
}

export default Filter;
