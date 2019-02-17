import path from "path";
import fs, { Dirent } from "fs";
const fsPromises = fs.promises;

import ExplorerError from "./Error";
import { Item, FileType } from "../types/Filesystem";

class Filesystem {
  async stats(path: string): Promise<fs.Stats> {
    try {
      const lstat = await fsPromises.lstat(path);
      return lstat;
    } catch (e) {
      throw new ExplorerError(`path_does_not_exist: ${path}, ${e.message}`);
    }
  }

  async listDir(pathName: string): Promise<Item[]> {
    try {
      const readdir = await fsPromises.readdir(pathName, {
        // @ts-ignore
        withFileTypes: true
      });
      const promises: Promise<Item | void>[] = readdir.map(
        async (file: Dirent): Promise<Item | void> => {
          if (!file.isFile() && !file.isDirectory()) {
            return;
          }

          const fullPath = path.join(pathName, file.name);
          const stats = await this.stats(fullPath);
          return {
            id: String(stats.ino),
            name: file.name,
            type: file.isDirectory() ? FileType.Directory : FileType.File,
            fullPath: fullPath,
            extension: path.extname(file.name).substr(1),
            buffer: undefined, //file.isFile() && fs.readFileSync(fullPath),
            stats
          };
        }
      );

      const solved = await Promise.all(promises);
      return solved.filter((value: any) => Boolean(value)) as Item[];
    } catch (e) {
      throw e;
    }
  }
}

export default Filesystem;
