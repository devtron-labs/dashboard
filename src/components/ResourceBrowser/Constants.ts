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

import { Nodes } from '@devtron-labs/devtron-fe-common-lib'
import ICArrowUpCircle from '@Icons/ic-arrow-up-circle.svg'
import { AggregationKeys, AggregationKeysType } from '../app/types'
import { multiSelectStyles } from '../v2/common/ReactSelectCustomization'
import { RBSidebarKeysType, NODE_SEARCH_KEYS } from './Types'

export const FILTER_SELECT_COMMON_STYLES = {
    ...multiSelectStyles,
    menu: (base) => ({
        ...base,
        zIndex: 5,
        textAlign: 'left',
        backgroundColor: 'var(--bg-menu-primary)',
        border: '1px solid var(--N200)',
    }),
    control: (base, state) => ({
        ...base,
        height: '28px',
        minHeight: '32px',
        borderColor: 'none',
        boxShadow: 'none',
        border: state.isFocused && !state.isDisabled ? '1px solid var(--B500)' : '1px solid var(--N200)',
        backgroundColor: state.isDisabled ? 'var(--N100)' : 'var(--bg-secondary)',
        pointerEvents: 'auto',
        cursor: state.isDisabled ? 'not-allowed' : 'pointer',
    }),
    singleValue: (base) => ({
        ...base,
        color: 'var(--N900)',
        direction: 'rtl',
        textAlign: 'left',
        marginLeft: '2px',
    }),
    indicatorsContainer: (base) => ({
        ...base,
        height: '32px',
    }),
    valueContainer: (base) => ({
        ...base,
        display: 'flex',
        height: '32px',
        padding: '0 6px',
    }),
    input: (base) => ({
        ...base,
        paddingLeft: '24px',
        color: 'var(--N900)',
    }),
}

export const KIND_SEARCH_COMMON_STYLES = {
    ...FILTER_SELECT_COMMON_STYLES,
    control: (base, state) => ({
        ...FILTER_SELECT_COMMON_STYLES.control(base, state),
        border: state.isFocused ? '1px solid var(--B500)' : 'none',
        backgroundColor: state.isFocused ? 'var(--bg-secondary)' : 'var(--bg-primary)',
        cursor: 'text',
    }),
    input: (base) => ({
        ...base,
        color: 'var(--N900)',
        paddingLeft: '24px',
        maxWidth: '135px',
    }),
    valueContainer: (base) => ({
        ...FILTER_SELECT_COMMON_STYLES.valueContainer(base),
        height: 'inherit',
    }),
    indicatorsContainer: (base) => ({
        ...base,
        height: '0px',
    }),
    option: (base, state) => ({
        ...base,
        backgroundColor: state.isFocused ? 'var(--bg-secondary)' : 'var(--bg-transparent)',
        color: 'var(--N900)',
        textOverflow: 'ellipsis',
        fontWeight: '500',
        overflow: 'hidden',
        textAlign: 'left',
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        fontSize: '13px',
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
export const NAMESPACE_NOT_APPLICABLE_OPTION = {
    label: 'Namespace: Not applicable',
    value: 'not-applicable',
}
export const NAMESPACE_NOT_APPLICABLE_TEXT = 'Namespace is not applicable for this resource kind'
export const CLUSTER_NOT_REACHABLE = 'Cluster is not reachable'

export const ORDERED_AGGREGATORS: AggregationKeysType[] = [
    AggregationKeys.Nodes,
    AggregationKeys.Events,
    AggregationKeys.Namespaces,
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
        gptWidgetButton: '',
    },
    dataKeys: {
        involvedObject: 'involved object',
        lastSeen: 'last seen',
    },
}

export const SIDEBAR_KEYS: RBSidebarKeysType = {
    nodes: 'Nodes',
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
    nodeGVK: {
        Group: '',
        Version: '',
        Kind: 'Node' as Nodes,
    },
    overviewGVK: {
        Group: '',
        Version: '',
        Kind: Nodes.Overview,
    },
    monitoringGVK: {
        Group: '',
        Version: '',
        Kind: Nodes.MonitoringDashboard,
    },
    upgradeClusterGVK: {
        Group: '',
        Version: '',
        Kind: Nodes.UpgradeCluster,
    },
}

export const UPGRADE_CLUSTER_CONSTANTS = {
    DYNAMIC_TITLE: 'Upgrade Compatibility',
    ICON_PATH: ICArrowUpCircle,
    ID_PREFIX: SIDEBAR_KEYS.upgradeClusterGVK.Kind.toLowerCase(),
    NAME: SIDEBAR_KEYS.upgradeClusterGVK.Kind.toLowerCase(),
}

export const JUMP_TO_KIND_SHORT_NAMES: Record<string, string[] | null> = {
    events: null,
    nodes: null,
    namespaces: null,
}

export const MARK_AS_STALE_DATA_CUT_OFF_MINS = 15
export const STALE_DATA_WARNING_TEXT = 'The resource data might be stale. You can sync to get the latest data.'
export const ERROR_SCREEN_SUBTITLE =
    'You don’t have permission for any Kubernetes resources. You can request permission from a super admin user.'
export const ERROR_SCREEN_LEARN_MORE = 'Learn about Kubernetes resource permissions.'
export const clusterOverviewNodeText = (isOverview) =>
    `To view ${isOverview ? 'Cluster overview' : 'Nodes'}, you must have view permission to at least one environment for this cluster. This access can be granted through Devtron Apps or Helm Apps permissions`
export const LEARN_MORE = 'Learn more.'

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
export const NODE_DETAILS_PAGE_SIZE_OPTIONS = [
    { value: 20, selected: true },
    { value: 40, selected: false },
    { value: 50, selected: false },
]

export const TRYING_TO_CONNECT = 'Trying to connect to the Kubernetes cluster and fetch resources.'
export const TAKING_LONGER_TO_CONNECT =
    'It is taking longer than usual to connect to the cluster. If cluster is reachable it may take up to 30 seconds.'
export const SELECTE_CLUSTER_STATE_MESSAGING = {
    heading: 'Select a cluster to view Kubernetes resources',
    infoText: 'All Kubernetes resources in the selected cluster will be shown here',
    altText: 'No Cluster Selected',
}

export const SEARCH_QUERY_PARAM_KEY = 'search'

export const CONNECTION_TIMEOUT_TIME = 10000

export const DEFAULT_K8SLIST_PAGE_SIZE = 100

export const TARGET_K8S_VERSION_SEARCH_KEY = 'targetK8sVersion'

export const NODE_LIST_HEADERS = [
    'name',
    'status',
    'roles',
    'errors',
    'k8s version',
    'node group',
    'pods',
    'taints',
    'cpu usage (%)',
    'cpu usage (absolute)',
    'cpu allocatable',
    'mem usage (%)',
    'mem usage (absolute)',
    'mem allocatable',
    'age',
    'unschedulable',
] as const

export const MANDATORY_NODE_LIST_HEADERS: Array<(typeof NODE_LIST_HEADERS)[number]> = [
    'name',
    'status',
    'errors',
] as const

export const OPTIONAL_NODE_LIST_HEADERS = NODE_LIST_HEADERS.filter(
    (header) => !MANDATORY_NODE_LIST_HEADERS.includes(header),
)

export const NODE_LIST_HEADERS_TO_KEY_MAP: Record<(typeof NODE_LIST_HEADERS)[number], string> = {
    name: 'name',
    status: 'status',
    roles: 'roles',
    errors: 'errorCount',
    'k8s version': 'k8sVersion',
    'node group': 'nodeGroup',
    pods: 'podCount',
    taints: 'taintCount',
    'cpu usage (%)': 'cpu.usagePercentage',
    'cpu usage (absolute)': 'cpu.usage',
    'cpu allocatable': 'cpu.allocatable',
    'mem usage (%)': 'memory.usagePercentage',
    'mem usage (absolute)': 'memory.usageInBytes',
    'mem allocatable': 'memory.allocatable',
    age: 'age',
    unschedulable: 'unschedulable',
} as const

export const NODE_SEARCH_KEY_OPTIONS = [
    { value: NODE_SEARCH_KEYS.NAME, label: 'Name' },
    { value: NODE_SEARCH_KEYS.LABEL, label: 'Label' },
    { value: NODE_SEARCH_KEYS.NODE_GROUP, label: 'Node group' },
] as const

export const DEFAULT_NODE_K8S_VERSION = {
    label: 'K8s version: Any',
    value: 'K8s version: Any',
}

export const NODE_SEARCH_KEY_PLACEHOLDER: Record<NODE_SEARCH_KEYS, string> = {
    [NODE_SEARCH_KEYS.NAME]: 'Search by node name Eg. ip-172-31-2-152.us-east-2.compute.internal',
    [NODE_SEARCH_KEYS.LABEL]: 'Search by key=value Eg. environment=production, tier=frontend',
    [NODE_SEARCH_KEYS.NODE_GROUP]: 'Search by node group name Eg. mainnode',
}

export const NODE_SEARCH_KEYS_TO_OBJECT_KEYS: Record<
    NODE_SEARCH_KEYS,
    (typeof NODE_LIST_HEADERS_TO_KEY_MAP)[keyof typeof NODE_LIST_HEADERS_TO_KEY_MAP]
> = {
    [NODE_SEARCH_KEYS.LABEL]: 'labels',
    [NODE_SEARCH_KEYS.NAME]: 'name',
    [NODE_SEARCH_KEYS.NODE_GROUP]: 'nodeGroup',
}

export const LOCAL_STORAGE_EXISTS = !!(Storage && localStorage)

export const LOCAL_STORAGE_KEY_FOR_APPLIED_COLUMNS = 'appliedColumns'

export const NODE_K8S_VERSION_FILTER_KEY = 'k8sVersion'

export const MONITORING_DASHBOARD_TAB_ID = 'monitoring_dashboard'

// Note: can't change the snake case to camel case since that would be breaking change
// while reading from local storage in useTabs
export enum ResourceBrowserTabsId {
    k8s_Resources = 'k8s_resources',
    log_analyzer = 'log_analyzer',
    terminal = 'cluster_terminal',
    cluster_overview = 'overview',
}
