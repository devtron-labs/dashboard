import { handleUTCTime } from '../../common'
import { Environment } from './types'
import moment from 'moment'

export const buildInitState = (appListPayload): Promise<any> => {
    return new Promise((resolve) => {
        let parsedResponse = {
            apps: [],
            offset: appListPayload.offset,
            size: 0,
            pageSize: appListPayload.size,
            sortRule: {
                key: appListPayload.sortBy,
                order: appListPayload.sortOrder,
            },
            searchQuery: appListPayload.appNameSearch || '',
            searchApplied: !!appListPayload.appNameSearch.length,
        }
        return resolve(parsedResponse)
    })
}

export const createAppListPayload = (payloadParsedFromUrl, environmentClusterList) => {
    const clustersMap = new Map()
    const namespaceMap = new Map()
    let environments = []

    const entry = environmentClusterList?.entries()
    if (entry) {
        for (const [key, value] of entry) {
            const { namespace, clusterId } = value
            namespaceMap.set(namespace, key)
            const clusterKeys = clustersMap.get(clusterId) || []
            clustersMap.set(clusterId, [...clusterKeys, key])
        }
    }

    environments.push(...payloadParsedFromUrl.environments)

    payloadParsedFromUrl.namespaces.forEach((item) => {
        const [cluster, namespace] = item.split('_')

        if (+cluster) {
            const envList = clustersMap.get(+cluster) || []
            environments = [...environments, ...envList]
        }
        if (namespace) {
            environments.push(namespaceMap.get(namespace))
        }
    })

    return { ...payloadParsedFromUrl, environments: [...new Set(environments)] }
}

export const appListModal = (appList, environmentClusterList) => {
    return appList.map((app) => {
        return {
            id: app.appId || 0,
            name: app.appName || 'NA',
            environments: app.environments.map((env) => environmentModal(env,environmentClusterList)) || [],
            defaultEnv: getDefaultEnvironment(app.environments,environmentClusterList),
        }
    })
}

const environmentModal = (env, environmentClusterList) => {
    let status = env.status
    if (env.status.toLocaleLowerCase() == 'deployment initiated') {
        status = 'Progressing'
    }
    let appStatus = env.appStatus
    if (!env.appStatus) {
        if (env.lastDeployedTime) {
            appStatus = ''
        } else {
            appStatus = 'notdeployed'
        }
    }
    const envData = environmentClusterList.get(env.environmentId)
    
    return {
        id: env.environmentId || 0,
        name: envData?.environmentName || '',
        lastDeployedTime: env.lastDeployedTime ? handleUTCTime(env.lastDeployedTime, false) : '',
        status: env.status ? handleDeploymentInitiatedStatus(env.status) : 'notdeployed',
        default: env.default ? env.default : false,
        materialInfo: env.materialInfo || [],
        ciArtifactId: env.ciArtifactId || 0,
        clusterName: envData?.clusterName || '',
        namespace: envData?.namespace || '',
        appStatus: appStatus,
    }
}

const getDefaultEnvironment = (envList ,environmentClusterList): Environment => {
    let env = envList[0]
    let status = env.status
    const envData = environmentClusterList.get(env.environmentId)
    if (env.status.toLowerCase() === 'deployment initiated') {
        status = 'Progressing'
    }
    let appStatus = env.appStatus || (env.lastDeployedTime ? '' : 'notdeployed')
    return {
        id: env.environmentId as number,
        name: envData?.environmentName,
        lastDeployedTime: env.lastDeployedTime ? handleUTCTime(env.lastDeployedTime) : '',
        status: handleDeploymentInitiatedStatus(status),
        materialInfo: env.materialInfo || [],
        ciArtifactId: env.ciArtifactId || 0,
        clusterName: envData?.clusterName || '',
        namespace: envData?.namespace || '',
        appStatus,
    }
}

const getLastDeployedEnv = (envList: Array<Environment>): Environment => {
    let env = envList[0]
    let ms = moment(new Date(0)).valueOf()
    for (let i = 0; i < envList.length; i++) {
        let time =
            envList[i].lastDeployedTime && envList[i].lastDeployedTime.length
                ? envList[i].lastDeployedTime
                : new Date(0)
        let tmp = moment(time).utc(true).subtract(5, 'hours').subtract(30, 'minutes').valueOf()
        if (tmp > ms) {
            ms = tmp
            env = envList[i]
        }
    }
    return env
}

const sortByLabel = (a, b) => {
    if (a.label < b.label) {
        return -1
    }
    if (a.label > b.label) {
        return 1
    }
    return 0
}

const getStatus = () => {
    return ['Not Deployed', 'Healthy', 'Missing', 'Unknown', 'Progressing', 'Suspended', 'Degraded']
}

const handleDeploymentInitiatedStatus = (status: string): string => {
    if (status.replace(/\s/g, '').toLowerCase() == 'deploymentinitiated') return 'progressing'
    else return status
}
