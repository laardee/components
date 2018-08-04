const getConfig = require('../../misc/getConfig')

const local = require('./local')
const awsS3 = require('./aws-s3')
const awsDynamo = require('./aws-dynamo')

module.exports = async (projectPath) => {
  const config = await getConfig(projectPath)
  switch (config.state.type) {
    case 'aws-s3':
      return awsS3.read(config)
    case 'aws-dynamo':
      return awsDynamo.read(config)
    default:
      return local.read(config)
  }
}
