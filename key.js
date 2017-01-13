var hypercore = require('hypercore')
var hyperdrive = require('hyperdrive')
var memdb = require('memdb')
var discovery = require('hyperdiscovery')
var encoding = require('hyperdrive-encoding')

module.exports = driveOrCore

function driveOrCore (keyOrFeed, opts, cb) {
  if (typeof opts === 'function') return driveOrCore(keyOrFeed, {}, opts)
  if (keyOrFeed.content) return doneArchive(null, cb) // the easy one

  var key = keyOrFeed.key ? keyOrFeed.key : keyOrFeed
  var feed = keyOrFeed.key ? keyOrFeed : null
  var needsCreate = !feed

  if (!needsCreate) return checkFeed(cb)

  var swarm
  var db
  var core
  createFeed(function (err) {
    if (err) return cb(err)
    checkFeed(cb)
  })

  function checkFeed (cb) {
    feed.open(function (err) {
      if (err) return cb(err)
      feed.get(0, function (err, data) {
        if (err) return cb(err)
        var maybeContentKey = hasContentFeed(data)
        if (maybeContentKey) return doneArchive(null, cb, maybeContentKey)
        if (!feed.blocks) return doneFeed(null, cb) // TODO: not sure what this case is but think it'd only happen in hypercore feeds

        feed.get(feed.blocks - 1, function (err, data) {
          if (err) return cb(err)
          var maybeContentKey = hasContentFeed(data)
          if (maybeContentKey) return doneArchive(null, cb, maybeContentKey)
          return doneFeed(null, cb)
        })
      })
    })
  }

  function createFeed (cb) {
    db = opts.db || memdb()
    core = hypercore(db)
    feed = core.createFeed(key, {sparse: true})
    swarm = discovery(feed)
    cb(null)
  }

  function hasContentFeed (data) {
    try {
      var index = encoding.decode(data)
      if (index.type !== 'index') return false
      if (!index.content || index.content.length !== 32) return false
      return true
    } catch (e) {
      return false
    }
  }

  function createArchive (key) {
    var drive = hyperdrive(db)
    var archive = drive.createArchive(key, {
      sparse: true,
      metadata: feed,
      content: core.createFeed(key, {sparse: true})
    })
    return archive
  }

  function doneFeed (err, cb) {
    if (err) return cb(err)
    cb(null, feed, 'feed', swarm)
  }

  function doneArchive (err, cb, contentKey) {
    if (err) return cb(err)
    if (!needsCreate) return cb(null, feed, 'archive')
    var archive = createArchive(contentKey)
    cb(null, archive, 'archive', swarm)
  }
}
