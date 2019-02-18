import fs from 'fs';

export enum FileType {
  Directory = 'Dir',
  File = 'File',
}

export interface Item {
  id: string;
  type: FileType;
  name: string;
  fullPath: string;
  extension: string;
  stats: fs.Stats;
  pathFromBase?: string;
  buffer?: fs.BinaryData;
}
