'use strict'

const { join } = require('path')

const pkg = require('../package.json')

exports.BASE_DIR = join(__dirname, '..')
exports.BENCHMARK_DIR = join(this.BASE_DIR, 'benchmarks')
exports.FIXTURES_DIR = join(this.BENCHMARK_DIR, 'fixtures')
exports.TMP_DIR = join(this.BASE_DIR, 'tmp')
exports.RESULTS_DIR = join(this.BENCHMARK_DIR, 'results')

exports.CACHE_NAME = 'cache'
exports.VERSION = pkg.version
