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

import { ActionTypes, EntityTypes, ReactSelectInputAction } from '@devtron-labs/devtron-fe-common-lib'

import { SELECT_ALL_VALUE } from '../../../../../../config'
import { ACTION_LABEL } from '../../../constants'
import { getDefaultStatusAndTimeout } from '../../../libUtils'
import { K8sPermissionFilter } from '../../../types'

export const apiGroupAll = (permission, isLabel = false) => {
    if (permission === '') {
        return isLabel ? 'All API groups' : SELECT_ALL_VALUE
    }
    if (permission === 'k8sempty') {
        return isLabel ? 'K8s core groups (eg. service, pod, etc.)' : 'k8sempty'
    }
    return permission
}

// '' is for the action buttons
export const HEADER_OPTIONS = ['CLUSTER', 'API GROUP', 'KIND', 'NAMESPACE', 'RESOURCE', 'ROLE', 'STATUS', ''] as const

export const multiSelectAllState = (selected, actionMeta, setState, options) => {
    if (actionMeta.action === ReactSelectInputAction.selectOption && actionMeta.option.value === SELECT_ALL_VALUE) {
        setState(options.filter((option) => option.value === SELECT_ALL_VALUE))
    } else if (
        (actionMeta.action === ReactSelectInputAction.deselectOption && actionMeta.option.value === SELECT_ALL_VALUE) ||
        (actionMeta.action === ReactSelectInputAction.removeValue && actionMeta.removedValue.value === SELECT_ALL_VALUE)
    ) {
        setState([])
    } else if (
        actionMeta.action === ReactSelectInputAction.deselectOption ||
        actionMeta.action === ReactSelectInputAction.removeValue
    ) {
        setState(selected.filter((o) => o.value !== SELECT_ALL_VALUE))
    } else if (selected.length >= options.length - 1 && actionMeta.action !== 'create-option') {
        setState(options)
    } else {
        setState(selected.filter((option) => option.value !== SELECT_ALL_VALUE))
    }
}

// eslint-disable-next-line default-param-last
export const getPermissionObject = (idx = 0, k8sPermission?: K8sPermissionFilter): K8sPermissionFilter => {
    if (k8sPermission) {
        return {
            key: idx,
            cluster: k8sPermission.cluster,
            namespace: k8sPermission.namespace,
            group: k8sPermission.group,
            kind: k8sPermission.kind,
            resource: k8sPermission.resource,
            action: k8sPermission.action,
            entity: k8sPermission.entity,
            status: k8sPermission.status,
            timeToLive: k8sPermission.timeToLive,
        }
    }
    return {
        key: idx,
        cluster: null,
        namespace: null,
        group: null,
        kind: null,
        resource: null,
        action: { value: ActionTypes.VIEW, label: ACTION_LABEL[ActionTypes.VIEW] },
        entity: EntityTypes.CLUSTER,
        ...getDefaultStatusAndTimeout(),
    }
}

export const excludeKeyAndClusterValue = ({ cluster, ...rest }: K8sPermissionFilter): K8sPermissionFilter => ({
    cluster: { label: cluster.label, value: cluster.label },
    ...rest,
})
