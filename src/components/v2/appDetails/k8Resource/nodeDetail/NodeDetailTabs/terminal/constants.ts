export const TERMINAL_TEXT = {
    CONNECTION_TIMEOUT: 'Connection timed out. Please',
    CHECK_POD_EVENTS: 'check pod events',
    FOR_ERRORS: 'for errors.',
    RETRY_CONNECTION: 'Retry connection',
    CASE_OF_ERROR: 'in case of no error.',
    POD_TERMINATED: 'Pod was terminated. Reason: ',
    INITIATE_CONNECTION: ' Initiate new connection',
    OFFLINE_CHECK_CONNECTION: 'You’re offline. Please check your internet connection.',
    CONCURRENT_LIMIT_REACH: 'Concurrent connection limit reached.',
    TERMINATE_RETRY: 'Terminate all and retry',
}

export const TERMINAL_STATUS = {
    CREATE: 'create',
    AUTO_SELECT_NODE: 'autoSelectNode',
    SHELL: 'shell',
    TIMEDOUT: 'timedOut',
    FAILED: 'failed',
    SUCCEDED: 'Succeded',
    TERMINATED: 'Terminated',
    RUNNING: 'Running',
}

export const TERMINAL_RESOURCE_GA = {
    POD: 'POD',
    CONTAINER: 'CONTAINER',
    SHELL: 'SHELL',
}

export const termialGAEvents = (actionType, terminalViewProps) => {
    switch (actionType) {
        case TERMINAL_RESOURCE_GA.POD:
            return {
                category: 'Terminal',
                action: `Selected Pod`,
                label: `${terminalViewProps.nodeName}/${terminalViewProps.containerName}/${terminalViewProps.shell.value}`,
            }
        case TERMINAL_RESOURCE_GA.CONTAINER:
            return {
                category: 'Terminal',
                action: `Selected Container`,
                label: `${terminalViewProps.nodeName}/${terminalViewProps.containerName}/${terminalViewProps.shell.value}`,
            }
        case TERMINAL_RESOURCE_GA.SHELL:
            return {
                category: 'Terminal',
                action: `Selected Shell`,
                label: `${terminalViewProps.nodeName}/${terminalViewProps.containerName}/${terminalViewProps.shell.value}`,
            }
    }
}

export const MANIFEST_SELECTION_MESSAGE = {
    EDIT_MANIFEST: 'Edit manifest',
    REVIEW_CHANGES: 'Review & Save changes',
    APPLY_CHANGES: 'Apply changes',
    CANCEL: 'Cancel',
}

export enum EditModeType {
    EDIT = 'edit',
    REVIEW = 'review',
    APPLY = 'apply',
    NON_EDIT = 'nonEdit',
}

export enum TerminalWrapperType {
    CREATABLE_SELECT = 'creatableSelect',
    CONNECTION_BUTTON = 'connectionButton',
    TITLE_NAME = 'titleName',
    CLOSE_EXPAND_VIEW = 'closeExpandView',
    REACT_SELECT = 'reactSelect',
    CONNCTION_SWITCH = 'connectionSwitch',
    CLEAR_BUTTON = 'clearButton',
    MANIFEST_EDIT_BUTTONS = 'manifestEditButtons',
    DEBUG_MODE_TOGGLE_BUTTON = 'debugModeToggleButton',
    CUSTOM_COMPONENT = 'customComponent',
}
