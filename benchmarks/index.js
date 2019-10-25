'use strict'

const { join } = require('path')
const child = require('child_process')

// Constant Variables
const BASE_DIR = join(__dirname, '..')
const BENCHMARK_DIR = join(BASE_DIR, 'benchmarks')
const FIXTURES_DIR = join(BENCHMARK_DIR, 'fixtures')
const TMP_DIR = join(BASE_DIR, 'tmp')

// Helper Functions
const pathKey = (options = {}) => {
  const environment = options.env || process.env
  const platform = options.platform || process.platform

  if (platform !== 'win32') {
    return 'PATH'
  }

  return Object.keys(environment)
    .find(key => key.toUpperCase() === 'PATH') || 'Path'
}

/**
 * // Scenario Object
 * {
 *    pmName: 'npm',
 *    fixtures: 'path/to/fixtures/dir',
 * }
 */

// module.exports.benchmark = async function benchmark (scenario, fixture, opts) {
//   // Create 'current working directory'
//   const cwd = path.join(TMP_DIR, scenario.pmName, scenario.fixture)
//   // Copy fixtures into temp directory
//   await copy(path.join(FIXTURES_DIR, fixture), cwd)
// }

// async function executeScenario (scenario) {}

async function execute () {
  // Execute scenarios
  const scenarios = require('./scenarios')
  // console.log('scenarios:', scenarios) // TESTING
  console.log('BASE_DIR:', BASE_DIR) // TESTING
  console.log('BENCHMARK_DIR:', BENCHMARK_DIR) // TESTING
  console.log('FIXTURE_DIR:', FIXTURES_DIR) // TESTING
  console.log('TMP_DIR:', TMP_DIR) // TESTING

  try {
    for (let x = 0; x < scenarios.length; ++x) {
      const scenario = scenarios[x]

      // TODO: put this in `executeScenario`?
      const { actions } = scenario
      // console.log('actions:', actions) // TESTING

      const cwd = ''

      const result = await actions.reduce(
        (acc, action) => {
          return acc.then((result) => action(cwd, scenario))
        },
        Promise.resolve()
      )
      console.log('Scenario:', scenario.name)
      console.log('Result Time:', result)
    }
  } catch (e) {
    console.log(e)
  }
}

execute()
