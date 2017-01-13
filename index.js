var encoding = require('hyperdrive-encoding')

module.exports = driveOrCore

function driveOrCore (feed1, feed2, cb) {
  if (typeof feed2 === 'function') return driveOrCore(feed1, null, feed2)
  if (feed1.content) return cb(null, 'archive', feed1.key) // easy one!

  checkFeed(feed1, function (err, type) {
    if (err) return cb(err)
    if (!feed2 || type === 'archive') return cb(null, type, feed1.key)
    checkFeed(feed2, function (err, type) {
      if (err) return cb(err)
      cb(null, type, feed2.key)
    })
  })

  function checkFeed (feed, cb) {
    feed.open(function (err) {
      if (err) return cb(err)
      feed.get(0, function (err, data) {
        if (err) return cb(err)
        var maybeContentKey = hasContentFeed(data)
        if (maybeContentKey) return doneArchive()
        if (!feed.blocks) return doneFeed() // TODO: not sure what this case is but think it'd only happen in hypercore feeds

        feed.get(feed.blocks - 1, function (err, data) {
          if (err) return cb(err)
          var maybeContentKey = hasContentFeed(data)
          if (maybeContentKey) return doneArchive()
          return doneFeed()
        })
      })
    })

    function doneFeed (err) {
      if (err) return cb(err)
      cb(null, 'feed')
    }

    function doneArchive (err) {
      if (err) return cb(err)
      cb(null, 'archive')
    }
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
}
