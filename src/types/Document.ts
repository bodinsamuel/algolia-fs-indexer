import { FileType } from "./Filesystem";

export interface Document {
  objectID: string;
  type: FileType;
  name: string;
  path: string;
  ext: string;
  filetype: string;
  [s: string]: any;
}
