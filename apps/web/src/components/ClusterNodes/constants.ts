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

import { multiSelectStyles } from '../v2/common/ReactSelectCustomization'
import { ColumnMetadataType, EFFECT_TYPE } from './types'

export const clusterSelectStyle = {
    ...multiSelectStyles,
    menu: (base) => ({
        ...base,
        zIndex: 9999,
        textAlign: 'left',
        minWidth: '150px',
        maxWidth: '300px',
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
        sortType: 'string',
        columnIndex: 5,
        label: 'Node Group',
        value: 'nodeGroup',
        isSortingAllowed: true,
        isDefault: true,
        sortingFieldName: 'nodeGroup',
    },
    {
        sortType: 'number',
        columnIndex: 6,
        label: 'No.of pods',
        value: 'podCount',
        isDefault: true,
        isSortingAllowed: true,
        sortingFieldName: 'podCount',
    },
    {
        sortType: 'number',
        columnIndex: 7,
        label: 'Taints',
        value: 'taintCount',
        isDefault: true,
        isSortingAllowed: true,
        sortingFieldName: 'taintCount',
    },
    {
        sortType: 'number',
        columnIndex: 8,
        label: 'CPU Usage (%)',
        value: 'cpu.usagePercentage',
        isDefault: true,
        isSortingAllowed: true,
        sortingFieldName: 'cpu.usagePercentage',
    },
    {
        sortType: 'number',
        columnIndex: 9,
        label: 'CPU Usage (Absolute)',
        value: 'cpu.usage',
        isSortingAllowed: true,
        sortingFieldName: 'cpu.usageInBytes',
    },
    {
        sortType: 'number',
        columnIndex: 10,
        label: 'CPU Allocatable',
        value: 'cpu.allocatable',
        isSortingAllowed: true,
        sortingFieldName: 'cpu.allocatableInBytes',
    },
    {
        sortType: 'number',
        columnIndex: 11,
        label: 'Mem Usage (%)',
        value: 'memory.usagePercentage',
        isDefault: true,
        isSortingAllowed: true,
        sortingFieldName: 'memory.usagePercentage',
    },
    {
        sortType: 'number',
        columnIndex: 12,
        label: 'Mem Usage (Absolute)',
        value: 'memory.usage',
        isSortingAllowed: true,
        sortingFieldName: 'memory.usageInBytes',
    },
    {
        sortType: 'number',
        columnIndex: 13,
        label: 'Mem Allocatable',
        value: 'memory.allocatable',
        isSortingAllowed: true,
        sortingFieldName: 'memory.allocatableInBytes',
    },
    {
        sortType: 'string',
        columnIndex: 14,
        label: 'Age',
        value: 'age',
        isDefault: true,
        isSortingAllowed: true,
        sortingFieldName: 'createdAt',
    },
    { sortType: 'boolean', columnIndex: 15, label: 'Unschedulable', value: 'unschedulable' },
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
        description: 'Blocks new pod scheduling on this node',
    },
    {
        label: EFFECT_TYPE.PreferNoSchedule,
        value: EFFECT_TYPE.PreferNoSchedule,
        description: 'Avoids scheduling new pods on this node when possible',
    },
    {
        label: EFFECT_TYPE.NoExecute,
        value: EFFECT_TYPE.NoExecute,
        description: 'Blocks new pods and removes existing ones from this node',
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
        infoText: 'Enabling this field will delete the pods using empty directory data when the node is drained.',
    },
    DisableEviction: {
        heading: 'Disable eviction (use with caution)',
        infoText: `Enabling this field will force drain to use delete, even if eviction is supported. This will bypass checking PodDisruptionBudgets.
            Note: Make sure to use with caution.`,
    },
    ForceDrain: {
        heading: 'Force drain',
        infoText:
            'Enabling this field will force drain a node even if there are pods that do not declare a controller.',
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

export const CLUSTER_TERMINAL_MESSAGING = {
    CUSTOM_PATH: 'Use custom image: Enter path for publicly available image',
    SELECT_UTILITY:
        'Select image you want to run inside the pod. Images contain utility tools (eg. kubectl, helm,curl,',
    NETSHOOT: 'netshoot',
    BUSYBOX: 'busybox',
    DEBUG_CLUSTER: ') which can be used to debug clusters and workloads.',
    PUBLIC_IMAGE: 'You can use publicly available custom images as well.',
    DEBUG_MODE_TEXT: `The debug mode is helpful in scenarios where you can't access your Node by using an SSH connection. When enabled, a pod is created on the node, which opens an interactive shell on the Node.`,
}

export const SELECT_TITLE = {
    CLUSTER: 'Cluster',
    NODE: 'Node',
    NAMESPACE: 'Namespace',
    IMAGE: 'Image',
    TERMINAL: 'Terminal',
    POD_EVENTS: 'Pod Events',
    POD_MANIFEST: 'Pod Manifest',
    SHELL: 'Shell',
}

export const AUTO_SELECT = { label: 'Auto select', value: 'autoSelectNode' }

export const NODE_SEARCH_TEXT = {
    NAME: 'name',
    LABEL: 'label',
    LABELS: 'labels',
    NODE_GROUP: 'nodeGroup',
} as const

export const clusterImageSelect = {
    ...clusterSelectStyle,
    menu: (base, state) => ({
        ...base,
        zIndex: 9999,
        textAlign: 'left',
        maxWidth: '380px',
        minWidth: '350px',
    }),
    control: (base, state) => ({
        ...clusterSelectStyle.control(base, state),
        maxWidth: '300px',
    }),
}

export const SEARCH_OPTION_LABEL = {
    NAME: NODE_SEARCH_TEXT.NAME,
    LABEL: NODE_SEARCH_TEXT.LABEL,
    NODE_GROUP: NODE_SEARCH_TEXT.NODE_GROUP,
    NODE_GROUP_TEXT: 'node group',
}

export const NodeSearchOption = [
    { value: 1, label: SEARCH_OPTION_LABEL.NAME, type: 'main' },
    { value: 2, label: SEARCH_OPTION_LABEL.LABEL, type: 'main' },
    { value: 3, label: SEARCH_OPTION_LABEL.NODE_GROUP, type: 'main' },
]

export const nodeSelect = {
    ...clusterSelectStyle,
    group: (base) => ({
        ...base,
        paddingTop: 0,
        paddingBottom: 0,
    }),
    menu: (base) => ({
        ...base,
        zIndex: 9999,
        width: '300px',
    }),
    groupHeading: (base) => ({
        ...base,
        fontWeight: 600,
        fontSize: '12px',
        textTransform: 'lowercase',
        height: '28px',
        color: 'var(--N900)',
        backgroundColor: 'var(--N100)',
        marginBottom: 0,
    }),
}
export const DEFAULT_MARKDOWN_EDITOR_PREVIEW_MESSAGE = `
<br>
Nothing to preview
`
export const CLUSTER_DESCRIPTION_UPDATE_MSG = 'Saved changes'
export const CLUSTER_DESCRIPTION_EMPTY_ERROR_MSG =
    'Readme cannot be empty. Please add some information or cancel the changes.'
export const CLUSTER_DESCRIPTION_UNSAVED_CHANGES_MSG = 'Are you sure you want to discard your changes?'
export const defaultClusterNote = `## Describe this cluster
Describe your Kubernetes cluster in a few words. This will help others understand the purpose and configuration of your cluster. For example, you might mention the number of worker nodes, the types of applications running on the cluster, or any relevant security considerations. Keep it concise and informative!
`
export const defaultClusterShortDescription = 'Write a short description for this cluster'

export const MARKDOWN_EDITOR_COMMANDS = [
    [
        'header',
        'bold',
        'italic',
        'strikethrough',
        'link',
        'quote',
        'code',
        'image',
        'unordered-list',
        'ordered-list',
        'checked-list',
    ],
]

export enum MARKDOWN_EDITOR_COMMAND_TITLE {
    HEADER = 'header',
    BOLD = 'bold',
    ITALIC = 'italic',
    STRIKETHROUGH = 'strikethrough',
    LINK = 'link',
    QUOTE = 'quote',
    CODE = 'code',
    IMAGE = 'image',
    UNORDERED_LIST = 'unordered-list',
    ORDERED_LIST = 'ordered-list',
    CHECKED_LIST = 'checked-list',
}

export enum CLUSTER_PAGE_TAB {
    DETAILS = 'Cluster Detail',
    ABOUT = 'About Cluster',
}

export enum SocketConnectionType {
    CONNECTING = 'CONNECTING',
    CONNECTED = 'CONNECTED',
    DISCONNECTING = 'DISCONNECTING',
    DISCONNECTED = 'DISCONNECTED',
}

export const ERROR_MESSAGE = {
    UNAUTHORIZED: 'Not authorized. You do not have permission to access the terminal for this application.',
}

export const POD_LINKS = {
    POD_MANIFEST: 'View/Edit Pod Manifest',
    POD_EVENTS: 'View Pod Events',
}

export interface ErrorMessageType {
    message: string
    reason: string
}

export const MARKDOWN_EDITOR_COMMAND_ICON_TIPPY_CONTENT = {
    [MARKDOWN_EDITOR_COMMAND_TITLE.HEADER]: 'Add heading text',
    [MARKDOWN_EDITOR_COMMAND_TITLE.BOLD]: 'Add bold text',
    [MARKDOWN_EDITOR_COMMAND_TITLE.ITALIC]: 'Add italic text',
    [MARKDOWN_EDITOR_COMMAND_TITLE.STRIKETHROUGH]: 'Add strikethrough text',
    [MARKDOWN_EDITOR_COMMAND_TITLE.LINK]: 'Add a link',
    [MARKDOWN_EDITOR_COMMAND_TITLE.QUOTE]: 'Add a quote',
    [MARKDOWN_EDITOR_COMMAND_TITLE.CODE]: 'Add code',
    [MARKDOWN_EDITOR_COMMAND_TITLE.IMAGE]: 'Add image via link',
    [MARKDOWN_EDITOR_COMMAND_TITLE.UNORDERED_LIST]: 'Add a bulleted list',
    [MARKDOWN_EDITOR_COMMAND_TITLE.ORDERED_LIST]: 'Add a numbered list',
    [MARKDOWN_EDITOR_COMMAND_TITLE.CHECKED_LIST]: 'Add a task list',
}

export enum MD_EDITOR_TAB {
    WRITE = 'write',
    PREVIEW = 'preview',
}

export const PRE_FETCH_DATA_MESSAGING = {
    SELECTING_NODE: 'Selecting a node',
    SELECTED: 'selected',
    CREATING_PODS: 'Creating pod.',
    SWITCHING_SHELL: 'Switching shell to',
    SUCCEEDED_LINK: ' \u001b[38;5;35mSucceeded\u001b[0m',
    CONNECTING_TO_POD: 'Connecting to pod terminal.',
    TIMED_OUT_LINK: ' \u001b[38;5;196mTimed out\u001b[0m',
    FAILED_TEXT: '  \u001b[38;5;196mFailed\u001b[0m',
    CHECK_POD_EVENTS: ` | \u001b[38;5;110m\u001b[4m${POD_LINKS.POD_EVENTS}\u001b[0m`,
    CHECK_POD_MANIFEST: `\u001b[38;5;110m\u001b[4m${POD_LINKS.POD_MANIFEST}\u001b[0m`,
    MULTIPLE_CONTAINER: 'Multiple containers detected. Connecting to first container',
}

export const defaultManifestErrorText =
    "# Please edit the object below. Lines beginning with a '#' will be ignored,\n# and an empty file will abort the edit. If an error occurs while saving this file will be\n# reopened with the relevant failures.\n# \n"

export const manifestCommentsRegex = /^(.*?apiVersion:)/s
