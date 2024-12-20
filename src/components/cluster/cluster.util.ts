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

import { NodeTaintType } from '@devtron-labs/devtron-fe-common-lib'
import { OptionType } from '../app/types'
import {
    ClusterComponentType,
    ClusterComponentStatusType,
    ClusterComponentStatus,
    ClusterTerminalParamsType,
    emptyClusterTerminalParamsData,
} from './cluster.type'

export function getEnvName(components: ClusterComponentType[], agentInstallationStage): string {
    let nonTerminatingStatus: ClusterComponentStatusType[] = []
    if (agentInstallationStage === 1) {
        // progressing
        nonTerminatingStatus = [
            ClusterComponentStatus.REQUEST_ACCEPTED,
            ClusterComponentStatus.ENQUEUED,
            ClusterComponentStatus.DEPLOY_INIT,
            ClusterComponentStatus.GIT_SUCCESS,
            ClusterComponentStatus.ACD_SUCCESS,
        ]
    } else if (agentInstallationStage === 2) {
        // success
        nonTerminatingStatus = [ClusterComponentStatus.DEPLOY_SUCCESS]
    } else if (agentInstallationStage === 3) {
        // failed
        nonTerminatingStatus = [
            ClusterComponentStatus.QUE_ERROR,
            ClusterComponentStatus.DEQUE_ERROR,
            ClusterComponentStatus.TRIGGER_ERROR,
            ClusterComponentStatus.GIT_ERROR,
            ClusterComponentStatus.ACD_ERROR,
        ]
    }

    const str = nonTerminatingStatus.join('')
    const c = components?.find((c) => str.search(c.status) >= 0)
    return c?.envName
}

export function getClusterTerminalParamsData(
    params: URLSearchParams,
    imageList: OptionType[],
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

export const createTaintsList = (list: any[], nodeLabel: string): Map<string, NodeTaintType[]> => {
    return list?.reduce((taints, node) => {
        const label = node[nodeLabel]
        if (!taints.has(label)) {
            taints.set(label, node.taints)
        }
        return taints
    }, new Map<string, NodeTaintType[]>())
}
