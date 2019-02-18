import imageExtension from 'image-extensions';
import videoExtension from 'video-extensions';

function isImage(ext: string): boolean {
  return imageExtension.indexOf(ext) >= 0;
}

function isVideo(ext: string): boolean {
  return videoExtension.indexOf(ext) >= 0;
}

function getFileType(ext: string): string {
  if (isImage(ext)) return 'image';
  if (isVideo(ext)) return 'video';
  return 'other';
}

export { getFileType, isVideo, isImage };
