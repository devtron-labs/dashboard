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

export const NO_WORKFLOW_NAME = 'Please enter workflow name'
export const MIN_3CHARS = 'Min 3 chars'
export const MAX_30CHARS = 'Max 30 chars'
export const INVALID_WORKFLOW_NAME =
    'Start with alphabet; End with alphanumeric; Use only lowercase; Allowed:(-); Do not use "spaces"'
export const SUCCESS_CREATION = 'Empty Workflow Created successfully'

export const CHANGE_CI_TOOLTIP = {
    TITLE: 'Change image source',
    DISABLED: 'Can not change image source since no image source is present.',
}

export const WORKFLOW_EDITOR_HEADER_TIPPY = {
    HEADING: 'Workflow Editor',
    INFO_TEXT: {
        JOB_VIEW:
            'Configure job pipelines to be executed. Pipelines can be configured to be triggered automatically based on code change or time.',
        DEFAULT: 'Workflow consist of pipelines from build to deployment stages of an application.',
    },
    DOCUMENTATION_LINK_TEXT: 'Learn more',
}
