'use strict'

const { join } = require('path')

exports.BASE_DIR = join(__dirname, '..')
exports.BENCHMARK_DIR = join(this.BASE_DIR, 'benchmarks')
exports.FIXTURES_DIR = join(this.BENCHMARK_DIR, 'fixtures')
exports.TMP_DIR = join(this.BASE_DIR, 'tmp')

exports.CACHE_NAME = 'cache'
