'use strict'

// const { join } = require('path')
const fs = require('fs')

const { log } = require('./utils')

// Constant Variables
const { FIXTURES_DIR } = require('./constants')

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

/**
 * Executes a given scenario with a provided fixture
 *
 * @param {object} scenario scenario object
 * @param {string} fixture directory name of a fixture
 */
async function executeScenario (scenario, fixture) {
  const { actions } = scenario

  const result = await actions.reduce(
    (acc, action) => {
      return acc.then((result) => action(scenario, fixture))
    },
    Promise.resolve()
  )
  log.info('execute', 'Result Time: %d', result)
  log.info('execute', 'Details: %o', scenario.details)
}

async function execute () {
  // Execute scenarios
  const scenarios = require('./scenarios')
  const fixtures = fs.readdirSync(FIXTURES_DIR, 'utf-8')

  try {
    for (let x = 0; x < scenarios.length; ++x) {
      const scenario = scenarios[x]

      log.info('scenario', scenario.name)
      for (let i = 0; i < fixtures.length; ++i) {
        const fixture = fixtures[i]

        log.info('fixture', fixture)
        await executeScenario(scenario, fixture)
      }
    }
  } catch (e) {
    log.error(e)
  }
}

execute()
