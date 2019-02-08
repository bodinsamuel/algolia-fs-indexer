import { Document } from "./../types/explorer";
export declare class ExplorerError extends Error {
    _explorer: boolean;
    constructor(message: string);
}
declare class Explorer {
    _base: string;
    _maxDepth?: number;
    _maxFiles?: number;
    _ignoreDirs: string[];
    _ignoreFiles: string[];
    _items: Document[];
    constructor(base: string);
    readonly items: Document[];
    maxDepth(value: number): this;
    maxFiles(value: number): this;
    ignoreDirs(value: string[]): this;
    ignoreFiles(value: string[]): this;
    run(): Promise<this>;
}
export default Explorer;
