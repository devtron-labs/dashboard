import { useEffect } from 'react'
import { generatePath, useRouteMatch } from 'react-router-dom'

import { DeploymentConfigDiff, DeploymentConfigDiffProps } from '@Shared/Components/DeploymentConfigDiff'
import { SortingOrder } from '@Common/Constants'
import { useUrlFilters } from '@Common/Hooks'
import {
    getSelectPickerOptionByValue,
    SelectPickerOptionType,
    SelectPickerVariantType,
} from '@Shared/Components/SelectPicker'
import { ComponentSizeType } from '@Shared/constants'

import {
    DeploymentHistoryDiffDetailedProps,
    DeploymentHistoryConfigDiffQueryParams,
    DeploymentHistoryConfigDiffRouteParams,
} from './types'
import { getPipelineDeploymentsOptions, parseDeploymentHistoryDiffSearchParams } from './utils'

export const DeploymentHistoryConfigDiffCompare = ({
    envName,
    setFullScreenView,
    pipelineDeployments,
    wfrId,
    previousWfrId,
    convertVariables,
    setConvertVariables,
    triggerHistory,
    renderRunSource,
    resourceId,
    isCompareDeploymentConfigNotAvailable,
    ...props
}: DeploymentHistoryDiffDetailedProps) => {
    // HOOKS
    const { path, params } = useRouteMatch<DeploymentHistoryConfigDiffRouteParams>()
    const { resourceType, resourceName } = params

    // URL FILTERS
    const { compareWfrId, updateSearchParams, sortBy, sortOrder, handleSorting } = useUrlFilters<
        string,
        DeploymentHistoryConfigDiffQueryParams
    >({
        parseSearchParams: parseDeploymentHistoryDiffSearchParams(previousWfrId),
    })

    useEffect(() => {
        // Default Search Params Update
        updateSearchParams({ compareWfrId })
        // Set fullscreen for comparing deployment history config
        setFullScreenView(true)

        return () => {
            setConvertVariables(false)
            setFullScreenView(false)
        }
    }, [])

    // DEPLOYMENT_CONFIG_DIFF_PROPS
    const { currentDeployment, pipelineDeploymentsOptions } = getPipelineDeploymentsOptions({
        pipelineDeployments,
        wfrId,
        triggerHistory,
        renderRunSource,
        resourceId,
    })
    const previousDeployment = pipelineDeploymentsOptions.find(({ value }) => value === compareWfrId)
    const isPreviousDeploymentConfigAvailable = !!pipelineDeploymentsOptions.length

    const deploymentSelectorOnChange = ({ value }: SelectPickerOptionType<number>) => {
        updateSearchParams({ compareWfrId: value })
    }

    const selectorsConfig: DeploymentConfigDiffProps['selectorsConfig'] = {
        primaryConfig: isPreviousDeploymentConfigAvailable
            ? [
                  {
                      id: 'deployment-config-diff-deployment-selector',
                      type: 'selectPicker',
                      selectPickerProps: {
                          name: 'deployment-config-diff-deployment-selector',
                          inputId: 'deployment-config-diff-deployment-selector',
                          classNamePrefix: 'deployment-config-diff-deployment-selector',
                          variant: SelectPickerVariantType.BORDER_LESS,
                          options: pipelineDeploymentsOptions,
                          placeholder: 'Select Deployment',
                          value: getSelectPickerOptionByValue(pipelineDeploymentsOptions, compareWfrId, null),
                          onChange: deploymentSelectorOnChange,
                          showSelectedOptionIcon: false,
                          menuSize: ComponentSizeType.large,
                      },
                  },
              ]
            : [
                  {
                      id: 'no-previous-deployment',
                      type: 'string',
                      text: 'No previous deployment',
                  },
              ],
        secondaryConfig: [
            {
                id: 'base-configuration',
                type: 'string',
                text: `Deployed on ${currentDeployment}`,
            },
        ],
    }

    const getNavHelpText = () => {
        if (isPreviousDeploymentConfigAvailable) {
            return isCompareDeploymentConfigNotAvailable
                ? `Diff unavailable: Configurations for deployment execution ‘${previousDeployment?.label || 'N/A'}’ not found`
                : `Showing diff in configuration deployed on: ${previousDeployment?.label || 'N/A'} & ${currentDeployment}`
        }

        return null
    }

    const onSorting = () => handleSorting(sortOrder !== SortingOrder.DESC ? 'sort-config' : '')

    const sortingConfig: DeploymentConfigDiffProps['sortingConfig'] = {
        handleSorting: onSorting,
        sortBy,
        sortOrder,
    }

    const scopeVariablesConfig: DeploymentConfigDiffProps['scopeVariablesConfig'] = {
        convertVariables,
        onConvertVariablesClick: () => setConvertVariables(!convertVariables),
    }

    return (
        <DeploymentConfigDiff
            {...props}
            showDetailedDiffState
            navHeading={`Comparing ${envName}`}
            headerText={!isPreviousDeploymentConfigAvailable ? '' : undefined} // using `undefined` to ensure component picks default value
            scrollIntoViewId={`${resourceType}${resourceName ? `-${resourceName}` : ''}`}
            navHelpText={getNavHelpText()}
            isNavHelpTextShowingError={isCompareDeploymentConfigNotAvailable}
            goBackURL={generatePath(path.split('/:resourceType')[0], { ...params })}
            selectorsConfig={selectorsConfig}
            sortingConfig={sortingConfig}
            scopeVariablesConfig={scopeVariablesConfig}
        />
    )
}
