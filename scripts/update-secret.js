const fs = require('fs')

// Configuration constants
const ENV_FILE_PATH = '.env.secrets'
const DEVTRON_HOST = 'https://dev-staging.devtron.info'

/**
 * Helper for styled console logs with emojis
 */
const logger = {
    info: (message) => console.log(`ℹ️  ${message}`),
    success: (message) => console.log(`✅ ${message}`),
    warning: (message) => console.log(`⚠️  ${message}`),
    error: (message) => console.error(`❌ ${message}`),
    update: (message) => console.log(`🔄 ${message}`),
}

/**
 * Reads environment variables from .env.secrets file
 * @returns {Object} Environment variables as key-value pairs
 */
const readEnvFile = () => {
    try {
        const envContent = fs.readFileSync(ENV_FILE_PATH, 'utf8')
        const envVars = {}

        envContent.split('\n').forEach((line) => {
            const [key, value] = line.split('=')
            if (key && value) {
                envVars[key.trim()] = value.trim()
            }
        })

        return envVars
    } catch (error) {
        logger.error(`Cannot read ${ENV_FILE_PATH}: ${error.message}`)
        return {}
    }
}

/**
 * Wrapper for making API calls to Devtron
 * @param {string} endpoint - API endpoint
 * @param {object} body - Request body
 * @param {string} token - Authentication token
 * @returns {Promise<object>} Response data
 */
const callDevtronApi = async (endpoint, body, token, method = 'POST') => {
    try {
        const response = await fetch(`${DEVTRON_HOST}${endpoint}`, {
            method,
            headers: {
                'Content-Type': 'application/json',
                Cookie: `argocd.token=${token}`,
            },
            body: JSON.stringify(body),
        })

        if (!response.ok) {
            throw new Error(`API call failed with status: ${response.status}`)
        }

        return await response.json()
    } catch (error) {
        logger.error(`API call failed: ${error.message}`)
        throw error
    }
}

/**
 * Finds a matching namespace in Devtron based on user input
 * @param {string} userInputNamespace - Partial namespace name provided by user
 * @param {string} token - Authentication token
 * @returns {Promise<string>} The fully matched namespace name
 * @throws {Error} If no matching namespace is found
 */
async function matchNamespace(userInputNamespace, token) {
    const { result } = await callDevtronApi('/orchestrator/cluster/namespaces/1', undefined, token, 'GET')

    const validNamespacePattern = /(devtroncd-.*)|(shared-stage-dcd)/

    const matchedNamespace = result
        .filter((namespace) => validNamespacePattern.test(namespace))
        // sort in reverse order to prioritize more specific namespaces
        // ex - if user inputs ent-3 it can match both ent-3 and ea-ent-3.
        // If I don't sort, it will always match ea-ent-3 when a better match is available
        .sort((a, b) => b.localeCompare(a))
        .find((namespace) => namespace.includes(userInputNamespace))

    if (!matchedNamespace) {
        throw new Error(`Namespace "${userInputNamespace}" not found`)
    }

    logger.info(`Found matching namespace: ${matchedNamespace}`)
    return matchedNamespace
}

/**
 * Updates or adds an environment variable in the .env file
 * @param {string} key - Environment variable name
 * @param {string} value - Environment variable value
 * @returns {void}
 */
const updateEnvVariable = (key, value) => {
    // Read existing .env file or create empty string if it doesn't exist
    let envContent = ''
    try {
        envContent = fs.readFileSync(ENV_FILE_PATH, 'utf8')
    } catch (error) {
        // File doesn't exist, will create it
    }

    if (envContent.includes(`${key}=`)) {
        // Replace existing value
        envContent = envContent.replace(new RegExp(`${key}=.*$`, 'm'), `${key}=${value}`)
        logger.success(`${key} updated in ${ENV_FILE_PATH}`)
    } else {
        // Add new entry
        const newLine = envContent.length > 0 && !envContent.endsWith('\n') ? '\n' : ''
        envContent += `${newLine}${key}=${value}\n`
        logger.success(`${key} added to ${ENV_FILE_PATH}`)
    }

    fs.writeFileSync(ENV_FILE_PATH, envContent)
}

/**
 * Fetches the ingress host and updates the target URL in env file
 * @param {string} token - Authentication token
 * @param {string} namespace - Kubernetes namespace
 */
const writeIngressHostToEnv = async (token, namespace) => {
    logger.update(`Fetching ingress details for namespace: ${namespace}`)

    // Define the request body for ingress list
    const ingressBody = {
        appId: '',
        clusterId: 1,
        k8sRequest: {
            resourceIdentifier: {
                groupVersionKind: {
                    Group: 'networking.k8s.io',
                    Version: 'v1',
                    Kind: 'Ingress',
                },
                namespace,
            },
        },
    }

    // Get the list of ingresses
    const ingressListResponse = await callDevtronApi('/orchestrator/k8s/resource/list', ingressBody, token)
    const ingress = ingressListResponse.result.data[0]

    if (!ingress) {
        logger.error(`No ingress found in namespace ${namespace}`)
        throw new Error('No ingress found')
    }

    // Define the request body for ingress details
    const ingressDetailBody = {
        appId: '',
        clusterId: 1,
        k8sRequest: {
            resourceIdentifier: {
                groupVersionKind: {
                    Group: 'networking.k8s.io',
                    Version: 'v1',
                    Kind: 'Ingress',
                },
                namespace,
                name: ingress.name,
            },
        },
    }

    // Get the ingress details
    const ingressDetailResponse = await callDevtronApi('/orchestrator/k8s/resource', ingressDetailBody, token)
    const host = ingressDetailResponse.result.manifestResponse.manifest.spec.rules[0].host

    // Update the target URL environment variable
    updateEnvVariable('VITE_TARGET_URL', `https://${host}`)
    logger.info(`Target URL set to https://${host}`)
}

/**
 * Fetches the admin password from a secret and updates the env file
 * @param {string} token - Authentication token
 * @param {string} namespace - Kubernetes namespace
 */
const writeAdminPasswordToEnv = async (token, namespace) => {
    logger.update(`Fetching admin password for namespace: ${namespace}`)

    const secretsBody = {
        appId: '',
        clusterId: 1,
        k8sRequest: {
            resourceIdentifier: {
                groupVersionKind: {
                    Group: '',
                    Version: 'v1',
                    Kind: 'Secret',
                },
                namespace,
                name: 'orchestrator-secret',
            },
        },
    }

    try {
        const secretResponse = await callDevtronApi('/orchestrator/k8s/resource', secretsBody, token)
        const ADMIN_PASSWORD = secretResponse.result.manifestResponse.manifest.data.ADMIN_PASSWORD

        // Decode the base64 encoded ADMIN_PASSWORD
        const decodedPassword = Buffer.from(ADMIN_PASSWORD, 'base64').toString('utf8')

        // Update the admin password environment variable
        updateEnvVariable('VITE_ADMIN_PASSWORD', decodedPassword)
    } catch (error) {
        logger.error(`Failed to fetch admin password: ${error.message}`)
        throw error
    }
}
/**
 * Displays help information for the script
 */
const showHelp = () => {
    console.log(`
🔑 Devtron Secret Update Tool 🔑

Usage: node update-secret.js <namespace> [options]

Arguments:
  <namespace>  Partial namespace name to match against available namespaces
               Examples: "ent-3", "stage-dcd", etc.

Options:
  --help       Show this help message

Notes:
- Namespace matching:
  • Valid namespaces follow the pattern: devtroncd-<env> or shared-stage-dcd
  • You only need to provide a substring of the namespace (e.g., "ent-3" instead of "devtroncd-ent-3")
  • For dev-staging environment, use "stage-dcd" to match "shared-stage-dcd"
  • When multiple matches exist, more specific matches are prioritized
    (e.g., "ent-3" will match "devtroncd-ent-3" over "devtroncd-ea-ent-3")

- Required environment variables:
  • DEV_STAGING_TOKEN must be set in your ${ENV_FILE_PATH} file

This script will:
1. Find the matching namespace based on your input
2. Fetch and update the admin password in your ${ENV_FILE_PATH} file
3. Fetch and update the target URL in your ${ENV_FILE_PATH} file
`)
}

/**
 * Main execution function
 */
const main = async () => {
    // Check for required namespace argument
    if (!process.argv[2]) {
        logger.error('Please provide a namespace as an argument.')
        logger.info('Usage: node update-secret.js <namespace>')
        logger.info('For help: node update-secret.js --help')
        process.exit(1)
    }

    // Check if help is requested at the beginning of the script
    if (process.argv.includes('--help')) {
        showHelp()
        process.exit(0)
    }

    const userInputNamespace = process.argv[2]

    // Read token from .env.secrets file
    const envVars = readEnvFile()
    const token = envVars.DEV_STAGING_TOKEN

    if (!token) {
        logger.error('DEV_STAGING_TOKEN not found in .env.secrets file')
        logger.info('Make sure to add DEV_STAGING_TOKEN=your_token to .env.secrets')
        process.exit(1)
    }

    try {
        logger.info('Starting secret update process')

        // Execute both operations sequentially
        const namespace = await matchNamespace(userInputNamespace, token)
        await writeAdminPasswordToEnv(token, namespace)
        await writeIngressHostToEnv(token, namespace)

        logger.success('All secrets updated successfully! 🎉')
    } catch (error) {
        logger.error(`Failed to update secrets: ${error.message}`)
        process.exit(1)
    }
}

// Execute the script
if (require.main === module) {
    main().catch((error) => {
        logger.error(`Unhandled error: ${error.message}`)
        process.exit(1)
    })
}

// Export functions for potential reuse
module.exports = {
    readEnvFile,
    updateEnvVariable,
    writeIngressHostToEnv,
    writeAdminPasswordToEnv,
}
