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

import { OptionType, SelectPickerOptionType, UseUrlFiltersProps } from '@devtron-labs/devtron-fe-common-lib'

import { URLS } from '@Config/routes'

import { AppStatuses, AppStatusesDTO, FluxCDTemplateType } from './AppListType'

export const APP_LIST_HEADERS = {
    AppName: 'APP NAME',
    AppStatus: 'APP STATUS',
    ReleaseName: 'APP/RELEASE NAME',
    Environment: 'ENVIRONMENT',
    Cluster: 'CLUSTER',
    Namespace: 'NAMESPACE',
    LastDeployedAt: 'LAST DEPLOYED AT',
    Status: 'STATUS',
    FluxCDTemplateType: 'TEMPLATE TYPE',
}
export const appListLoadingArray = Array.from(Array(3).keys()).map((index) => ({
    id: index,
    appName: '',
    appStatus: '',
    environment: '',
    cluster: '',
    namespace: '',
    lastDeployedAt: '',
}))

export const ENVIRONMENT_HEADER_TIPPY_CONTENT = 'Environment is a unique combination of cluster and namespace'
export const SELECT_CLUSTER_TIPPY = 'Please select a cluster'
export const EXTERNAL_HELM_SSE_CONNECTION_ERROR = 'Some network error occured while fetching external apps.'
export const EXTERNAL_HELM_APP_FETCH_CLUSTER_ERROR = 'Error in getting external helm apps from cluster'
export const EXTERNAL_HELM_APP_FETCH_ERROR = 'Some error occured while fetching external helm apps'
export const SELECT_CLUSTER_FROM_FILTER_NOTE =
    'To view helm charts deployed from outside devtron, please select a cluster from above filters.'
export const HELM_PERMISSION_MESSAGE =
    'Permissions for helm apps are now managed separately under user access. Please request permission from super-admin if required.'
export const APP_LIST_EMPTY_STATE_MESSAGING = {
    heading: 'Select cluster to see deployed apps',
    infoText: 'Helm-based applications deployed from devtron or other sources will be shown here.',
    selectCluster: 'Select a cluster from above filters to see apps deployed from outside devtron.',
    noHelmChartsFound: 'No helm charts found in connected clusters',
    connectClusterInfoText: 'Connect a kubernetes cluster containing helm apps to view them here.',
    connectClusterLabel: 'Connect a cluster',
    noAppsFound: 'No apps found',
    noAppsFoundInfoText: `We couldn't find any matching applications.`,
    argoCDInfoText: 'ArgoCD based applications deployed in your cluster will be shown here',
    fluxCDInfoText: 'FluxCD based applications deployed in your cluster will be shown here',
}
export const DefaultAppNote = `## Describe this application\n\nDescribe this application in a few words. The description could include the purpose, features, benefits, and target audience of your application. A well-written description will help users know about this application and how it works. Keep it concise and informative!\n`
export const DefaultHelmChartNote = `## Describe this helm chart\n\nDescribe this helm chart in a few words. The description could include the purpose, features, benefits, and target audience of your application. A well-written description will help users know about this helm chart and how it works. Keep it concise and informative!\n`
export const DefaultJobNote = `## Describe this job\n\nDescribe this job in a few words. The description could include the purpose, features, benefits, and target audience of your job. A well-written description will help users know about this job and how it works. Keep it concise and informative!\n`

export const FLUX_CD_HELM_RELEASE_LABEL = 'Helm Release'

export const TEMPLATE_TYPE_FILTER_OPTIONS: SelectPickerOptionType[] = [
    { label: FLUX_CD_HELM_RELEASE_LABEL, value: FluxCDTemplateType.HELM_RELEASE },
    { label: FluxCDTemplateType.KUSTOMIZATION, value: FluxCDTemplateType.KUSTOMIZATION },
]

export const APP_STATUS_FILTER_OPTIONS: SelectPickerOptionType[] = [
    { label: AppStatuses.DEGRADED, value: AppStatusesDTO.DEGRADED },
    { label: AppStatuses.HEALTHY, value: AppStatusesDTO.HEALTHY },
    { label: AppStatuses.HIBERNATING, value: AppStatusesDTO.HIBERNATING },
    { label: AppStatuses.MISSING, value: AppStatusesDTO.MISSING },
    { label: AppStatuses.NOT_DEPLOYED, value: AppStatusesDTO.NOT_DEPLOYED },
    { label: AppStatuses.PROGRESSING, value: AppStatusesDTO.PROGRESSING },
]

export const APPS_WITH_NO_PROJECT_OPTION: OptionType = {
    label: 'Apps with no project',
    value: '0',
}

export const APP_LISTING_URLS = [URLS.DEVTRON_APP_LIST, URLS.HELM_APP_LIST, URLS.ARGO_APP_LIST, URLS.FLUX_APP_LIST]

export const APP_LIST_LOCAL_STORAGE_KEY: UseUrlFiltersProps<never, never>['localStorageKey'] = 'app-list__filters'
