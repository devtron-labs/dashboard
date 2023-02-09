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
        height: '28px',
        minHeight: '32px',
        border: state.isFocused && !state.isDisabled ? '1px solid #06c' : '1px solid #d6dbdf',
        backgroundColor: state.isDisabled ? 'var(--N100)' : 'var(--N000)',
        pointerEvents: 'auto',
        cursor: state.isDisabled ? 'not-allowed' : 'pointer',
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
        height: '32px',
    }),
    valueContainer: (base, state) => ({
        ...base,
        display: 'flex',
        height: '32px',
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

export const K8S_EMPTY_GROUP = 'k8sEmptyGroup'
export const ALL_NAMESPACE_OPTION = { value: 'all', label: 'All namespaces' }
export const NAMESPACE_NOT_APPLICABLE_OPTION = {
    label: 'Namespace: Not applicable',
    value: 'not-applicable',
}
export const NAMESPACE_NOT_APPLICABLE_TEXT = 'Namespace is not applicable for this resource kind'
export const CLUSTER_NOT_REACHABLE = 'Cluster is not reachable'

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
    createResource: 'Create / Update Kubernetes Resources',
}

export const DELETE_MODAL_MESSAGING = {
    description: 'Are you sure, you want to delete this resource?',
    checkboxText: 'Force delete resource',
}

export const SIDEBAR_KEYS = {
    events: 'Events',
    namespaces: 'Namespaces',
    eventGVK: {
        Group: '',
        Version: '',
        Kind: 'Event',
    },
    namespaceGVK: {
        Group: '',
        Version: '',
        Kind: 'Namespace',
    },
}

export const MARK_AS_STALE_DATA_CUT_OFF_MINS = 13
export const STALE_DATA_WARNING_TEXT = 'The resource data might be stale. You can sync to get the latest data.'
export const ERROR_SCREEN_SUBTITLE =
    'You don’t have permission for any Kubernetes resources. You can request permission from a super admin user.'
export const ERROR_SCREEN_LEARN_MORE = 'Learn about Kubernetes resource permissions.'

export const RESOURCE_LIST_ERROR_STATE = {
    title: 'Some error occured',
    subTitle: (label: string): string => `Kubernetes resources for the cluster ‘${label}’ could not be fetched`,
    actionButtonText: 'Change cluster',
}

export const RESOURCE_LIST_EMPTY_STATE = {
    title: 'No matching results',
    subTitle: (kind: string): string => `We could not find any matching ${kind || 'resource'}.`,
}

export const RESOURCE_EMPTY_PAGE_STATE = {
    title: (kind: string) => `No ${kind || 'resource'} found`,
    subTitle: (kind: string, namespaced: boolean) =>
        `We could not find any ${kind || 'resource'}. Try selecting a different cluster${
            namespaced ? ' or namespace.' : '.'
        }`,
}

export const RESOURCE_PAGE_SIZE_OPTIONS = [
    { value: 100, selected: true },
    { value: 150, selected: false },
    { value: 200, selected: false },
]

export const TRYING_TO_CONNECT = 'Trying to connect to the Kubernetes cluster and fetch resources.'
export const TAKING_LONGER_TO_CONNECT =
    'Is taking longer than usual to connect to the cluster. If cluster is reachable it may take up to 30 seconds.'
export const SELECTE_CLUSTER_STATE_MESSAGING = {
    heading: 'Select a cluster to view Kubernetes resources',
    infoText: 'All Kubernetes resources in the selected cluster will be shown here',
    altText: 'No Cluster Selected',
}
