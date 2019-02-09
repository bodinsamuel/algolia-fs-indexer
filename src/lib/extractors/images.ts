// import im from "imagemagick";
// import util from "util";

import Extractor from "../Extractor";
import { Item } from "../filesystem";
// import ExplorerError from "../Error";

class Images extends Extractor {
  _size: boolean;
  _geoloc: boolean;
  _keywords: boolean;
  _camera: boolean;

  constructor() {
    super();
    this.name = "image";

    this._size = false;
    this._geoloc = false;
    this._keywords = false;
    this._camera = false;
  }

  identify(path: string) {
    const spawn = require("child_process").spawnSync;
    const { stdout, stderr } = spawn("exiftool", ["-j", path]);
    if (stderr.toString()) {
      console.log("err", stderr.toString());
      return [{}];
    }
    return JSON.parse(Buffer.from(stdout).toString());
  }

  run(file: Item): object | null {
    if (!this._filter(file.name)) {
      return null;
    }

    const image: any = {};
    let id: any = this.identify(file.path)[0];

    image.dateCreated = id.DateTimeOriginal || id.CreateDate;

    if (this._size) {
      image.width = id.ImageWidth || 0;
      image.height = id.ImageHeight || 0;
    }

    if (this._geoloc) {
      image.country = id.Country || "";
      image.city = id.City || "";

      image.geoloc = id.GPSLatitude ? [id.GPSLatitude, id.GPSLongitude] : [];
    }

    if (this._keywords) {
      image.keywords = id.Keywords || [];
    }

    if (this._camera) {
      image.model = id.Model || "";
      image.iso = id.ISO || "";
      image.aperture = id.Aperture || "";
      image.focal = id.FocalLengthIn35mmFormat || "";
    }

    return image;
  }

  size() {
    this._size = true;
    return this;
  }

  geoloc() {
    this._geoloc = true;
    return this;
  }

  keywords() {
    this._keywords = true;
    return this;
  }

  camera() {
    this._camera = true;
    return this;
  }
}
export default Images;
