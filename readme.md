# drive-or-core

[![Travis](https://img.shields.io/travis/joehand/drive-or-core.svg?branch=master&style=flat-square)](https://travis-ci.org/joehand/drive-or-core) [![npm](https://img.shields.io/npm/v/drive-or-core.svg?style=flat-square)](https://npmjs.org/package/drive-or-core)

I'm trying to figure out if something is a hyperdrive archive or hypercore feed. Maybe you are too?

## Usage

Checking a single feed for what type it is:

```js
var driveOrCore = require('drive-or-core')

var feed = core.createFeed('<some-key>')

driveOrCore(feed, function (err, type) {
  console.log(type) // prints `feed` or `archive`
})
```

Trying to figure out which of two feeds is metadata (vs content):

```js
var driveOrCore = require('drive-or-core')

var feed1 = core.createFeed('<some-key>')
var feed2 = core.createFeed('<some-other-key>')

driveOrCore(feed1, feed2, function (err, type, key) {
  console.log(type) // prints `archive` (as long as 1 feed is metadata)
  console.log(key.toString('hex')) // key of the archive (and metadata key)

  if (feed1.key === key) {
    archive = drive.createArchive({
      metadata: feed1,
      content: feed2
    })
  } else {
    archive = drive.createArchive({
      metadata: feed2,
      content: feed1
    })
  }
})
```

## API

### `driveOrCore(feed, [feed2], cb)`

Callback returns with `cb(err, 'archive|feed', key)` where `key` is the feed key or archive key.

See `test.js` for all the use cases!

## TODO

Sometimes it's more helpful to pass a just key rather than a feed. But that requires making a database and connecting to a swarm (making this module much larger and opinionated). For now you can see how that works in `key.js` but more use cases will be helpful in how to implement that.

## License

MIT