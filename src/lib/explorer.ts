import Extractor from "./Extractor";
import ExplorerError from "./Error";
import Filesystem, { FileType, Item } from "./Filesystem";
import Indexer from "./Indexer";

export interface Document {
  objectID: string;
  type: FileType;
  name: string;
  [s: string]: any;
}

class Explorer {
  _base: string;
  _maxDepth?: number;
  _maxFiles?: number;
  _extractors: Extractor[];
  _fs: Filesystem;
  _indexer: Indexer;

  constructor(base: string, fs: Filesystem, indexer: Indexer) {
    this._base = base;
    this._fs = fs;
    this._indexer = indexer;

    this._extractors = [];
  }

  maxDepth(value: number): Explorer {
    this._maxDepth = value;
    return this;
  }

  maxFiles(value: number): Explorer {
    this._maxFiles = value;
    return this;
  }

  extract(value: Extractor[]): Explorer {
    this._extractors = value;
    return this;
  }

  async checkBase(): Promise<void> {
    const lstat = await this._fs.stats(this._base);
    if (!lstat.isDirectory()) {
      throw new ExplorerError("base_is_not_a_directory");
    }
  }

  runExtractors(file: Item): Document | null {
    let doc: Document = {
      objectID: file.id,
      type: file.type,
      name: file.name
    };

    if (this._extractors.length > 0) {
      for (let index = 0; index < this._extractors.length; index++) {
        const extractor = this._extractors[index];
        doc = {
          ...doc,
          ...this.runExtractor(doc, extractor, file)
        };

        if (index === 0 && !(extractor.name in doc)) {
          return null;
        }
      }
    }

    return doc;
  }

  runExtractor(_doc: Document, extractor: Extractor, file: Item): object {
    const extra = extractor.run(file);
    if (!extra) {
      return {};
    }

    return {
      [extractor.name]: extra
    };
  }

  async explore(): Promise<Explorer> {
    console.log("running");
    this.checkBase();

    const files = await this._fs.listDir(this._base);
    const parsed = files
      .map(file => this.runExtractors(file))
      .filter(doc => Boolean(doc)) as Document[];

    this._indexer.push(...parsed);

    return this;
  }
}

export default Explorer;
