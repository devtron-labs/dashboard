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
}

export const GA_CONST = {
    POD: 'POD',
    CONTAINER: 'CONTAINER',
    SHELL: 'SHELL',
}

export const termialGAEvents = (actionType, terminalViewProps) => {
    switch (actionType) {
        case GA_CONST.POD:
            return {
                category: 'Terminal',
                action: `Selected Pod`,
                label: `${terminalViewProps.nodeName}/${terminalViewProps.containerName}/${terminalViewProps.shell.value}`,
            }
        case GA_CONST.CONTAINER:
            return {
                category: 'Terminal',
                action: `Selected Container`,
                label: `${terminalViewProps.nodeName}/${terminalViewProps.containerName}/${terminalViewProps.shell.value}`,
            }
        case GA_CONST.SHELL:
            return {
                category: 'Terminal',
                action: `Selected Shell`,
                label: `${terminalViewProps.nodeName}/${terminalViewProps.containerName}/${terminalViewProps.shell.value}`,
            }
    }
}
