import Extractor from "../Extractor";
import { Item, FileType } from "../Filesystem";
import { getFileType } from "../helpers";

class Base extends Extractor {
  _dirs: boolean;
  _files: boolean;
  _filetype: boolean;
  _extension: boolean;

  constructor() {
    super();
    this.name = "base";
    this._dirs = false;
    this._files = false;
    this._filetype = false;
    this._extension = false;
  }

  withDirs() {
    this._dirs = true;
    return this;
  }

  withFiles() {
    this._files = true;
    return this;
  }

  filetype() {
    this._filetype = true;
    return this;
  }

  extension() {
    this._extension = true;
    return this;
  }

  run(file: Item): object | null {
    if (
      (!this._dirs && file.type === FileType.Directory) ||
      (!this._files && file.type === FileType.File)
    ) {
      return null;
    }

    if (!this._filter(file.name)) {
      return null;
    }
    const base: any = {};

    if (this._extension) {
      base.ext = file.extension;
    }

    if (this._filetype) {
      base.filetype = getFileType(file.extension);
    }

    return base;
  }
}

export default Base;
