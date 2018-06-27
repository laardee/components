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
  try {
    return new AWS[inputs.serviceName](params)
  } catch (exception) {
    throw new Error(
      `Failed to create a service object '${inputs.serviceName}' - ${exception.message}`
    )
  }
}

module.exports = {
  initialize
}
