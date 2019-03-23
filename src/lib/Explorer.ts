import { EventEmitter } from 'events';

import ExplorerError from './Error';
import Filesystem from './Filesystem';
import { FileType } from '../types/Filesystem';
import Filter from './Filter';

class Explorer extends EventEmitter {
  _base: string;
  _maxDepth?: number;
  _maxFiles?: number;
  _fs: Filesystem;
  _filter?: Filter;
  end: boolean;

  constructor(base: string, fs: Filesystem) {
    super();
    this._base = base;
    this._fs = fs;
    this.end = false;
  }

  maxDepth(value: number): Explorer {
    this._maxDepth = value;
    return this;
  }

  maxFiles(value: number): Explorer {
    this._maxFiles = value;
    return this;
  }

  filter(filter: Filter) {
    this._filter = filter;
    return this;
  }

  async checkBase(): Promise<void> {
    const lstat = await this._fs.stats(this._base);
    if (!lstat.isDirectory()) {
      throw new ExplorerError('base_is_not_a_directory');
    }
  }

  async start(): Promise<Explorer> {
    await this.checkBase();

    this.emit('start');
    this.end = false;

    await this.explore(this._base);

    this.end = true;
    this.emit('end');

    return this;
  }

  async explore(dirPath: string): Promise<Explorer> {
    const files = await this._fs.listDir(dirPath);

    this.emit('read', files.length);
    const p = files.map(
      async (file): Promise<any> => {
        if (!this._filter || !this._filter.check(file)) {
          this.emit('skipped');
          return;
        }

        file.pathFromBase = file.fullPath.replace(this._base, '');
        this.emit('item', file);

        if (file.type !== FileType.Directory) {
          return;
        }
        // console.log(file.fullPath);
        return this.explore(file.fullPath);
      }
    );
    await Promise.all(p);

    return this;
  }
}

export default Explorer;
