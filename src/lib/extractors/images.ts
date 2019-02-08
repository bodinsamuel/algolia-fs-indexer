import exifParser from "exif-parser";
import jpegExif from "jpeg-exif";

import Extractor from "../Extractor";
import { Item } from "../filesystem";

class Images extends Extractor {
  _size: boolean;
  _geoloc: boolean;

  constructor() {
    super();
    this.name = "image";

    this._size = false;
    this._geoloc = false;
  }

  run(file: Item): object | null {
    if (!this._filter(file.name)) {
      return null;
    }
    const image: any = {};
    let exif: any = { imageSize: {}, tags: {} };
    // exifParser.enableImageSize(true);
    try {
      console.log(jpegExif.fromBuffer(file.buffer));
      // piexifjs.l;
      // console.log("true", file.buffer.toString("binary"));
      // console.log(piexifjs.load(file.buffer.toString("binary"))["GPS"]);
      // throw new Error();
      exif = exifParser.create(file.buffer).parse();
    } catch (e) {
      console.log(e.message);
    }
    // console.log(exif);

    if (this._size) {
      image.width = exif.imageSize ? exif.imageSize.width : 0;
      image.height = exif.imageSize ? exif.imageSize.height : 0;
    }

    if (this._geoloc) {
      image.geoloc = exif.tags.GPSLatitude
        ? [exif.tags.GPSLatitude, exif.tags.GPSLongitude]
        : [];
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
}
export default Images;
