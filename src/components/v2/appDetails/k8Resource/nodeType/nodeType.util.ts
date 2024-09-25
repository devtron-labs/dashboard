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

import { iNode, NodeType } from '../../appDetails.type'
import { NodePodStatus } from './types'

export const getNodeStatus = (node: iNode) => {
    if (node.info && node.info.length > 0) {
        const statusReason = node.info.filter((_info) => {
            return _info.name === 'Status Reason'
        })
        if (statusReason && statusReason.length > 0) {
            let status = statusReason[0].value
            if (status === 'ContainerCreating') {
                // quick fix for status display
                status = 'Container Creating'
            }
            return status
        }
    }
    if (node.status) {
        return node.status
    }
    if (node.health?.status) {
        return node.health?.status
    }
    return ''
}

export const getFilteredPodStatus = (podStatusObj: NodePodStatus) => {
    const podStatusKeys = Object.keys(podStatusObj)

    if (podStatusKeys.length > 2 && podStatusObj['running'] === 0) {
        return podStatusKeys.filter((n) => n !== 'all' && n !== 'running')
    }

    return podStatusKeys.filter((n) => n !== 'all')
}

export const nodeRowClassModifierMap = {
    [NodeType.Pod.toLowerCase()]: 'col-6',
    [NodeType.Service.toLowerCase()]: 'col-3',
}
