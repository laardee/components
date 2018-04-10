const { assoc, keys, merge, reduce } = require('ramda')
const deferredPromise = require('../deferredPromise')
const getChildrenIds = require('./getChildrenIds')
const getComponent = require('./getComponent')
const getComponentFunctions = require('./getComponentFunctions')
const getComponentRootPath = require('./getComponentRootPath')
const getDependencies = require('../variables/getDependencies')
const getState = require('../state/getState')

const getComponentsFromServerlessFile = async (
  stateFile,
  componentRoot = getComponentRootPath(),
  inputs = {},
  componentId,
  components = {}
) => {
  const component = await getComponent(componentRoot, componentId, inputs, stateFile)

  const nestedComponents = await reduce(
    async (accum, componentAlias) => {
      accum = await Promise.resolve(accum)
      const nestedComponentRoot = getComponentRootPath(component.components[componentAlias].type)
      const nestedComponentInputs = component.components[componentAlias].inputs || {}
      const nestedComponentId = component.components[componentAlias].id
      accum = await getComponentsFromServerlessFile(
        stateFile,
        nestedComponentRoot,
        nestedComponentInputs,
        nestedComponentId,
        await accum
      )
      return accum
    },
    Promise.resolve(components),
    keys(component.components) || []
  )

  components = assoc(
    component.id,
    {
      id: component.id,
      type: component.type,
      inputs: component.inputs,
      outputs: {},
      state: getState(stateFile, component.id),
      dependencies: getDependencies(component.inputs),
      children: getChildrenIds(component) || {},
      promise: deferredPromise(),
      fns: getComponentFunctions(component.type)
    },
    components
  )

  return merge(components, nestedComponents)
}

module.exports = getComponentsFromServerlessFile
