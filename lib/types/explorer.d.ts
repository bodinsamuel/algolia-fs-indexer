export declare enum FileType {
    Folder = 0,
    Directory = 1
}
export interface Document {
    type: FileType;
    name: string;
}
