import Filter from "../src/lib/Filter";
import { Item, FileType } from "../src/types/Filesystem";

describe("Filter", () => {
  test("should create an instance", () => {
    expect(new Filter()).toBeInstanceOf(Filter);
  });

  describe("matchDirs", () => {
    const folder: Item = {
      type: FileType.Directory,
      name: "foobar",
      fullPath: "/Users/foobar"
    } as Item;

    test("should add folder and match base", () => {
      const filter = new Filter();
      filter.matchDirs(["/Users/**"]);
      expect(filter.check(folder)).toBe(true);
    });

    test("should add folder and match name", () => {
      const filter = new Filter();
      filter.matchDirs(["**/foobar**"]);
      expect(filter.check(folder)).toBe(true);
    });

    test("should add folder and match partial name", () => {
      const filter = new Filter();
      filter.matchDirs(["**bar**"]);
      expect(filter.check(folder)).toBe(true);
    });
  });

  describe("matchFiles", () => {
    const file: Item = {
      type: FileType.File,
      name: "bar.js",
      extension: "js",
      fullPath: "/Users/foo/bar.js"
    } as Item;

    test("should add file and match all", () => {
      const filter = new Filter();
      filter.matchFiles(["*"]);
      expect(filter.check(file)).toBe(true);
    });

    test("should add folder and match exact name", () => {
      const filter = new Filter();
      filter.matchFiles(["bar.js"]);
      expect(filter.check(file)).toBe(true);
    });

    test("should add folder and match partial name", () => {
      const filter = new Filter();
      filter.matchFiles(["*.js"]);
      expect(filter.check(file)).toBe(true);
    });
  });

  describe("check", () => {
    const folder: Item = {
      type: FileType.Directory,
      name: "foobar",
      fullPath: "/Users/foobar"
    } as Item;

    test("should early exit if no filter", () => {
      const filter = new Filter();
      expect(filter.check(folder)).toBe(false);
    });

    test("should early exit if not supported filetype", () => {
      const filter = new Filter();
      expect(filter.check(({ type: "foobar" } as unknown) as Item)).toBe(false);
    });
  });
});
