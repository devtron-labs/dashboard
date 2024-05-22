import { get, post, ResponseType, ROUTES } from '@devtron-labs/devtron-fe-common-lib'
import { Routes } from '../../config'

export function getClusterList(): Promise<any> {
    const URL = `${ROUTES.CLUSTER}`
    return get(URL)
}

export function getCluster(id: number) {
    const URL = `${ROUTES.CLUSTER}?id=${id}`
    return get(URL)
}

export function retryClusterInstall(id: number, payload): Promise<ResponseType> {
    const URL = `${Routes.CHART_AVAILABLE}/cluster-component/install/${id}`
    return post(URL, payload)
}

export const getEnvironment = (id: number): Promise<any> => {
    const URL = `${Routes.ENVIRONMENT}?id=${id}`
    return get(URL)
}

export const getEnvironmentList = (): Promise<any> => {
    const URL = `${Routes.ENVIRONMENT}`
    return get(URL).then((response) => response)
}
