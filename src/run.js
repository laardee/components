const { clone, isNil, isEmpty } = require('ramda')

const utils = require('./utils')

const { credentials, decryptString, encryptString } = require('./utils/encryption')

const {
  errorReporter,
  getComponentsFromStateFile,
  getComponentsFromServerlessFile,
  getOrphanedComponents,
  // getExecutedComponents,
  buildGraph,
  executeGraph,
  setServiceId,
  readStateFile,
  writeStateFile,
  trackDeployment,
  handleSignalEvents,
  packageComponent,
  log
} = utils

const run = async (command, options) => {
  options.projectPath = options.projectPath || process.cwd()
  const { projectPath, serverlessFileObject } = options

  await credentials({ projectPath })

  if (command === 'package') {
    return packageComponent(options)
  }
  handleSignalEvents()
  const reporter = await errorReporter()
  let components = {}
  let stateFile = {}
  let archive = {}
  try {
    stateFile = await readStateFile(projectPath, serverlessFileObject)
    stateFile = setServiceId(stateFile)
    // TODO BRN: If we're using immutable data, we shouldn't need to clone here
    archive = clone(stateFile)
    let componentsToUse
    let orphanedComponents
    let serverlessFileComponents
    if (!isNil(serverlessFileObject) && !isEmpty(serverlessFileObject)) {
      serverlessFileComponents = await getComponentsFromServerlessFile(
        stateFile,
        projectPath,
        serverlessFileObject
      )
    } else {
      serverlessFileComponents = await getComponentsFromServerlessFile(stateFile, projectPath)
    }
    const stateFileComponents = getComponentsFromStateFile(stateFile)
    if (command === 'remove') {
      componentsToUse = stateFileComponents
      orphanedComponents = {}
    } else {
      componentsToUse = serverlessFileComponents
      orphanedComponents = getOrphanedComponents(serverlessFileComponents, stateFileComponents)
    }
    components = { ...componentsToUse, ...orphanedComponents }
    if (command === 'deploy') trackDeployment(componentsToUse)
    const graph = await buildGraph(componentsToUse, orphanedComponents, command)
    await executeGraph(graph, components, stateFile, archive, command, options, false)
    // run the "info" command on every component after a successful deployment
    if (command === 'deploy') {
      // NOTE: need to re-build the graph here since we're mutating it in "executeGraph"
      // TODO: we should refactor this code later on
      // eslint-disable-next-line no-shadow
      const graph = await buildGraph(componentsToUse, orphanedComponents, 'info')
      await executeGraph(graph, components, stateFile, archive, 'info', options, false)
    }

    if (command === 'encrypt') {
      if (options.variable) {
        log(encryptString(options.variable))
      } else {
        process.env.COMPONENTS_ENC_STATE = true
        log('Encrypting state file...')
      }
    }

    if (command === 'decrypt') {
      if (options.variable) {
        log(decryptString(options.variable))
      } else {
        process.env.COMPONENTS_ENC_STATE = false
        log('Decrypting state file...')
      }
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
    await writeStateFile(projectPath, stateFile, serverlessFileObject)
  }
  return components
}

module.exports = run
