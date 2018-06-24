/* eslint-disable no-console */

const AWS = require('aws-sdk')

const initialize = (inputs, context) => {
  context.log(`Using AWS SDK v.${AWS.VERSION} for ${inputs.serviceName}`)
  let params = {
    region: inputs.region || process.env.AWS_DEFAULT_REGION || 'us-east-1'
  }

  if (inputs.credentials) {
    Object.assign(params, inputs.credentials)
  }

  return new AWS[inputs.serviceName](params)
}

module.exports = {
  initialize
}
