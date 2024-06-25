/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export const APP_LIST_HEADERS = {
    AppName: 'App name',
    AppStatus: 'App status',
    ReleaseName: 'App/Release name',
    Environment: 'Environment',
    Cluster: 'Cluster',
    Namespace: 'Namespace',
    LastDeployedAt: 'Last deployed at',
    SearchAppStatus: 'Search app status',
    FluxCDStatus: 'Status',
    FluxCDTemplateType: 'TEMPLATE TYPE',
}
export const appListLoading = Array.from(Array(3).keys()).map((index) => ({
    id: index,
    appName: '',
    appStatus: '',
    environment: '',
    cluster: '',
    namespace: '',
    lastDeployedAt: '',
}))

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
    fluxCDInfoText: 'FluxCD based applications deployed in your cluster will be shown here',
}
export const ClearFiltersLabel = 'Clear filters'
export const DefaultAppNote = `## Describe this application\n\nDescribe this application in a few words. The description could include the purpose, features, benefits, and target audience of your application. A well-written description will help users know about this application and how it works. Keep it concise and informative!\n`
export const DefaultHelmChartNote = `## Describe this helm chart\n\nDescribe this helm chart in a few words. The description could include the purpose, features, benefits, and target audience of your application. A well-written description will help users know about this helm chart and how it works. Keep it concise and informative!\n`
export const DefaultJobNote = `## Describe this job\n\nDescribe this job in a few words. The description could include the purpose, features, benefits, and target audience of your job. A well-written description will help users know about this job and how it works. Keep it concise and informative!\n`

export const StatusConstants = {
    NOT_DEPLOYED: {
        titleCase: 'Not Deployed',
        noSpaceLower: 'notdeployed',
        normalCase: 'Not deployed',
        lowerCase: 'not-deployed',
    },
    APP_STATUS: {
        noSpaceLower: 'appStatus',
        normalText: 'App status',
    },
    PROJECT: {
        pluralLower: 'projects',
        lowerCase: 'project',
    },
    CLUSTER: {
        pluralLower: 'clusters',
        lowerCase: 'cluster',
    },
    NAMESPACE: {
        pluralLower: 'namespaces',
        lowerCase: 'namespace',
    },
    ENVIRONMENT: {
        pluralLower: 'environments',
        lowerCase: 'environment',
    },
    NOT_AVILABLE: {
        normalCase: 'Not available',
    },
    TEMPLATE_TYPE: {
        normalCase: 'Template type',
        noSpaceLower: 'templateType',
    },
} as const

export const InitialEmptyMasterFilters = {
    projects: [],
    environments: [],
    clusters: [],
    namespaces: [],
    appStatus: [],
    templateType: [],
}

export const InitialEmptyUrlFilters = {
    environments: [],
    teams: [],
    namespaces: [],
    appNameSearch: '',
    appStatuses: [],
    templateType: [],
    sortBy: 'appNameSort',
    sortOrder: 'ASC',
    offset: 0,
    hOffset: 0,
    size: 20,
}
