import { DEVTRON_DEFAULT_RELEASE_NAME, DEVTRON_DEFAULT_NAMESPACE, DEVTRON_DEFAULT_CLUSTER_ID } from '../config'

export const CheckIfDevtronOperatorHelmRelease = (releaseName: string, namespace: string, clusterId: string): boolean => {
    return releaseName === DEVTRON_DEFAULT_RELEASE_NAME &&
        namespace === DEVTRON_DEFAULT_NAMESPACE &&
        clusterId === DEVTRON_DEFAULT_CLUSTER_ID.toString()
}