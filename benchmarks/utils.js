'use strict'

const log = require('npmlog')

const { LOG_LEVEL } = process.env
log.level = LOG_LEVEL || 'info'

exports.log = log
