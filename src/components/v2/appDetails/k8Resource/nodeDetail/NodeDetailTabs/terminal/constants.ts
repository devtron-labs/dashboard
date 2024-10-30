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
    CONNECTION_SWITCH = 'connectionSwitch',
    CLEAR_BUTTON = 'clearButton',
    MANIFEST_EDIT_BUTTONS = 'manifestEditButtons',
    DEBUG_MODE_TOGGLE_BUTTON = 'debugModeToggleButton',
    CUSTOM_COMPONENT = 'customComponent',
    DOWNLOAD_FILE_FOLDER = 'downloadFileFolder',
    UPLOAD_FILE_FOLDER = 'uploadFileFolder'
}
