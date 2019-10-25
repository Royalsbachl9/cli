'use strict'

const child = require('child_process')
const rimraf = require('rimraf')
const { join } = require('path')

const CACHE_NAME = 'cache'

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

async function removeCache (cwd) {
  const cacheDir = join(cwd, CACHE_NAME)
  console.group('removeCache')
  console.log('cacheDir:', cacheDir)
  console.groupEnd()
  return Promise.resolve()
  // return removePath(cacheDir)
}

async function removeNodeModules (cwd) {
  const nodeModulesDir = join(cwd, 'node_modules')
  console.group('removeNodeModules')
  console.log('nodeModulesDir:', nodeModulesDir)
  console.groupEnd()
  return Promise.resolve()
  // return removePath(nodeModulesDir)
}

async function removeLockfile (cwd) {
  // TODO: change this to use `scenario.lockfile`
  const lockfilePath = join(cwd, 'package-lock.json')
  console.group('removeLockfile')
  console.log('lockfilePath:', lockfilePath)
  console.groupEnd()
  return Promise.resolve()
  // return removePath(lockfilePath)
}

async function measureAction ({ cmd, args, env, cwd }) {
  const startTime = Date.now()
  const delay = (ms, value) => new Promise(resolve => setTimeout(() => resolve(value), ms))
  await delay(1000)
  // const result = child.spawnSync(cmd, args, { env, cwd, stdio: 'inherit' })
  // if (result.status !== 0) {
  //   console.error(result.error)
  //   throw new Error(`${cmd} failed with status code ${result.status}`)
  // }
  const endTime = Date.now()
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
      nodeModules: false,
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
      async (cwd, ctx) => {
        const { cmd, args } = ctx
        const env = {}

        console.log('Instance Action') // TESTING
        return measureAction({ cmd, args, env, cwd })
      }
    ]
  },
  {
    name: 'repeat install',
    details: {
      cache: true,
      nodeModules: true,
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
      (cwd, ctx) => {
        const { cmd, args } = ctx
        const env = {}

        return measureAction({ cmd, args, env, cwd })
      }
    ]
  }
]
