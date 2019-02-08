import mm from "micromatch";

class Extractor {
  _patterns: string[];
  constructor() {
    this._patterns = [];
  }

  match(value: string[]) {
    this._patterns = value;
    return this;
  }

  run(file: any): object | null {
    if (!this._filter(file.name, this._patterns)) {
      return null;
    }

    return {};
  }

  _filter(name: string, patterns: string[]): boolean {
    if (patterns.length <= 0) {
      return true;
    }
    return mm.all(name, this._patterns);
  }
}

export default Extractor;
