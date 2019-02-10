import { EventEmitter } from "events";

import Extractor from "./Extractor";

import { Item, FileType } from "../types/Filesystem";
import { Document } from "../types/Document";
import { getFileType } from "./helpers";

class Processor extends EventEmitter {
  _items: Item[];
  _processing: number;
  _concurrent: number;
  _extractors: Extractor[];

  constructor() {
    super();

    this._concurrent = 10;
    this._processing = 0;
    this._items = [];
    this._extractors = [];
  }

  get remaining(): number {
    return this._items.length;
  }

  get processing(): number {
    return this._processing;
  }

  get avail(): number {
    return this._concurrent - this._processing;
  }

  extract(value: Extractor): Processor {
    this._extractors.push(value);
    return this;
  }

  push(item: Item) {
    this._items.push(item);
    setTimeout(() => this.process(), 100);
  }

  async process() {
    const avail = this.avail;
    if (avail <= 0) {
      return;
    }

    const items = this._items.splice(0, avail);
    this._processing += items.length;
    items.forEach(async file => {
      const doc = await this.runExtractors(file);
      if (doc) {
        this.emit("document", doc);
      }
      this._processing -= 1;
      setTimeout(() => this.process(), 100);
    });
  }

  async runExtractors(file: Item): Promise<Document | null> {
    let doc: Document = {
      objectID: file.id,
      type: file.type,
      name: file.name,
      path: file.fullPath,
      ext: file.extension,
      filetype: file.type === FileType.File ? getFileType(file.extension) : ""
    };

    if (this._extractors.length > 0) {
      for (let index = 0; index < this._extractors.length; index++) {
        const extractor = this._extractors[index];
        doc = {
          ...doc,
          ...(await this.runExtractor(doc, extractor, file))
        };

        if (index === 0 && !(extractor.name in doc)) {
          return null;
        }
      }
    }

    return doc;
  }

  async runExtractor(
    _doc: Document,
    extractor: Extractor,
    file: Item
  ): Promise<object> {
    const extra = await extractor.run(file);
    if (!extra) {
      return {};
    }

    return {
      [extractor.name]: extra
    };
  }
}

export default Processor;
