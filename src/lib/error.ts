export default class ExplorerError extends Error {
  _explorer: boolean;
  constructor(message: string) {
    super(message);
    this._explorer = true;
  }
}
