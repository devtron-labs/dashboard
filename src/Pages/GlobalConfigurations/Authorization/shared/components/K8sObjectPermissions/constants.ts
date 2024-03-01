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
