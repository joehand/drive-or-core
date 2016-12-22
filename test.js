var test = require('tape')

// var hyperdrive = require('hyperdrive')
var hypercore = require('hypercore')
var memdb = require('memdb')
var discovery = require('hyperdiscovery')

var driveOrCore = require('.')

var db = memdb()
var core = hypercore(db)
var swarmF
var testFeed

// var drive = hyperdrive(db)
// var swarmA
// var testArchive
// testArchive = drive.createArchive()
// swarmA = discovery(testArchive)

test('create things to test with', function (t) {
  testFeed = core.createFeed()
  swarmF = discovery(testFeed)
  testFeed.append('hello', function () {
    t.end()
  })
})

test('feed - pass feed', function (t) {
  driveOrCore(testFeed, function (err, feed, type) {
    t.error(err)
    t.same(feed.key, testFeed.key, 'returns same feed')
    t.same(type, 'feed', 'type is feed')
    t.end()
  })
})

test('feed - pass key', function (t) {
  driveOrCore(testFeed.key, function (err, feed, type, swarmToo) {
    t.error(err)
    t.same(feed.key, testFeed.key, 'returns same feed')
    t.same(type, 'feed', 'type is feed')
    swarmToo.close(function () {
      t.end()
    })
  })
})

test.onFinish(function () {
  swarmF.close(function () {
    testFeed.close()
  })
})
