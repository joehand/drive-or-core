var test = require('tape')

var hyperdrive = require('hyperdrive')
var hypercore = require('hypercore')
var memdb = require('memdb')
var raf = require('random-access-file')

var driveOrCore = require('.')

var db = memdb()
var core = hypercore(db)
var drive = hyperdrive(db)
var feed = core.createFeed()
var archive = drive.createArchive({
  file: function (name) {
    return raf(name, {writable: false})
  }
})

test('create things to test with', function (t) {
  feed.append('hello', function () {
    archive.append('test.js', function () {
      t.end()
    })
  })
})

test('feed - pass feed as arg', function (t) {
  driveOrCore(feed, function (err, type, key) {
    t.error(err)
    t.same(type, 'feed', 'type is feed')
    t.same(feed.key, key, 'returns same key')
    t.end()
  })
})

test('archive - pass archive as arg', function (t) {
  driveOrCore(archive, function (err, type, key) {
    t.error(err)
    t.same(type, 'archive', 'type is archive')
    t.same(archive.key, key, 'returns same key')
    t.end()
  })
})

test('archive - pass metadata feed only', function (t) {
  driveOrCore(archive.metadata, function (err, type, key) {
    t.error(err)
    t.same(type, 'archive', 'type is archive')
    t.same(archive.key, key, 'returns same key')
    t.same(archive.metadata.key, key, 'returns same key')
    t.end()
  })
})

test('archive - pass boths feeds, metadata first', function (t) {
  driveOrCore(archive.metadata, archive.content, function (err, type, key) {
    t.error(err)
    t.same(type, 'archive', 'type is archive')
    t.same(archive.key, key, 'returns same key')
    t.same(archive.metadata.key, key, 'returns same key')
    t.end()
  })
})

test('archive - pass boths feeds, content first', function (t) {
  driveOrCore(archive.content, archive.metadata, function (err, type, key) {
    t.error(err)
    t.same(type, 'archive', 'type is archive')
    t.same(archive.key, key, 'returns same key')
    t.same(archive.metadata.key, key, 'returns same key')
    t.end()
  })
})

test('archive - pass content feed only', function (t) {
  driveOrCore(archive.content, function (err, type, key) {
    // this is a type=feed because we don't know about metadata
    t.error(err)
    t.same(type, 'feed', 'type is feed')
    t.same(archive.content.key, key, 'returns same key')
    t.end()
  })
})

test.onFinish(function () {
  archive.close(function () {
    feed.close()
  })
})
