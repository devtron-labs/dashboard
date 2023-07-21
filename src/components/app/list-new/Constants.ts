export const APP_LIST_HEADERS = {
    AppName: 'App name',
    AppStatus: 'App status',
    ReleaseName: 'App/Release name',
    Environment: 'Environment',
    Cluster: 'Cluster',
    Namespace: 'Namespace',
    LastDeployedAt: 'Last deployed at',
    SearchAppStatus: 'Search app status'
}
export const ENVIRONMENT_HEADER_TIPPY_CONTENT = 'Environment is a unique combination of cluster and namespace'
export const EXTERNAL_HELM_SSE_CONNECTION_ERROR = 'Some network error occured while fetching external apps.'
export const EXTERNAL_HELM_APP_FETCH_CLUSTER_ERROR = 'Error in getting external helm apps from cluster'
export const EXTERNAL_HELM_APP_FETCH_ERROR = 'Some error occured while fetching external helm apps'
export const SELECT_CLUSTER_FROM_FILTER_NOTE =
    'To view helm charts deployed from outside devtron, please select a cluster from above filters.'
export const HELM_PERMISSION_MESSAGE =
    'Permissions for helm apps are now managed separately under user access. Please request permission from super-admin if required.'
export const APPLIST_EMPTY_STATE_MESSAGING = {
    heading: 'Select cluster to see deployed apps',
    infoText: 'Helm-based applications deployed from devtron or other sources will be shown here.',
    altText: 'No Cluster Selected',
    selectCluster: 'Select a cluster from above filters to see apps deployed from outside devtron.',
    noHelmChartsFound: 'No helm charts found in connected clusters',
    connectClusterInfoText: 'Connect a kubernetes cluster containing helm apps to view them here.',
    connectClusterAltText: 'Please connect cluster',
    connectClusterLabel: 'Connect a cluster',
    noAppsFound: 'No apps found',
    noAppsFoundInfoText: `We couldn't find any matching applications.`,
}
export const ClearFiltersLabel = 'Clear filters'
export const DefaultJobNote =`## Describe this Job

Describe your Devtron Job in a few words. This will help others understand the purpose and configuration of your job. Keep it concise and informative!
`

export const StatusConstants = {
    NOT_DEPLOYED: {
        noSpaceLower: 'notdeployed',
        normalCase: 'Not deployed',
        lowerCase: 'not-deployed'
    },
    APP_STATUS: {
        noSpaceLower: 'appStatus',
        normalText: 'App status'
    },
    PROJECT: {
        pluralLower: 'projects',
        lowerCase: 'project'
    },
    CLUSTER: {
        pluralLower: 'clusters',
        lowerCase: 'cluster'
    },
    NAMESPACE: {
        pluralLower: 'namespaces',
        lowerCase: 'namespace'
    },
    ENVIRONMENT: {
        pluralLower: 'environments',
        lowerCase: 'environment'
    },
    NOT_AVILABLE: {
        normalCase: 'Not available',
    }
}