import { Nodes } from '../../../../../../components/app/types'
import { authorizationSelectStyles } from '../../../constants'

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

export const resourceSelectStyles = {
    ...authorizationSelectStyles,
    control: (base, state) => ({
        ...authorizationSelectStyles.control(base, state),
        height: 'auto',
        minHeight: '36px',
    }),
    valueContainer: (base) => ({
        ...authorizationSelectStyles.valueContainer(base),
        display: 'flex',
        columnGap: '8px',
        rowGap: '4px',
    }),
    multiValue: (base) => ({
        ...base,
        border: '1px solid var(--N200)',
        borderRadius: '4px',
        background: 'white',
        height: '24px',
        padding: '2px 6px',
        fontSize: '12px',
        lineHeight: '20px',
    }),
    clearIndicator: (base) => ({
        ...base,
        padding: 0,
    }),
}
