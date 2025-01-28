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

import {
    DEPLOYMENT_CONFIG_DIFF_SORT_KEY,
    DeploymentConfigDiff,
    DeploymentConfigDiffProps,
    SortingOrder,
} from '@devtron-labs/devtron-fe-common-lib'

import { URLS } from '@Config/routes'

import { PipelineConfigDiffProps } from './types'

export const PipelineConfigDiff = ({
    deploymentConfigSelectorProps,
    scopeVariablesConfig,
    urlFilters,
    ...props
}: PipelineConfigDiffProps) => {
    // HOOKS
    const { pathname } = useLocation()

    // SEARCH PARAMS & SORTING
    const { sortBy, sortOrder, handleSorting } = urlFilters

    // Extracting resourceType and resourceName from the pathname.
    // No route parameters are used here; they are only appended when the diff is opened.
    const [resourceType, resourceName] = pathname.split(`${URLS.APP_DIFF_VIEW}/`)[1].split('/')

    // METHODS
    const onSorting = () => handleSorting(sortOrder !== SortingOrder.DESC ? DEPLOYMENT_CONFIG_DIFF_SORT_KEY : '')

    // SELECTORS CONFIG
    const pipelineConfigDiffSelectors: DeploymentConfigDiffProps['selectorsConfig'] = {
        primaryConfig: [
            {
                id: 'last-deployed-configuration',
                type: 'string',
                text: 'Last Deployed Configuration',
            },
        ],
        secondaryConfig: [
            {
                id: 'deploy',
                type: 'string',
                text: 'Deploy:',
            },
            {
                id: 'deployment-config-selector',
                type: 'selectPicker',
                selectPickerProps: deploymentConfigSelectorProps,
            },
        ],
        hideDivider: true,
    }

    const sortingConfig: DeploymentConfigDiffProps['sortingConfig'] = {
        handleSorting: onSorting,
        sortBy,
        sortOrder,
    }

    return (
        <DeploymentConfigDiff
            {...props}
            goBackURL="" // to hide cross button
            selectorsConfig={pipelineConfigDiffSelectors}
            scrollIntoViewId={`${resourceType}${resourceName ? `-${resourceName}` : ''}`}
            navHeading="Deployment Configuration"
            headerText=""
            sortingConfig={sortingConfig}
            scopeVariablesConfig={scopeVariablesConfig}
            renderedInDrawer
            showDetailedDiffState
        />
    )
}
