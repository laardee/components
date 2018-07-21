const AWS = require('aws-sdk')
const { encryptState } = require('../../encryptState')

const s3 = new AWS.S3({ region: 'us-east-1' })

const removeLock = async (config) => {
  try {
    await s3
      .deleteObject({
        Bucket: config.state.bucket,
        Key: `${config.state.file}.lock`
      })
      .promise()
  } catch (error) {
    if (error.statusCode !== 404) {
      throw error
    }
  }
}

const writeObject = async (config, content) =>
  s3
    .putObject({
      Bucket: config.state.bucket,
      Key: config.state.file,
      Body: JSON.stringify(encryptState(content))
    })
    .promise()

module.exports = async (config, content) => {
  await removeLock(config)
  return writeObject(config, content)
}
