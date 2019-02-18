# algolia-fs-indexer

## Installation

```
nvm use
```

```
yarn
```

```
brew install exiftool
```

## Dev

```
yarn start
```

```
yarn build
```

## Usage

```javascript
// Filesystem interface
const fs = new Filesystem();

// Explorer find file through Filesystem
const explorer = new Explorer('/Users/me/photos/', fs);

// Processor handle file found
const processor = new Processor();

// Indexer will send processed document to Algolia
AlgoliaClient = require('algoliasearch')('<appid>', '>apikey>');
const indexer = new Indexer('my-photos-index', AlgoliaClient);

// Events
explorer.on('item', (item: Item) => processor.push(item));
processor.on('document', (doc: Document) => indexer.push(doc));

// Filter at explorer level
explorer.filter(
  new Filter().matchFiles(['*.jpg', '*.tif', '*.png']).matchDirs(['myPhotos'])
);

// Optionnal specific extraction for .tif
processor.extract(
  new Images()
    .filter(new Filter().matchFiles(['*.tif']))
    .size()
    .keywords()
);

// Launch everything
await explorer.start();
```

## Todo

- [x] Recursive
- [x] Argv
- [x] Chunk indexing
- [x] Extractor prefiltering
- [x] Extractor child process
- [x] export type into separate files
- Geoloc correction
- [x] Faces position
- Full reindex (.tmp)
- MaxFiles
- MaxDepth
- [x] DryRun
- Inotify
- Unit test
- Publish npm
