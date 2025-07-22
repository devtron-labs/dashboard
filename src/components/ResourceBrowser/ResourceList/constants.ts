import {
    ActionMenuItemType,
    GroupedFilterSelectPickerProps,
    NodeActionMenuOptionIdEnum,
} from '@devtron-labs/devtron-fe-common-lib'

import { CLUSTER_NODE_ACTIONS_LABELS } from '@Components/ClusterNodes/constants'

import { NODE_SEARCH_KEYS } from '../Types'

export const getNodeActions = (unschedulable: boolean): ActionMenuItemType<NodeActionMenuOptionIdEnum>[] => [
    {
        id: NodeActionMenuOptionIdEnum.terminal,
        label: CLUSTER_NODE_ACTIONS_LABELS.terminal,
        startIcon: { name: 'ic-terminal-fill' },
    },
    {
        id: unschedulable ? NodeActionMenuOptionIdEnum.uncordon : NodeActionMenuOptionIdEnum.cordon,
        label: unschedulable ? CLUSTER_NODE_ACTIONS_LABELS.uncordon : CLUSTER_NODE_ACTIONS_LABELS.cordon,
        startIcon: { name: unschedulable ? 'ic-play-outline' : 'ic-pause-circle' },
    },
    {
        id: NodeActionMenuOptionIdEnum.drain,
        label: CLUSTER_NODE_ACTIONS_LABELS.drain,
        startIcon: { name: 'ic-clean-brush' },
    },
    {
        id: NodeActionMenuOptionIdEnum.editTaints,
        label: CLUSTER_NODE_ACTIONS_LABELS.taints,
        startIcon: { name: 'ic-spray-can' },
    },
    {
        id: NodeActionMenuOptionIdEnum.editYaml,
        label: CLUSTER_NODE_ACTIONS_LABELS.yaml,
        startIcon: { name: 'ic-file-edit' },
    },
    {
        id: NodeActionMenuOptionIdEnum.delete,
        label: CLUSTER_NODE_ACTIONS_LABELS.delete,
        type: 'negative',
        startIcon: { name: 'ic-delete' },
    },
]

export const NODE_LIST_SEARCH_FILTER_OPTIONS: GroupedFilterSelectPickerProps<NODE_SEARCH_KEYS>['options'] = [
    {
        items: [
            { id: NODE_SEARCH_KEYS.LABEL, label: 'Label' },
            { id: NODE_SEARCH_KEYS.NODE_GROUP, label: 'Node Groups' },
        ],
    },
]

export const NODE_SEARCH_KEY_TO_LABEL_PREFIX_MAP: Record<NODE_SEARCH_KEYS, string> = {
    [NODE_SEARCH_KEYS.NODE_GROUP]: 'Node group',
    [NODE_SEARCH_KEYS.LABEL]: 'Label',
}

export const NODE_SEARCH_KEY_PLACEHOLDER: Record<NODE_SEARCH_KEYS, string> = {
    [NODE_SEARCH_KEYS.LABEL]: 'Search by key=value Eg. environment=production, tier=frontend',
    [NODE_SEARCH_KEYS.NODE_GROUP]: 'Search by node group name Eg. mainnode',
}
