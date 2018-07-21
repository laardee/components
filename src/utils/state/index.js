const generateServiceId = require('./generateServiceId')
const getInputs = require('./getInputs')
const getRootPath = require('./getRootPath')
const getServiceId = require('./getServiceId')
const getState = require('./getState')
const readStateFile = require('./store/readStateFile')
const setServiceId = require('./setServiceId')
const writeStateFile = require('./store/writeStateFile')

module.exports = {
  generateServiceId,
  getInputs,
  getRootPath,
  getServiceId,
  getState,
  readStateFile,
  setServiceId,
  writeStateFile
}
