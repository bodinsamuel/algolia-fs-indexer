import { Item } from '../types/Filesystem';
import Filter from './Filter';

class Extractor {
  name: string;
  _filter?: Filter;

  constructor() {
    this.name = '';
  }

  async run(file: Item): Promise<any> {
    if (!this._filter || !this._filter.check(file)) {
      return null;
    }

    return this.process(file);
  }

  async process(_file: Item): Promise<object | null> {
    return {};
  }

  filter(filter: Filter) {
    this._filter = filter;
    return this;
  }
}

export default Extractor;
