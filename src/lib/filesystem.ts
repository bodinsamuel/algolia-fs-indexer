import fs, { Dirent } from "fs";
const fsPromises = fs.promises;

import ExplorerError from "./error";

export interface Stats extends fs.Stats {}

export enum FileType {
  Directory = "Dir",
  File = "File"
}

export interface Item {
  type: FileType;
  name: string;
  path: string;
}

class Filesystem {
  async stats(path: string): Promise<Stats> {
    try {
      const lstat = await fsPromises.lstat(path);
      return lstat;
    } catch (e) {
      throw new ExplorerError("dir_does_not_exist");
    }
  }

  async listDir(path: string): Promise<Item[]> {
    try {
      // @ts-ignore-line
      const readdir = await fsPromises.readdir(path, { withFileTypes: true });
      return readdir
        .map(
          (file: Dirent): Item | null => {
            if (!file.isFile() && !file.isDirectory()) {
              return null;
            }

            return {
              name: file.name,
              type: file.isDirectory() ? FileType.Directory : FileType.File,
              path: `${path}/${file.name}`
            };
          }
        )
        .filter((value: any) => Boolean(value));
    } catch (e) {
      throw e;
    }
  }

  // readFile(path: string): Promise<string> {
  //   return path;
  // }
}

export default Filesystem;
