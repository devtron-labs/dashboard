import { AggregationKeys, AggregationKeysType } from '../app/types'
import { multiSelectStyles } from '../v2/common/ReactSelectCustomization'

export const CLUSTER_SELECT_STYLE = {
    ...multiSelectStyles,
    menu: (base) => ({
        ...base,
        zIndex: 9999,
        textAlign: 'left',
    }),
    control: (base, state) => ({
        ...base,
        backgroundColor: 'transparent',
        cursor: 'pointer',
        height: '28px',
        minHeight: '30px',
    }),
    singleValue: (base, state) => ({
        ...base,
        color: 'var(--N900)',
        direction: 'rtl',
        textAlign: 'left',
        marginLeft: '2px',
    }),
    indicatorsContainer: (base, state) => ({
        ...base,
        height: '30px',
    }),
    valueContainer: (base, state) => ({
        ...base,
        height: '30px',
        padding: '0 6px',
    }),
}

export const RESOURCE_ACTION_MENU = {
    manifest: 'Manifest',
    Events: 'Events',
    logs: 'Logs',
    terminal: 'Terminal',
    delete: 'Delete',
}

export const ALL_NAMESPACE_OPTION = { value: 'all', label: 'All namespaces' }

export const ORDERED_AGGREGATORS: AggregationKeysType[] = [
    AggregationKeys.Workloads,
    AggregationKeys['Config & Storage'],
    AggregationKeys.Networking,
    AggregationKeys.RBAC,
    AggregationKeys.Administration,
    AggregationKeys['Other Resources'],
    AggregationKeys['Custom Resource'],
]

export const CLUSTER_SELECTION_MESSAGING = {
    title: 'Select a cluster to view Kubernetes resources',
    noResultText: 'No matching clusters',
}

export const CREATE_RESOURCE_MODAL_MESSAGING = {
    title: 'Create Kubernetes Resource',
    creatingObject: {
        title: 'Creating object(s)',
        subTitle: 'Please wait while the object(s) are created.',
    },
    infoMessage:
        'Multi YAML supported. You can create/update multiple K8s resources at once. Make sure you separate the resource YAMLs by ‘---’.',
    actionButtonText: {
        cancel: 'Cancel',
        apply: 'Apply',
        editYAML: 'Edit YAML',
        close: 'Close',
    },
}

export const EVENT_LIST = {
    headerKeys: {
        type: 'Type',
        message: 'Message',
        namespace: 'Namespace',
        involvedObject: 'Involved Object',
        source: 'Source',
        count: 'Count',
        age: 'Age',
        lastSeen: 'Last Seen',
    },
    dataKeys: {
        involvedObject: 'involved object',
        lastSeen: 'last seen',
    },
}

export const K8S_RESOURCE_LIST = {
    tabError: {
        maxTabTitle: 'Max 5 tabs allowed',
        maxTabSubTitle: 'Please close an open tab and try again.',
    },
}

export const DELETE_MODAL_MESSAGING = {
    description: 'Are you sure, you want to delete this resource?',
    checkboxText: 'Force delete resource',
}

export const SIDEBAR_KEYS = {
    events: 'Events',
    namespaces: 'Namespaces',
    eventGVK: {
        Group: 'events.k8s.io',
        Version: 'v1',
        Kind: 'Event',
    },
    namespaceGVK: {
        Group: '',
        Version: 'v1',
        Kind: 'Namespace',
    },
}
