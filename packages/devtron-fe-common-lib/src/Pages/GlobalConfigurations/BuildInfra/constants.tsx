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

import { ReactComponent as ICCpu } from '../../../Assets/Icon/ic-cpu.svg'
import { ReactComponent as ICMemory } from '../../../Assets/Icon/ic-memory.svg'
import { ReactComponent as ICTimer } from '../../../Assets/Icon/ic-timer.svg'
import { UseBreadcrumbProps } from '../../../Common/BreadCrumb/Types'
import {
    BuildInfraConfigTypes,
    BuildInfraFormFieldType,
    BuildInfraLocators,
    BuildInfraMetaConfigTypes,
    ProfileInputErrorType,
    BuildInfraProfileBase,
    BuildInfraProfileVariants,
    HandleProfileInputChangeType,
} from './types'

export const BUILD_INFRA_INPUT_CONSTRAINTS = {
    // Will not enforce any decimal specification on input field
    STEP: 'any',
    MIN: 0,
    DECIMAL_PLACES: 2,
} as const

export const BUILD_INFRA_TEXT = {
    HEADING: 'Build Infra Configuration',
    EDIT_SUBMIT: 'Save changes',
    SAVE_SUBMIT: 'Save',
    EDIT_CANCEL: 'Cancel',
    EDIT_DEFAULT_TOOLTIP:
        'Efficiently control infrastructure settings such as CPU, Memory, and Build timeout for your build pipelines. Streamline resource management to optimise build time and cost effortlessly.',
    DESCRIPTION_LABEL: 'Description',
    DESCRIPTION_PLACEHOLDER: 'Enter a description here',
    PROFILE_LABEL: 'Profile name',
    PROFILE_PLACEHOLDER: 'Enter a name eg. java/node/small/medium/large',
    INHERITING_HEADING_DESCRIPTION: 'Inheriting from default',
    SUBMIT_BUTTON_TIPPY: {
        INVALID_INPUT: 'Valid input is required for all mandatory fields.',
        REQUEST_IN_PROGRESS: 'Request in progress.',
    },
    VALIDATE_REQUEST_LIMIT: {
        REQUEST_LESS_THAN_LIMIT: 'Request should be less than or equal to limit.',
        CAN_NOT_COMPUTE: 'Request and limit value diff are too high to validate.',
        REQUEST_DECIMAL_PLACES: `Request should be upto ${BUILD_INFRA_INPUT_CONSTRAINTS.DECIMAL_PLACES} decimal places.`,
        LIMIT_DECIMAL_PLACES: `Limit should be upto ${BUILD_INFRA_INPUT_CONSTRAINTS.DECIMAL_PLACES} decimal places.`,
    },
    getInvalidActionMessage: (action: HandleProfileInputChangeType['action']) => `Invalid action type: ${action}`,
    getSubmitSuccessMessage: (profileName: string, isEdited: boolean) =>
        `${profileName} profile is ${isEdited ? 'updated' : 'created'}`,
    PROFILE_NOT_FOUND: {
        title: 'Profile not found',
        subTitle: 'The profile you are looking for does not exist.',
    },
    INVALID_FORM_MESSAGE: 'Valid input is required for all mandatory fields.',
} as const

export const BUILD_INFRA_BREADCRUMB: UseBreadcrumbProps = {
    alias: {
        'global-config': null,
        'build-infra': {
            component: <h2 className="m-0 cn-9 fs-16 fw-6 lh-32">{BUILD_INFRA_TEXT.HEADING}</h2>,
            linked: false,
        },
    },
}

export const BUILD_INFRA_FORM_FIELDS: BuildInfraFormFieldType[] = [
    {
        heading: <h3 className="m-0 cn-9 fs-13 fw-6 lh-20 w-240 dc__no-shrink">CPU (Request - Limit)</h3>,
        marker: ICCpu,
        actions: [
            {
                actionType: BuildInfraConfigTypes.CPU_REQUEST,
                label: 'Request',
                placeholder: 'Type CPU request',
            },
            {
                actionType: BuildInfraConfigTypes.CPU_LIMIT,
                label: 'Limit',
                placeholder: 'Type CPU limit',
            },
        ],
        locator: BuildInfraLocators.CPU,
    },
    {
        heading: <h3 className="m-0 cn-9 fs-13 fw-6 lh-20 w-240 dc__no-shrink">Memory (Request - Limit)</h3>,
        marker: ICMemory,
        actions: [
            {
                actionType: BuildInfraConfigTypes.MEMORY_REQUEST,
                label: 'Request',
                placeholder: 'Type memory request',
            },
            {
                actionType: BuildInfraConfigTypes.MEMORY_LIMIT,
                label: 'Limit',
                placeholder: 'Type memory limit',
            },
        ],
        locator: BuildInfraLocators.MEMORY,
    },
    {
        heading: <h3 className="m-0 cn-9 fs-13 fw-6 lh-20 w-240 dc__no-shrink">Build timeout</h3>,
        marker: ICTimer,
        actions: [
            {
                actionType: BuildInfraConfigTypes.BUILD_TIMEOUT,
                label: 'Timeout',
                placeholder: 'Type build timeout',
            },
        ],
        locator: BuildInfraLocators.BUILD_TIMEOUT,
    },
]

export const PROFILE_INPUT_ERROR_FIELDS = Object.fromEntries(
    Object.values({ ...BuildInfraConfigTypes, ...BuildInfraMetaConfigTypes }).map((value) => [value, null]),
) as ProfileInputErrorType

// fields required to be filled before submitting the form in create view, since we pre-populate the form with default values so no need in configs
export const CREATE_MODE_REQUIRED_INPUT_FIELDS = [BuildInfraMetaConfigTypes.NAME]

export const DEFAULT_PROFILE_NAME = 'default' as const

export const CREATE_PROFILE_BASE_VALUE: BuildInfraProfileBase = {
    name: '',
    description: '',
    type: BuildInfraProfileVariants.NORMAL,
    appCount: 0,
}

export const CREATE_VIEW_CHECKED_CONFIGS = {
    [BuildInfraConfigTypes.CPU_REQUEST]: true,
    [BuildInfraConfigTypes.CPU_LIMIT]: true,
} as const

export const BUILD_INFRA_TEST_IDS = {
    SUBMIT_BUTTON: 'build-infra-submit-button',
    CANCEL_BUTTON: 'build-infra-cancel-button',
} as const
