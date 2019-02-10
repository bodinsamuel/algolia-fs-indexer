import Algolia from "algoliasearch";
import { Document } from "./explorer";
import { EventEmitter } from "events";

class Indexer extends EventEmitter {
  _algolia?: Algolia.Client;
  _index: string;
  _chunk: number;
  _items: Document[];

  constructor(index: string, algolia?: Algolia.Client) {
    super();

    this._algolia = algolia;
    this._index = index;

    this._chunk = 100;
    this._items = [];
  }

  chunk(value: number) {
    this._chunk = value;
    return this;
  }

  async indexChunk() {
    if (!this._algolia) {
      return;
    }

    const docs = this._items.splice(0, this._chunk);
    await this._algolia.batch(
      docs.map(
        (doc): Algolia.Action => {
          return {
            action: "addObject",
            indexName: this._index,
            body: doc as Object
          };
        }
      )
    );
    this.emit("indexed", { count: docs.length });
  }

  async indexAll(): Promise<Boolean> {
    while (this._items.length >= 0) {
      await this.indexChunk();
    }
    return true;
  }

  push(doc: Document) {
    this._items.push(doc);
  }
}

export default Indexer;
