import { AppType, Node, NodeFilters } from '@devtron-labs/devtron-fe-common-lib'
import { ApplicationsGAEvents } from '../constants'

export const doesNodeSatisfiesFilter = (node: Node, filter: string) =>
    node.health?.status.toLowerCase() === filter || (filter === NodeFilters.drifted && node.hasDrift)

export const getApplicationsGAEvent = (appType: AppType) => {
    switch (appType) {
        case AppType.DEVTRON_HELM_CHART:
            return ApplicationsGAEvents.REFRESH_HELM_APP_RESOURCE_TREE
        case AppType.EXTERNAL_ARGO_APP:
            return ApplicationsGAEvents.REFRESH_ARGO_APP_RESOURCE_TREE
        case AppType.EXTERNAL_FLUX_APP:
            return ApplicationsGAEvents.REFRESH_FLUX_APP_RESOURCE_TREE
        default:
            return ApplicationsGAEvents.REFRESH_DEVTRON_APP_RESOURCE_TREE
    }
}
