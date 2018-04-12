const { clone } = require('ramda')
const utils = require('./utils')

const {
  errorReporter,
  getComponentsFromStateFile,
  getComponentsFromServerlessFile,
  getComponentsToRemove,
  // getExecutedComponents,
  buildGraph,
  executeGraph,
  setServiceId,
  readStateFile,
  writeStateFile,
  trackDeployment
  // log
} = utils

const run = async (command, options) => {
  const reporter = await errorReporter()
  let components = {}
  let stateFile = {}
  let archive = {}
  try {
    stateFile = await readStateFile()
    stateFile = setServiceId(stateFile)
    // TODO BRN: If we're using immutable data, we shouldn't need to clone here
    archive = clone(stateFile)
    let componentsToUse
    if (command === 'remove') {
      componentsToUse = await getComponentsFromStateFile(stateFile)
    } else {
      componentsToUse = await getComponentsFromServerlessFile(stateFile)
    }
    const componentsToRemove = await getComponentsToRemove(stateFile, componentsToUse)
    components = { ...componentsToUse, ...componentsToRemove }
    if (command === 'deploy') trackDeployment(componentsToUse)
    const graph = await buildGraph(componentsToUse, componentsToRemove, command)
    await executeGraph(graph, components, stateFile, archive, command, options, false)
    // run the "info" command on every component after a successful deployment
    if (command === 'deploy') {
      // NOTE: need to re-build the graph here since we're mutating it in "executeGraph"
      // TODO: we should refactor this code later on
      // eslint-disable-next-line no-shadow
      const graph = await buildGraph(componentsToUse, componentsToRemove, 'info')
      await executeGraph(graph, components, stateFile, archive, 'info', options, false)
    }
  } catch (error) {
    if (reporter) {
      reporter.captureException(error)
    }

    // DISABLING rollback for the launch.

    // log(chalk.red(`Error: ${error.message}. Rolling back...`))
    // const executedComponents = getExecutedComponents(components)
    // const executedComponentsGraph = await buildGraph(executedComponents, {}, command)
    // await executeGraph(
    //   executedComponentsGraph,
    //   executedComponents,
    //   stateFile,
    //   archive,
    //   command,
    //   options,
    //   true
    // )

    throw error
  } finally {
    await writeStateFile(stateFile)
  }
  return components
}

module.exports = run
