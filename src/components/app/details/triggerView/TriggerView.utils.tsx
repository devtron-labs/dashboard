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

import { useLocation } from 'react-router-dom'

import { DeploymentWithConfigType } from '@devtron-labs/devtron-fe-common-lib'

import { URLS } from '@Config/routes'

import { deepEqual } from '../../../common'
import { DeploymentHistoryDetail } from '../cdDetails/cd.type'
import { TRIGGER_VIEW_PARAMS } from './Constants'
import { TriggerViewDeploymentConfigType } from './types'

export const DEPLOYMENT_CONFIGURATION_NAV_MAP = {
    DEPLOYMENT_TEMPLATE: {
        key: 'deploymentTemplate',
        displayName: 'Deployment Template',
        isMulti: false,
    },
    PIPELINE_STRATEGY: {
        key: 'pipelineStrategy',
        displayName: 'Pipeline Configuration',
        isMulti: false,
    },
    CONFIGMAP: {
        key: 'configMap',
        displayName: 'ConfigMaps',
        isMulti: true,
    },
    SECRET: {
        key: 'secret',
        displayName: 'Secrets',
        isMulti: true,
    },
}

export const SPECIFIC_TRIGGER_CONFIG_OPTION = {
    label: 'Config deployed with selected image',
    value: DeploymentWithConfigType.SPECIFIC_TRIGGER_CONFIG,
    description: 'Use configuration deployed with selected image',
}

export const LAST_SAVED_CONFIG_OPTION = {
    label: 'Last saved config',
    value: DeploymentWithConfigType.LAST_SAVED_CONFIG,
    description: 'Use last saved configuration to deploy',
}

export const LATEST_TRIGGER_CONFIG_OPTION = {
    label: 'Last deployed config',
    value: DeploymentWithConfigType.LATEST_TRIGGER_CONFIG,
    description: 'Retain currently deployed configuration',
}

export const getDeployConfigOptions = (isRollbackTriggerSelected: boolean, isRecentDeployConfigPresent: boolean) => {
    const configOptionsList = [
        {
            label: 'Select a configuration to deploy',
            options: [LAST_SAVED_CONFIG_OPTION],
        },
    ]
    if (isRollbackTriggerSelected) {
        configOptionsList[0].options.push(LATEST_TRIGGER_CONFIG_OPTION, SPECIFIC_TRIGGER_CONFIG_OPTION)
    } else if (isRecentDeployConfigPresent) {
        configOptionsList[0].options.push(LATEST_TRIGGER_CONFIG_OPTION)
    }
    return configOptionsList
}

const compareConfigValues = (configA: DeploymentHistoryDetail, configB: DeploymentHistoryDetail): boolean => {
    if (!configA && !configB) {
        return false
    }
    if (
        (configA && !configB) ||
        (!configA && configB) ||
        (configA.values && !configB.values) ||
        (!configA.values && configB.values) ||
        (configA.codeEditorValue?.value && !configB.codeEditorValue?.value) ||
        (!configA.codeEditorValue?.value && configB.codeEditorValue?.value)
    ) {
        return true
    }
    if (!deepEqual(configA.values, configB.values)) {
        return true
    }
    try {
        const parsedEditorValueA = JSON.parse(configA.codeEditorValue.value)
        const parsedEditorValueB = JSON.parse(configB.codeEditorValue.value)

        if (!deepEqual(parsedEditorValueA, parsedEditorValueB)) {
            return true
        }
    } catch {
        return false
    }

    return false
}

const checkForDiffInArray = (
    configA: TriggerViewDeploymentConfigType,
    configB: TriggerViewDeploymentConfigType,
    key: string,
    diffForOptions: Record<string, boolean>,
): Record<string, boolean> => {
    const configOptions = []
    const configValueA = configA[key]
    const configValueB = configB[key]

    if (Array.isArray(configValueA)) {
        configValueA.forEach((navOption) => {
            configOptions.push(navOption.componentName)
        })
    }

    if (Array.isArray(configValueB)) {
        configValueB.forEach((navOption) => {
            if (!configOptions.includes(navOption.componentName)) {
                configOptions.push(navOption.componentName)
            }
        })
    }

    // eslint-disable-next-line no-restricted-syntax
    for (const _cm of configOptions) {
        const _valueA = configValueA?.find((_config) => _config.componentName === _cm)
        const _valueB = configValueB?.find((_config) => _config.componentName === _cm)

        // eslint-disable-next-line no-param-reassign
        diffForOptions[_cm] = compareConfigValues(_valueA, _valueB)
    }

    return diffForOptions
}

export const checkForDiff = (configA: TriggerViewDeploymentConfigType, configB: TriggerViewDeploymentConfigType) => {
    if (!configA || !configB) {
        return null
    }

    let diffForOptions: Record<string, boolean> = {
        deploymentTemplate: compareConfigValues(configA.deploymentTemplate, configB.deploymentTemplate),
        pipelineStrategy: compareConfigValues(configA.pipelineStrategy, configB.pipelineStrategy),
    }

    if (configA.configMap?.length > 0 || configB.configMap?.length > 0) {
        diffForOptions = checkForDiffInArray(configA, configB, 'configMap', diffForOptions)
    }

    if (configA.secret?.length > 0 || configB.secret?.length > 0) {
        diffForOptions = checkForDiffInArray(configA, configB, 'secret', diffForOptions)
    }

    return diffForOptions
}

/**
 * Determines whether the "Webhook Add Image" modal should be rendered based on the current location.
 *
 * This function checks the `location` object to ensure that the modal is not displayed
 * when certain other modals or views are active. Specifically, the modal will not be shown
 * if any of the following conditions are met:
 * - The URL query string contains 'cd-node' or 'rollback-node'.
 * - The URL path includes the `BUILD` route.
 * - The URL path includes the `LINKED_CI_DETAILS` route.
 * - The URL query string contains the `APPROVAL_NODE` parameter.
 *
 * @param location - The current location object, typically obtained from the `useLocation` hook.
 * @returns A boolean indicating whether the "Webhook Add Image" modal should be rendered.
 */
export const shouldRenderWebhookAddImageModal = (location: ReturnType<typeof useLocation>) =>
    !(
        location.search.includes('cd-node') ||
        location.search.includes('rollback-node') ||
        location.search.includes(TRIGGER_VIEW_PARAMS.APPROVAL_NODE) ||
        location.pathname.includes(URLS.BUILD) ||
        location.pathname.includes(URLS.LINKED_CI_DETAILS)
    )
