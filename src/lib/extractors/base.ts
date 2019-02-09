import Extractor from "../Extractor";
import { Item, FileType } from "../Filesystem";
import { getFileType } from "../helpers";

class Base extends Extractor {
  _filetype: boolean;
  _extension: boolean;

  constructor() {
    super();
    this.name = "base";
    this._filetype = false;
    this._extension = false;
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
    if (!this._filter(file)) {
      return null;
    }
    const base: any = {};

    if (this._extension) {
      base.ext = file.extension;
    }

    if (this._filetype) {
      base.filetype =
        file.type === FileType.File ? getFileType(file.extension) : "";
    }

    return base;
  }
}

export default Base;
