import { EnvResourceType } from './AppConfig.types'

export const BASE_CONFIGURATIONS = {
    id: -1,
    name: 'Base Configurations',
}

const resourceTypes = Object.values(EnvResourceType)
export const ENV_CONFIG_PATH_REG = new RegExp(`(${resourceTypes.join('|')})`)
