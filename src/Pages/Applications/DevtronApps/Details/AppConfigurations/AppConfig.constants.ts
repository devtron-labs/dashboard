import { BASE_CONFIGURATION_ENV_ID, EnvResourceType } from '@devtron-labs/devtron-fe-common-lib'

export const BASE_CONFIGURATIONS = {
    id: BASE_CONFIGURATION_ENV_ID,
    name: 'Base Configurations',
}

const resourceTypes = Object.values(EnvResourceType)
export const ENV_CONFIG_PATH_REG = new RegExp(`(${resourceTypes.join('|')})`)
