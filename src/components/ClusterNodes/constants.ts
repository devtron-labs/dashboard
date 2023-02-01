import { multiSelectStyles } from '../v2/common/ReactSelectCustomization'
import { ColumnMetadataType, EFFECT_TYPE } from './types'

export const clusterSelectStyle = {
    ...multiSelectStyles,
    menu: (base) => ({
        ...base,
        zIndex: 9999,
        textAlign: 'left',
        minWidth: '150px',
        maxWidth: '380px',
    }),
    control: (base, state) => ({
        ...base,
        borderColor: 'transparent',
        backgroundColor: 'transparent',
        cursor: 'pointer',
        height: '28px',
        minHeight: '28px',
    }),
    singleValue: (base, state) => ({
        ...base,
        fontWeight: 600,
        color: 'var(--N900)',
        direction: 'rtl',
        textAlign: 'left',
        marginLeft: '2px',
    }),
    indicatorsContainer: (base, state) => ({
        ...base,
        height: '28px',
    }),
    valueContainer: (base, state) => ({
        ...base,
        height: '28px',
        padding: '0 6px',
    }),
}

export const CLUSTER_STATUS = {
    RUNNING: 'Running',
    FAILED: 'Failed',
    SESSION_LIMIT_REACHED: 'session-limit-reached',
    POD_TERMINATED: 'pod-terminated',
}

export const COLUMN_METADATA: ColumnMetadataType[] = [
    {
        sortType: 'string',
        columnIndex: 0,
        label: 'Node',
        value: 'name',
        isDefault: true,
        isSortingAllowed: true,
        isDisabled: true,
        sortingFieldName: 'name',
    },
    { sortType: 'string', columnIndex: 1, label: 'Status', value: 'status', isDefault: true, isDisabled: true },
    { sortType: 'string', columnIndex: 2, label: 'Roles', value: 'roles', isDefault: true },
    {
        sortType: 'number',
        columnIndex: 3,
        label: 'Errors',
        value: 'errorCount',
        isDefault: true,
        isDisabled: true,
        isSortingAllowed: true,
        sortingFieldName: 'errorCount',
    },
    { sortType: 'string', columnIndex: 4, label: 'K8S Version', value: 'k8sVersion', isDefault: true },
    {
        sortType: 'number',
        columnIndex: 5,
        label: 'No.of pods',
        value: 'podCount',
        isDefault: true,
        isSortingAllowed: true,
        sortingFieldName: 'podCount',
    },
    {
        sortType: 'number',
        columnIndex: 6,
        label: 'Taints',
        value: 'taintCount',
        isDefault: true,
        isSortingAllowed: true,
        sortingFieldName: 'taintCount',
    },
    {
        sortType: 'number',
        columnIndex: 7,
        label: 'CPU Usage (%)',
        value: 'cpu.usagePercentage',
        isDefault: true,
        isSortingAllowed: true,
        sortingFieldName: 'cpu.usagePercentage',
    },
    {
        sortType: 'number',
        columnIndex: 8,
        label: 'CPU Usage (Absolute)',
        value: 'cpu.usage',
        isSortingAllowed: true,
        sortingFieldName: 'cpu.usageInBytes',
    },
    {
        sortType: 'number',
        columnIndex: 9,
        label: 'CPU Allocatable',
        value: 'cpu.allocatable',
        isSortingAllowed: true,
        sortingFieldName: 'cpu.allocatableInBytes',
    },
    {
        sortType: 'number',
        columnIndex: 10,
        label: 'Mem Usage (%)',
        value: 'memory.usagePercentage',
        isDefault: true,
        isSortingAllowed: true,
        sortingFieldName: 'memory.usagePercentage',
    },
    {
        sortType: 'number',
        columnIndex: 11,
        label: 'Mem Usage (Absolute)',
        value: 'memory.usage',
        isSortingAllowed: true,
        sortingFieldName: 'memory.usageInBytes',
    },
    {
        sortType: 'number',
        columnIndex: 12,
        label: 'Mem Allocatable',
        value: 'memory.allocatable',
        isSortingAllowed: true,
        sortingFieldName: 'memory.allocatableInBytes',
    },
    {
        sortType: 'string',
        columnIndex: 13,
        label: 'Age',
        value: 'age',
        isDefault: true,
        isSortingAllowed: true,
        sortingFieldName: 'createdAt',
    },
    { sortType: 'boolean', columnIndex: 14, label: 'Unschedulable', value: 'unschedulable' },
]

export const NODE_DETAILS_TABS = {
    summary: 'Summary',
    yaml: 'YAML',
    nodeConditions: 'Node conditions',
    debug: 'Debug',
}

export const TAINT_OPTIONS: {
    label: EFFECT_TYPE
    value: EFFECT_TYPE
    description: string
}[] = [
    {
        label: EFFECT_TYPE.NoSchedule,
        value: EFFECT_TYPE.NoSchedule,
        description: 'Prevents all pods from being scheduled to the node.',
    },
    {
        label: EFFECT_TYPE.PreferNoSchedule,
        value: EFFECT_TYPE.PreferNoSchedule,
        description: 'Prevents all pods from being scheduled to the node if possible.',
    },
    {
        label: EFFECT_TYPE.NoExecute,
        value: EFFECT_TYPE.NoExecute,
        description: 'Prevents all pods from being scheduled to the node and evict all existing pods on the node.',
    },
]
export const CLUSTER_NODE_ACTIONS_LABELS = {
    terminal: 'Terminal',
    cordon: 'Cordon',
    uncordon: 'Uncordon',
    drain: 'Drain',
    taints: 'Edit taints',
    yaml: 'Edit node config',
    delete: 'Delete',
}

export const CORDON_NODE_MODAL_MESSAGING = {
    cordonInfoText: {
        lineOne: 'Cordoning this node will mark this node as unschedulable.',
        lineTwo: 'By cordoning a node, you can be sure that no new pods will be scheduled on this node.',
    },
    uncordonInfoText: {
        lineOne: 'Uncordoning this node will mark this node as schedulable.',
        lineTwo: 'By uncordoning a node, you can allow pods to be scheduled on this node.',
    },
    cordon: 'Cordon node',
    uncordon: 'Uncordon node',
    cordoning: 'Cordoning node',
    uncordoning: 'Uncordoning node',
    cancel: 'Cancel',
}

export const DRAIN_NODE_MODAL_MESSAGING = {
    GracePeriod: {
        heading: 'Grace period',
        infoText:
            'Period of time in seconds given to each pod to terminate gracefully. If negative, the default value specified in the pod will be used.',
    },
    DeleteEmptyDirectoryData: {
        heading: 'Delete empty directory data',
        infoText:
            'Enabling this field will delete the pods using empty directory data when the node is drained.',
    },
    DisableEviction: {
        heading: 'Disable eviction (use with caution)',
        infoText:
            `Enabling this field will force drain to use delete, even if eviction is supported. This will bypass checking PodDisruptionBudgets.
            Note: Make sure to use with caution.`,
    },
    ForceDrain: {
        heading: 'Force drain',
        infoText: 'Enabling this field will force drain a node even if there are pods that do not declare a controller.',
    },
    IgnoreDaemonSets: {
        heading: 'Ignore DaemonSets',
        infoText: 'Enabling this field will ignore DaemonSet-managed pods.',
    },
    Actions: {
        infoText: 'Drain will cordon off the node and evict all pods of the node.',
        drain: 'Drain node',
        draining: 'Draining node',
        cancel: 'Cancel',
    },
}

export const DELETE_NODE_MODAL_MESSAGING = {
    recommended: 'Recommended: ',
    recommendedInfoText: 'Drain the node before deleting it as it may cause disruption because of pod deletion.',
    delete: 'Delete node',
    deletePostfix: ' Node',
    description: 'Are you sure you want to delete this node?',
    initiated: 'Node deletion initiated',
}

export const EDIT_TAINTS_MODAL_MESSAGING = {
    titlePrefix: 'Edit taints for node ',
    infoText:
        'Add taints to nodes so that pods are not scheduled to the nodes or not scheduled to the nodes if possible. After you add taints to nodes, you can set tolerations on a pod to allow the pod to be scheduled to nodes with certain taints.',
    infoLinkText: 'Check taint validations.',
    tippyTitle: 'Taint validations',
    tippyDescription: {
        message: 'A taint consists of a key, value, and effect.',
        messageList: [
            `1. Key: The key must begin with a letter or number, and may contain letters, numbers, hyphens, dots, and underscores, up to 253 characters.`,
            `Optionally, the key can begin with a DNS subdomain prefix and a single '/', like example.com/my-app.`,
            `2. Value(Optional) :If given, it must begin with a letter or number, and may contain letters, numbers, hyphens, dots, and underscores, up to 63 characters.`,
            `3. Combination of <key, effect> must be unique.`,
        ],
    },
    addTaint: 'Add taint',
    Actions: {
        cancel: 'Cancel',
        save: 'Save',
        saving: 'Taints updated successfully',
    },
}
export const IMAGE_LIST = {
    NAME: 'name',
    IMAGE: 'image',
    DESCRIPTION: 'description',
}
