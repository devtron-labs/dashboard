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

import { CreateClusterTypeEnum, SidebarConfigType } from './types'

export const SIDEBAR_CONFIG: SidebarConfigType = {
    [CreateClusterTypeEnum.CONNECT_CLUSTER]: {
        title: 'Connect Cluster',
        iconName: 'ic-ci-linked',
        dataTestId: 'cluster-button-switch',
        body: (
            <p className="m-0">
                Connect an existing Kubernetes cluster to manage Kubernetes resources and deploy containerized
                applications using Devtron.
            </p>
        ),
    },
    [CreateClusterTypeEnum.CREATE_CLUSTER]: {
        title: 'Create Kubernetes Cluster',
        iconName: 'ic-new',
        dataTestId: 'create-cluster-tab',
        body: (
            <p className="m-0">
                Use Devtron to easily create Kubernetes clusters on popular cloud providers. Simplify cluster
                provisioning and management with a guided, user-friendly interface.
            </p>
        ),
        isEnterprise: true,
    },
    [CreateClusterTypeEnum.ADD_ISOLATED_CLUSTER]: {
        title: 'Add Isolated Cluster',
        iconName: 'ic-add',
        documentationHeader: 'Isolated Cluster',
        dataTestId: 'virtual-cluster-button-switch',
        body: (
            <>
                <p className="m-0">
                    An isolated cluster in Devtron is an air-gapped Kubernetes cluster with restricted network access.
                </p>
                <p className="m-0">
                    Since Devtron does not have connectivity to these clusters, deployments are managed by packaging
                    manifests and images for manual installation or retrieval from an OCI registry (if enabled).
                </p>
            </>
        ),
        isEnterprise: true,
        hideInEAMode: true,
    },
} as const
