const path = require('path')
const { fileExists, readFile } = require('@serverless/utils')
const { decryptState } = require('../../encryptState')

module.exports = async (config) => {
  const { projectPath, state } = config
  const stateFilePath =
    state && state.file ? path.resolve(state.file) : path.join(projectPath, 'state.json')
  if (!(await fileExists(stateFilePath))) {
    return {}
  }
  let content = await readFile(stateFilePath)
  return decryptState(content)
}
