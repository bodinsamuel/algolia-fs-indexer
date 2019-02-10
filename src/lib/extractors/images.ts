// import im from "imagemagick";
// import util from "util";

import Extractor from "../Extractor";
import { Item } from "../../types/Filesystem";

class Images extends Extractor {
  _size: boolean;
  _geoloc: boolean;
  _keywords: boolean;
  _camera: boolean;
  _region: boolean;

  constructor() {
    super();
    this.name = "image";

    this._size = false;
    this._geoloc = false;
    this._keywords = false;
    this._camera = false;
    this._region = false;
  }

  async identify(path: string): Promise<object[]> {
    return new Promise(resolve => {
      const spawn = require("child_process").spawn;
      const exec = spawn("exiftool", ["-j", path]);
      exec.stdout.on("data", (data: any) => {
        resolve(JSON.parse(Buffer.from(data).toString()));
      });

      exec.stderr.on("data", (data: any) => {
        console.log("err", path, data.toString());
        return resolve([{}]);
      });
    });
  }

  async process(file: Item): Promise<object | null> {
    const image: any = {};
    let id: any = (await this.identify(file.fullPath))[0];

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

    if (this._region) {
      image.regionName = id.RegionName || [];
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

  region() {
    this._region = true;
    return this;
  }
}
export default Images;
