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

import { Icon, NodeTaintType, OptionType, SelectPickerOptionType } from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as Warning } from '@Icons/ic-alert-triangle.svg'

import {
    AddClusterFormPrefilledInfoType,
    AddEnvironmentFormPrefilledInfoType,
    ClusterTerminalParamsType,
    emptyClusterTerminalParamsData,
} from './cluster.type'
import { ADD_CLUSTER_FORM_LOCAL_STORAGE_KEY, ADD_ENVIRONMENT_FORM_LOCAL_STORAGE_KEY } from './constants'

export function getClusterTerminalParamsData(
    params: URLSearchParams,
    imageList: SelectPickerOptionType<string>[],
    namespaceList: OptionType[],
    nodeList: { options: OptionType[]; label: string }[],
    clusterShellList: OptionType[],
): ClusterTerminalParamsType {
    if (!nodeList || nodeList.length === 0) {
        return emptyClusterTerminalParamsData
    }
    const _selectedImage = imageList.find((image) => image.value === params.get('image'))
    const _selectedNamespace = namespaceList.find((namespace) => namespace.value === params.get('namespace'))
    const nodeOptionList: OptionType[] = []
    nodeList?.forEach((item) => nodeOptionList.push(...item.options))

    const _selectedNode: OptionType =
        nodeOptionList.find((data) => data.value === params.get('node')) || nodeList[0].options[0]

    const _selectedShell = clusterShellList.find((shell) => shell.value === params.get('shell'))

    return {
        selectedImage: _selectedImage,
        selectedNamespace: _selectedNamespace,
        selectedNode: _selectedNode,
        selectedShell: _selectedShell,
    }
}

export const createTaintsList = (list: any[], nodeLabel: string): Map<string, NodeTaintType[]> =>
    list?.reduce((taints, node) => {
        const label = node[nodeLabel]
        if (!taints.has(label)) {
            taints.set(label, node.taints)
        }
        return taints
    }, new Map<string, NodeTaintType[]>())

export const getServerURLFromLocalStorage = (fallbackServerUrl: string): string => {
    const stringifiedClusterData = localStorage.getItem(ADD_CLUSTER_FORM_LOCAL_STORAGE_KEY)

    if (stringifiedClusterData) {
        try {
            const clusterData: AddClusterFormPrefilledInfoType = JSON.parse(stringifiedClusterData)
            const serverURL = clusterData?.serverURL || fallbackServerUrl
            return serverURL
        } catch {
            // do nothing
        }
    }

    return fallbackServerUrl
}

export const getNamespaceFromLocalStorage = (fallbackNamespace: string): string => {
    const stringifiedEnvData = localStorage.getItem(ADD_ENVIRONMENT_FORM_LOCAL_STORAGE_KEY)

    if (stringifiedEnvData) {
        try {
            const envData: AddEnvironmentFormPrefilledInfoType = JSON.parse(stringifiedEnvData)
            const namespace = envData?.namespace || fallbackNamespace
            return namespace
            // eslint-disable-next-line no-empty
        } catch {}
    }
    return fallbackNamespace
}

export const PrometheusWarningInfo = () => (
    <div className="pt-10 pb-10 pl-16 pr-16 bcy-1 br-4 bw-1 dc__cluster-error mb-40">
        <div className="flex left dc__align-start">
            <Warning className="icon-dim-20 fcr-7" />
            <div className="ml-8 fs-13">
                <span className="fw-6 dc__capitalize">Warning: </span>Prometheus configuration will be removed and you
                won’t be able to see metrics for applications deployed in this cluster.
            </div>
        </div>
    </div>
)

export const PrometheusRequiredFieldInfo = () => (
    <div className="pt-10 pb-10 pl-16 pr-16 bcr-1 br-4 bw-1 er-2 mb-16">
        <div className="flex left dc__align-start">
            <Icon name="ic-error" size={20} color="R500" />
            <div className="ml-8 fs-13">
                Fill all the required fields OR turn off the above switch to skip configuring prometheus.
            </div>
        </div>
    </div>
)

export const renderKubeConfigClusterCountInfo = (clusterCount: number) => (
    <div>
        <div className="flex left dc__gap-4">
            <span className="fw-6">{clusterCount} valid cluster(s). </span>
            <span>Select the cluster you want to add/update</span>
        </div>
    </div>
)

export const renderNoEnvironmentTab = () => (
    <div className="br-4 dashed dc__border flex bg__secondary pb-16 pt-16 m-16 fs-12 fw-4">
        <div className="dc__align-center">
            <div className="fw-6">No Environments Added</div>
            <div>This cluster doesn&apos;t have any environments yet</div>
        </div>
    </div>
)

export const getEmptyCategoryPayload = () => ({
    id: 0,
    name: '',
    description: '',
})
