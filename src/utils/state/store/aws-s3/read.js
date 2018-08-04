const AWS = require('aws-sdk')
const { decryptState } = require('../../encryptState')

const s3 = new AWS.S3({ region: 'us-east-1' })

const { log } = require('../../../../utils/logging')

const createLock = async (config) => {
  const lockFile = `${config.state.file}.lock`
  log('Checking if state is locked')
  let locked = false
  try {
    await s3
      .headObject({
        Bucket: config.state.bucket,
        Key: lockFile
      })
      .promise()
    locked = true
  } catch (error) {
    if (error.statusCode !== 404) {
      throw error
    }
  }

  if (locked) {
    throw new Error('State is locked')
  }

  await s3
    .putObject({
      Bucket: config.state.bucket,
      Key: lockFile,
      Body: Date.now().toString()
    })
    .promise()
}

const fetchObject = async (config) => {
  try {
    log(`Fetching state file ${config.state.bucket}/${config.state.file}`)
    const { Body } = await s3
      .getObject({
        Bucket: config.state.bucket,
        Key: config.state.file
      })
      .promise()
    return decryptState(JSON.parse(Body))
  } catch (error) {
    if (error.statusCode === 404) {
      return {}
    }
    throw error
  }
}

module.exports = async (config) => {
  await createLock(config)
  return fetchObject(config)
}
