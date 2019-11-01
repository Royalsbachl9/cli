'use strict'

const child = require('child_process')
const rimraf = require('rimraf')
const log = require('npmlog')
const { join } = require('path')

const {
  CACHE_NAME,
  FIXTURES_DIR
} = require('./constants')

// Helper Functions
function createEnv (overrides = {}) {
  console.group('createEnv') // TESTING
  const env = Object.keys(process.env).reduce((acc, key) => {
    return (key.match(/^npm_/))
      // Don't include `npm_` key/values
      ? acc
      // Add key/value to env object
      : Object.assign({}, acc, { [key]: process.env[key] })
  }, {})
  // log.silly('env:', env) // TESTING
  console.groupEnd('createEnv end') // TESTING
  return Object.assign({}, env, overrides)
}

async function removePath (path) {
  return new Promise((resolve, reject) => {
    rimraf(path, {}, (err) => {
      if (err) {
        return reject(err)
      }
      return resolve()
    })
  })
}

async function removeCache (ctx, fixture) {
  const cacheDir = join(FIXTURES_DIR, CACHE_NAME)
  console.group('removeCache') // TESTING
  log.silly('cacheDir:', cacheDir) // TESTING
  console.groupEnd('removeCache end') // TESTING
  // return Promise.resolve()
  return removePath(cacheDir)
}

async function removeNodeModules (ctx, fixture) {
  const cwd = join(FIXTURES_DIR, fixture)
  const nodeModulesDir = join(cwd, 'node_modules')
  console.group('removeNodeModules') // TESTING
  log.silly('nodeModulesDir:', nodeModulesDir) // TESTING
  console.groupEnd('removeNodeModules end') // TESTING
  // return Promise.resolve()
  return removePath(nodeModulesDir)
}

async function removeLockfile (ctx, fixture) {
  // TODO: change this to use `scenario.lockfile`
  const cwd = join(FIXTURES_DIR, fixture)
  const lockfilePath = join(cwd, 'package-lock.json')
  console.group('removeLockfile') // TESTING
  log.silly('lockfilePath:', lockfilePath) // TESTING
  console.groupEnd('removeLockfile end') // TESTING
  // return Promise.resolve()
  return removePath(lockfilePath)
}

async function measureAction ({ cmd, args, env, cwd }) {
  log.silly('executing...') // TESTING
  log.silly('cmd:', cmd) // TESTING
  log.silly('args:', args) // TESTING
  log.silly('env:', env) // TESTING
  log.silly('cwd:', cwd) // TESTING
  const startTime = Date.now()
  // const delay = (ms, value) => new Promise(resolve => setTimeout(() => resolve(value), ms))
  // await delay(1000)
  const result = child.spawnSync(cmd, args, { env, cwd, stdio: 'inherit' })
  if (result.status !== 0) {
    console.error(result.error)
    throw new Error(`${cmd} failed with status code ${result.status}`)
  }
  const endTime = Date.now()
  console.groupEnd('Instance Action End')
  return endTime - startTime
}

/**
 * NOTE: Scenario Ordering
 * The order of the scenarios is important because of cache and node_modules
 * hydration. If each scenario started fresh, we'd have to prep each one.
 * This sort of funtionality is prefered but not created yet.
 */
module.exports = [
  {
    name: 'fresh install',
    details: {
      cache: false,
      node_modules: false,
      lockfile: false
    },
    cmd: 'npm',
    args: [
      'install',
      '--ignore-scripts',
      '--cache',
      `${CACHE_NAME}`,
      '--registry',
      'https://registry.npmjs.org/'
    ],
    actions: [
      removeCache,
      removeNodeModules,
      removeLockfile,
      async (ctx, fixture) => {
        const { cmd, args } = ctx
        const env = createEnv()

        const cwd = join(FIXTURES_DIR, fixture)
        console.group('Instance Action') // TESTING
        return measureAction({ cmd, args, env, cwd })
      }
    ]
  },
  {
    name: 'repeat install',
    details: {
      cache: true,
      node_modules: true,
      lockfile: true
    },
    cmd: 'npm',
    args: [
      'install',
      '--ignore-scripts',
      '--cache',
      `${CACHE_NAME}`,
      '--registry',
      'https://registry.npmjs.org/'
    ],
    actions: [
      (ctx, fixture) => {
        const { cmd, args } = ctx
        const env = createEnv()

        const cwd = join(FIXTURES_DIR, fixture)
        return measureAction({ cmd, args, env, cwd })
      }
    ]
  }
]
