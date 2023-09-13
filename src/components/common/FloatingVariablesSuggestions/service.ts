import { get } from '@devtron-labs/devtron-fe-common-lib'
import { Routes } from '../../../config'

const generateScope = (key, value) => {
    if (key && value) {
        return `"${key}":${value},`
    }
    return ''
}

export const getScopedVariables = (appId, envId, clusterId) => {
    let query = `?appId=${appId}&scope={`

    query += generateScope('appId', appId)
    query += generateScope('envId', envId)
    query += generateScope('clusterId', clusterId)

    if (query[query.length - 1] === ',') {
        query = query.slice(0, -1)
    }

    query += '}'

    return get(`${Routes.SCOPED_GLOBAL_VARIABLES}${query}`)
}
