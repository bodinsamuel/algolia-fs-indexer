import Algolia from "algoliasearch";
import { Document } from "./explorer";

class Indexer {
  _algolia: Algolia.Client;
  _chunk: number;
  _items: Document[];

  constructor(algolia: Algolia.Client) {
    this._algolia = algolia;

    this._chunk = 100;
    this._items = [];
  }

  chunk(value: number) {
    this._chunk = value;
    return this;
  }

  async index() {
    const docs = this._items.slice(0, this._chunk);
    await this._algolia.batch(
      docs.map(
        (doc): Algolia.Action => {
          return {
            action: "addObject",
            indexName: process.env.INDEX_NAME as string,
            body: doc as Object
          };
        }
      )
    );
  }

  push(...doc: Document[]) {
    this._items.push(...doc);
  }
}

export default Indexer;
