import { ActionMenuItemType } from '@devtron-labs/devtron-fe-common-lib'

import { CLUSTER_NODE_ACTIONS_LABELS } from '@Components/ClusterNodes/constants'

export const getNodeActions = (unschedulable: boolean): ActionMenuItemType[] => [
    {
        id: 'terminal',
        label: CLUSTER_NODE_ACTIONS_LABELS.terminal,
        startIcon: { name: 'ic-terminal-fill' },
    },
    {
        id: unschedulable ? 'uncordon' : 'cordon',
        label: unschedulable ? CLUSTER_NODE_ACTIONS_LABELS.uncordon : CLUSTER_NODE_ACTIONS_LABELS.cordon,
        startIcon: { name: unschedulable ? 'ic-play-outline' : 'ic-pause-circle' },
    },
    {
        id: 'drain',
        label: CLUSTER_NODE_ACTIONS_LABELS.drain,
        startIcon: { name: 'ic-clean-brush' },
    },
    {
        id: 'edit-taints',
        label: CLUSTER_NODE_ACTIONS_LABELS.taints,
        startIcon: { name: 'ic-spray-can' },
    },
    {
        id: 'edit-yaml',
        label: CLUSTER_NODE_ACTIONS_LABELS.yaml,
        startIcon: { name: 'ic-file-edit' },
    },
    {
        id: 'delete',
        label: CLUSTER_NODE_ACTIONS_LABELS.delete,
        type: 'negative',
        startIcon: { name: 'ic-delete' },
    },
]
