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

import { DeploymentAppTypes, GenericSectionErrorStateProps } from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as ICArgoCDApp } from '@Icons/ic-argocd-app.svg'
import { ReactComponent as ICDefaultChart } from '@Icons/ic-default-chart.svg'
import { ReactComponent as ICFluxCDApp } from '@Icons/ic-fluxcd-app.svg'

export const GENERIC_SECTION_ERROR_STATE_COMMON_PROPS: Readonly<
    Pick<GenericSectionErrorStateProps, 'rootClassName' | 'description'>
> = {
    rootClassName: 'dc__mxw-400',
    description: '',
}

export const TARGET_ENVIRONMENT_INFO_LIST = {
    heading: 'Target environment',
    infoList: [
        'A deployment pipeline will be created for the target environment.',
        'Environment is a unique combination of cluster and namespace in Devtron.',
    ],
}

export const MIGRATE_FROM_RADIO_GROUP_CONFIG: Record<
    Extract<DeploymentAppTypes, DeploymentAppTypes.HELM | DeploymentAppTypes.ARGO | DeploymentAppTypes.FLUX>,
    { title: string; tooltipContent: { title: string; subtitle: string } }
> = {
    [DeploymentAppTypes.HELM]: {
        title: 'Helm Release',
        tooltipContent: {
            title: 'Migrate helm release',
            subtitle: 'Migrate an existing Helm Release to manage deployments via CD pipeline',
        },
    },
    [DeploymentAppTypes.ARGO]: {
        title: 'Argo CD Application',
        tooltipContent: {
            title: 'Migrate Argo CD Application',
            subtitle: 'Migrate an existing Argo CD Application to manage deployments via CD pipeline',
        },
    },
    [DeploymentAppTypes.FLUX]: {
        title: 'Flux CD Application',
        tooltipContent: {
            title: 'Migrate Flux CD Application',
            subtitle: 'Migrate an existing Flux CD Application to manage deployments via CD pipeline',
        },
    },
}

export const MIGRATE_FROM_CLUSTER_APP_SELECT_CONFIG = {
    [DeploymentAppTypes.HELM]: {
        clusterSelectLabel: 'Cluster containing Helm Release',
        appSelectLabel: 'Release name',
        appSelectPlaceholder: 'Select a helm release',
        icon: <ICDefaultChart />,
    },
    [DeploymentAppTypes.ARGO]: {
        clusterSelectLabel: 'Cluster containing Argo CD application',
        appSelectLabel: 'Argo CD application',
        appSelectPlaceholder: 'Select an Argo CD application',
        icon: <ICArgoCDApp />,
    },
    [DeploymentAppTypes.FLUX]: {
        clusterSelectLabel: 'Cluster containing Flux CD application',
        appSelectLabel: 'Flux CD application',
        appSelectPlaceholder: 'Select an Flux CD application',
        icon: <ICFluxCDApp />,
    },
}
