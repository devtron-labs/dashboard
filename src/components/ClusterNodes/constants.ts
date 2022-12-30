import { multiSelectStyles } from '../v2/common/ReactSelectCustomization'
import { ColumnMetadataType } from './types'

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
    SESSION_LIMIT_REACHED:'session-limit-reached',
    POD_TERMINATED: 'pod-terminated'
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

export const IMAGE_LIST = {
    NAME: 'name',
    IMAGE: 'image',
    DESCRIPTION: 'description'
}