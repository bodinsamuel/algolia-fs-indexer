import mm from "micromatch";
import { Item } from "./Filesystem";

class Extractor {
  name: string;
  _patterns: string[];

  constructor() {
    this.name = "";
    this._patterns = [];
  }

  match(value: string[]) {
    this._patterns = value;
    return this;
  }

  run(_file: Item): object | null {
    return null;
  }

  _filter(name: string): boolean {
    if (this._patterns.length <= 0) {
      return true;
    }
    return mm.any(name, this._patterns);
  }
}

export default Extractor;
