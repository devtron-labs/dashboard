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

import { Nodes } from '../../../../../../components/app/types'

export enum K8sPermissionActionType {
    add = 'add',
    delete = 'delete',
    clone = 'clone',
    edit = 'edit',
    onClusterChange = 'onClusterChange',
    onNamespaceChange = 'onNamespaceChange',
    onApiGroupChange = 'onApiGroupChange',
    onKindChange = 'onKindChange',
    onObjectChange = 'onObjectChange',
    onRoleChange = 'onRoleChange',
    onStatusChange = 'onStatusChange',
}

export const K8S_PERMISSION_INFO_MESSAGE = {
    [Nodes.CronJob]: 'Specified role will be provided for child Job(s), Pod(s) of selected CronJob(s).',
    [Nodes.Job]: 'Specified role will be provided for child Pod(s) of selected Job(s).',
    [Nodes.Deployment]: 'Specified role will be provided for child ReplicaSet(s) and Pod(s) of selected Deployment(s).',
    [Nodes.ReplicaSet]: 'Specified role will be provided for child Pod(s) of selected ReplicaSet(s).',
    [Nodes.Rollout]: 'Specified role will be provided for child ReplicaSet(s) and Pod(s) of selected Rollout(s).',
    [Nodes.StatefulSet]: 'Specified role will be provided for child Pod(s) of selected StatefulSet(s).',
    [Nodes.DaemonSet]: 'Specified role will be provided for child Pod(s) of selected DaemonSet(s).',
}
