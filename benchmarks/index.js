'use strict'

const { join } = require('path')
const fs = require('fs')

const { log } = require('./utils')

// Constant Variables
const { FIXTURES_DIR, RESULTS_DIR, VERSION } = require('./constants')

/**
 * Executes a given scenario with a provided fixture
 *
 * @param {Object} scenario scenario object
 * @param {string} scenario.name name of the scenario
 * @param {object} scenario.details details about scenario
 * @param {boolean} scenario.details.cache
 * @param {boolean} scenario.details.node_modules
 * @param {boolean} scenario.details.lockfile
 * @param {string} scenario.cmd command used by the scenario
 * @param {string[]} scenario.args list of arguments to pass to the command
 * @param {function[]} scenario.actions list of actions this scenario will take
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
  return result
}

async function execute () {
  // Execute scenarios
  const scenarios = require('./scenarios')
  const fixtures = fs.readdirSync(FIXTURES_DIR, 'utf8')

  try {
    const newResults = {}
    for (let x = 0; x < scenarios.length; ++x) {
      const scenario = scenarios[x]

      const scenarioKey = scenario.name.toLowerCase()
      if (scenarioKey !== 'cleanup') {
        newResults[scenarioKey] = {}
      }

      log.info('scenario', scenario.name)
      for (let i = 0; i < fixtures.length; ++i) {
        const fixture = fixtures[i]

        log.info('fixture', fixture)
        const execResult = await executeScenario(scenario, fixture)

        const fixtureKey = fixture.toLowerCase()
        if (newResults[scenarioKey]) {
          newResults[scenarioKey][fixtureKey] = execResult
        }
      }
    }
    const prevResults = safeLoadResults()
    const results = [...prevResults, newResults]
    writeResults(results)
  } catch (e) {
    log.error(e)
  }
}

function writeResults (results) {
  const filepath = join(RESULTS_DIR, `${VERSION}.json`)
  try {
    const data = JSON.stringify(results, null, '  ')
    fs.writeFileSync(filepath, data)
  } catch (err) {
    throw err
  }
}

function safeLoadResults () {
  const filepath = join(RESULTS_DIR, `${VERSION}.json`)
  try {
    const file = fs.readFileSync(filepath, 'utf8')
    return (file) ? JSON.parse(file) : []
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw err
    }
    return []
  }
}

execute()
