import {
    ComponentSizeType,
    DeploymentAppTypes,
    ResourceKindType,
    SelectPicker,
    useGetResourceKindsOptions,
} from '@devtron-labs/devtron-fe-common-lib'
import { ClusterSelectProps, SelectClusterOptionType } from './types'
import { generateClusterOption } from './utils'

const RESOURCES_TO_FETCH: [ResourceKindType.cluster] = [ResourceKindType.cluster]

const ClusterSelect = ({ clusterId, clusterName, handleClusterChange, deploymentAppType }: ClusterSelectProps) => {
    const { isResourcesOptionsLoading, refetchResourcesOptions, resourcesOptionsError, resourcesOptionsMap } =
        useGetResourceKindsOptions({
            resourcesToFetch: RESOURCES_TO_FETCH,
        })

    const clusterOptions = (resourcesOptionsMap?.[ResourceKindType.cluster] || [])
        .filter((cluster) => !cluster.isVirtual)
        .map<SelectClusterOptionType>((cluster) => generateClusterOption(cluster.name, cluster.id))

    return (
        <div className="w-250">
            <SelectPicker<SelectClusterOptionType['value'], false>
                inputId="migrate-from-source-cluster-select"
                classNamePrefix="migrate-from-source-cluster-select"
                label={
                    deploymentAppType === DeploymentAppTypes.HELM
                        ? 'Cluster containing Helm Release'
                        : 'Cluster containing Argo CD application'
                }
                isLoading={isResourcesOptionsLoading}
                optionListError={resourcesOptionsError}
                reloadOptionList={refetchResourcesOptions}
                options={clusterOptions}
                onChange={handleClusterChange}
                value={clusterId ? generateClusterOption(clusterName, clusterId) : null}
                placeholder="Select a cluster"
                required
                autoFocus
                size={ComponentSizeType.large}
            />
        </div>
    )
}

export default ClusterSelect
