'use-strict'
const util = require('util')
const cluster = require('cluster')
const fs = require('fs-extra')

if (!fs.existsSync('./Config.js')) {
  fs.copySync('./Config.example.js', './Config.js')
}

const Server = require('./lib/Server.js')
const RequestHandler = require('./lib/RequestHandler.js')
const NullCache = require('./lib/Cache/NullCache.js')
const FsCache = require('./lib/Cache/FsCache.js')
const MemCache = require('./lib/Cache/MemCache.js')

const log = require('./lib/LogHandler.js')
let config = require('./Config.js')

process.argv.forEach((val, index) => {
  switch (val) {
    case 'config':
      log.info('Loading config from command line!')
      log.info(process.argv[index + 1])
      config = JSON.parse(process.argv[index + 1])
      break
  }
})

if (process.env.NODE_ENV === 'development') {
  config.DevMode = true
}

if (config.DevMode) {
  config.HeaderExpires = 0
  config.ClearCacheOnStart = true
}

if (!fs.existsSync(config.post.DirectoryPosts)) {
  log.info('Posts-Directory is non-existing! creating new empty directory')

  try {
    fs.mkdirSync(config.post.DirectoryPosts)
  } catch (error) {
    log.error("Posts-Directory couldn't be created, see following error", error)
    process.exit(1)
  }
}

const server = new Server()

// TODO move cache from each worker to master
let cache = new NullCache()
switch (config.Cache) {
  case 'FsCache':
    if (cluster.isMaster) {
      log.info('using FsCache module for caching')
    }
    cache = new FsCache()
    break
  case 'MemCache':
    if (cluster.isMaster) {
      log.info('using MemCache module for caching')
    }
    cache = new MemCache()
    break
  default:
    if (cluster.isMaster) {
      log.info('using no cache')
    }
    break
}

const requestHandler = new RequestHandler(server)
/** @type {object[]} */
const handle = []

function StartServer () {
  handle.push({
    match: /(^\/static\/?.+$)|(\/favicon\.ico)|(\/worker-html\.js)/,
    handler: requestHandler.get('Static'),
    cache: false
  })
  handle.push({
    match: /^\/post\/?.+$/,
    handler: requestHandler.get('Post'),
    cache: true
  })
  handle.push({
    match: /^\/ajax\/?.+$/,
    handler: requestHandler.get('Ajax'),
    cache: false
  })
  handle.push({
    match: /^\/rss$|^\/rss.xml$/,
    handler: requestHandler.get('Rss'),
    cache: true
  })
  handle.push({
    match: /^\/edit$|^\/edit\/$/,
    handler: requestHandler.get('Edit'),
    cache: false
  })
  handle.push({
    match: /^\/code\/?.+$/,
    handler: requestHandler.get('Code'),
    cache: false
  })
  handle.push({
    match: /^\/page\/?.+$/,
    handler: requestHandler.get('Page'),
    cache: true
  })
  handle.push({
    match: /^(\/find\/?.+)|(\/search\/?.+)|(\/\?q=)|(\/\?search=)$/,
    handler: requestHandler.get('Find'),
    cache: true
  })
  handle.push({
    match: /^\/$/,
    handler: requestHandler.get('Index'),
    cache: true
  })

  if (!fs.existsSync(config.templatePath)) {
    log.info('template-Directory is non-existing! creating new empty directory')

    try {
      fs.mkdirSync(config.templatePath)
    } catch (error) {
      log.error("template-Directory couldn't be created, see following error", error)
      process.exit(1)
    }
  }

  server.setCacheModule(cache)
  server.setRequestHandlers(handle)
  server.start()
}

// TODO config.Version !== ConfigDefault.Version
// if (config.Version && config.Version !== ConfigDefault.Version) {
//   logger.info('Config version difference detected (reference was "' + configDefaultFile + '") -> clearing cache...')
//   Cache.clear()
//   logger.info('Please update your Config.js!')
//   process.exit(1)
// }

if (config.DevMode) {
  if (cache && config.ClearCacheOnStart) {
    cache.clear()
  }

  StartServer()
} else if (!config.Server.UseMultipleProcessingCores) {
  StartServer()
} else {
  if (cluster.isMaster) {
    log.info(`platform: ${process.platform}`)
    log.info(`architecture: ${process.arch}`)
    log.info(`versions: ${JSON.stringify(process.versions)}`)
    log.info(`command line arguments: ${process.argv}`)

    if (cache && config.ClearCacheOnStart) {
      cache.clear()
    }

    if (config.Server.Threads <= 1) {
      config.Server.Threads = 1
    }

    for (let i = config.Server.Threads; i > 0; i--) {
      cluster.fork()
    }

    cluster.on('fork', function (worker) {
      log.info(util.format('worker #%d forked. (pid %d)', worker.id, worker.process.pid))
    })

    cluster.on('disconnect', function (worker) {
      log.info(util.format('worker #%d (pid %d) disconnected.', worker.id, worker.process.pid))
    })

    cluster.on('exit', function (worker, code, signal) {
      log.info(util.format('worker #%d (pid %d) died (returned code %s; signal %s). restarting...', worker.id, worker.process.pid, code || 'undefined', signal || 'undefined'))
      cluster.fork()
    })
  } else if (cluster.isWorker) {
    StartServer()
  }
}
