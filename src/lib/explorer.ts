import Extractor from "./extractor";
import ExplorerError from "./error";
import Filesystem, { FileType, Item } from "./filesystem";

export interface Document {
  type: FileType;
  name: string;
  [s: string]: any;
}

class Explorer {
  _base: string;
  _maxDepth?: number;
  _maxFiles?: number;
  _items: Document[];
  _extractors: Extractor[];
  _fs: Filesystem;

  constructor(base: string, fs: Filesystem) {
    this._base = base;
    this._fs = fs;

    this._items = [];
    this._extractors = [];
  }

  get items(): Document[] {
    return this._items;
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

  runExtraction(file: Item): Document | null {
    let doc: Document = {
      type: file.type,
      name: file.name
    };
    if (this._extractors.length > 0) {
      // const read = this._fs.readFile(file.path);
      const extra = this._extractors[0].run(file);
      if (!extra) {
        return null;
      }
      doc = {
        ...doc,
        ...extra
      };
    }

    return doc;
  }

  async explore(): Promise<Explorer> {
    console.log("running");
    this.checkBase();

    const files = await this._fs.listDir(this._base);
    const parsed = files
      .map(file => this.runExtraction(file))
      .filter(doc => Boolean(doc)) as Document[];

    // const extracted = parsed.map((doc): Document | null => {

    // })
    this._items.push(...parsed);

    return this;
  }
}

export default Explorer;
