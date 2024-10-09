import { DeploymentConfigDiff, DeploymentConfigDiffProps, SortingOrder } from '@devtron-labs/devtron-fe-common-lib'

import { PipelineConfigDiffProps } from './types'

export const PipelineConfigDiff = ({
    deploymentConfigSelectorProps,
    scopeVariablesConfig,
    urlFilters,
    ...props
}: PipelineConfigDiffProps) => {
    // SEARCH PARAMS & SORTING
    const { resourceName, resourceType, sortBy, sortOrder, handleSorting } = urlFilters

    // METHODS
    const onSorting = () => handleSorting(sortOrder !== SortingOrder.DESC ? 'sort-config' : '')

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
        />
    )
}
