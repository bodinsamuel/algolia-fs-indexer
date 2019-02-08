declare class Explorer {
    _base: string;
    _maxDepth?: number;
    _maxFiles?: number;
    _ignoreDirs: string[];
    _ignoreFiles: string[];
    constructor(base: string);
    maxDepth(value: number): this;
    maxFiles(value: number): this;
    ignoreDirs(value: string[]): this;
    ignoreFiles(value: string[]): this;
    run(): Promise<void>;
}
export default Explorer;
