import { Routes } from '@Config/constants'
import { get, ResponseType, showError } from '@devtron-labs/devtron-fe-common-lib'
import { ClusterNamespacesDTO } from './clustersAndEnvironments.types'

/**
 * Retrieves a list of all namespaces in a cluster along with their associated labels.
 *
 * @param clusterId - The unique identifier of the cluster for which to fetch namespaces.
 * @returns - A promise that resolves to the list of namespaces with their labels.
 */
export const getClusterNamespaces = async (clusterId: number): Promise<ResponseType<ClusterNamespacesDTO[]>> => {
    try {
        const response = await get(`${Routes.CLUSTER_NAMESPACE}/${clusterId}/v2`)
        return response
    } catch (err) {
        showError(err)
        throw err
    }
}
