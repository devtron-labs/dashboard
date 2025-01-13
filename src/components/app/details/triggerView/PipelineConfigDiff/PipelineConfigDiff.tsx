import { useLocation } from 'react-router-dom'

import {
    DEPLOYMENT_CONFIG_DIFF_SORT_KEY,
    DeploymentConfigDiff,
    DeploymentConfigDiffProps,
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
    const onSorting = () => handleSorting(DEPLOYMENT_CONFIG_DIFF_SORT_KEY)

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
