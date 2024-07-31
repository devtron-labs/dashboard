import { useEffect, useMemo } from 'react'
import { useLocation, useRouteMatch } from 'react-router-dom'

import {
    useUrlFilters,
    SelectPickerOptionType,
    SelectPickerVariantType,
    useAsync,
    ErrorScreenManager,
    DeploymentConfigDiff,
    DeploymentConfigDiffProps,
} from '@devtron-labs/devtron-fe-common-lib'

import {
    AppEnvDeploymentConfigQueryParamsType,
    AppEnvDeploymentConfigType,
} from '@Pages/Applications/DevtronApps/service.types'
import { getAppEnvDeploymentConfig } from '@Pages/Applications/DevtronApps/service'
import { getOptions } from '@Components/deploymentConfig/service'

import { BASE_CONFIGURATIONS } from '../../AppConfig.constants'
import {
    AppEnvDeploymentConfigQueryParams,
    DeploymentConfigCompareProps,
    DeploymentConfigParams,
} from '../../AppConfig.types'
import {
    getCompareEnvironmentSelectorOptions,
    getAppEnvDeploymentConfigList,
    getDefaultVersionAndPreviousDeploymentOptions,
    getEnvironmentIdByEnvironmentName,
    getOptionByValue,
    getPreviousDeploymentOptionValue,
    getPreviousDeploymentValue,
    parseCompareWithSearchParams,
    getEnvironmentConfigTypeOptions,
    isEnvProtected,
} from './utils'

export const DeploymentConfigCompare = ({
    environments,
    appName,
    envName,
    type = 'app',
    goBackURL = '',
    isBaseConfigProtected = false,
}: DeploymentConfigCompareProps) => {
    // HOOKS
    const { path, params } = useRouteMatch<DeploymentConfigParams>()
    const { compareTo, resourceType, resourceName, appId, envId } = params
    const { search } = useLocation()

    // SEARCH PARAMS & SORTING
    const {
        compareWith,
        identifierId,
        pipelineId,
        compareWithIdentifierId,
        compareWithPipelineId,
        compareWithConfigType,
        configType,
        chartRefId,
        updateSearchParams,
        sortBy,
        sortOrder,
        handleSorting,
    } = useUrlFilters<string, AppEnvDeploymentConfigQueryParamsType>({
        parseSearchParams: parseCompareWithSearchParams({ type, compareTo, environments }),
        initialSortKey: 'sort-config',
    })

    // Set default query parameters
    useEffect(() => {
        updateSearchParams({
            configType,
            compareWith,
            compareWithConfigType,
        })
    }, [])

    // ASYNC CALLS
    // Load options for dropdown menus of previous deployments and default versions
    const [optionsLoader, options, optionsErr, reloadOptions] = useAsync(() => {
        let compareToAppId = +appId
        let compareWithAppId = +appId
        let compareToEnvId = getEnvironmentIdByEnvironmentName(environments, compareTo)
        let compareWithEnvId = getEnvironmentIdByEnvironmentName(environments, compareWith)

        if (type === 'appGroup') {
            compareToAppId = getEnvironmentIdByEnvironmentName(environments, compareTo)
            compareWithAppId = getEnvironmentIdByEnvironmentName(environments, compareWith)
            compareToEnvId = +envId
            compareWithEnvId = +envId
        }

        return Promise.all([getOptions(compareToAppId, compareToEnvId), getOptions(compareWithAppId, compareWithEnvId)])
    }, [compareTo, compareWith])

    // Options for previous deployments and default versions
    const currentEnvOptions = useMemo(
        () => (!optionsLoader && options ? getDefaultVersionAndPreviousDeploymentOptions(options[0].result) : null),
        [options, optionsLoader],
    )
    const compareEnvOptions = useMemo(
        () => (!optionsLoader && options ? getDefaultVersionAndPreviousDeploymentOptions(options[1].result) : null),
        [options, optionsLoader],
    )

    // Load data for comparing the two environments
    const [comparisonDataLoader, comparisonData, comparisonDataErr, reloadComparisonData] = useAsync(
        () =>
            Promise.all([
                getAppEnvDeploymentConfig({
                    ...(type === 'app'
                        ? {
                              appName,
                              envName: compareTo || '',
                          }
                        : {
                              appName: compareTo || '',
                              envName,
                          }),
                    configType,
                    identifierId,
                    pipelineId,
                }),
                getAppEnvDeploymentConfig({
                    ...(type === 'app'
                        ? {
                              appName,
                              envName: compareWith || '',
                          }
                        : {
                              appName: compareWith || '',
                              envName,
                          }),
                    configType: compareWithConfigType,
                    identifierId: chartRefId || compareWithIdentifierId,
                    pipelineId: compareWithPipelineId,
                }),
            ]),
        [
            compareTo,
            compareWith,
            compareWithConfigType,
            configType,
            identifierId,
            compareWithIdentifierId,
            pipelineId,
            compareWithPipelineId,
            chartRefId,
        ],
        !!configType && !!compareWithConfigType,
    )

    const reload = () => {
        reloadOptions()
        reloadComparisonData()
    }

    // Generate the deployment configuration list for the environments using comparison data
    const appEnvDeploymentConfigList = useMemo(() => {
        if (!comparisonDataLoader && comparisonData) {
            const currentData = comparisonData[0].result
            const compareData = comparisonData[1].result

            const configData = getAppEnvDeploymentConfigList(currentData, compareData, path, params, search, sortOrder)
            return configData
        }

        return null
    }, [comparisonDataLoader, comparisonData, sortOrder])

    // SELECT PICKER OPTIONS
    /** Compare Environment Select Picker Options  */
    const compareEnvironmentSelectorOptions = getCompareEnvironmentSelectorOptions(
        environments,
        currentEnvOptions?.defaultVersions,
        type,
    )

    // METHODS
    const onCompareEnvironmentChange = ({ value }: SelectPickerOptionType) => {
        if (typeof value === 'number') {
            updateSearchParams({
                chartRefId: value,
                compareWithConfigType: AppEnvDeploymentConfigType.DEFAULT_VERSION,
                compareWithIdentifierId: null,
                compareWithPipelineId: null,
            })
        } else if (typeof value === 'string') {
            updateSearchParams({
                compareWith: value,
                chartRefId: null,
                compareWithIdentifierId: null,
                compareWithPipelineId: null,
                compareWithConfigType:
                    compareWithConfigType === AppEnvDeploymentConfigType.DEFAULT_VERSION ||
                    compareWithConfigType === AppEnvDeploymentConfigType.PREVIOUS_DEPLOYMENTS
                        ? AppEnvDeploymentConfigType.PUBLISHED_ONLY
                        : compareWithConfigType,
            })
        }
    }

    const onEnvironmentConfigTypeChange =
        (isCompare?: boolean) =>
        ({ value }: SelectPickerOptionType) => {
            if (typeof value === 'string') {
                const modifiedValue = getPreviousDeploymentValue(value)
                if (modifiedValue) {
                    updateSearchParams({
                        [isCompare
                            ? AppEnvDeploymentConfigQueryParams.COMPARE_WITH_CONFIG_TYPE
                            : AppEnvDeploymentConfigQueryParams.CONFIG_TYPE]:
                            AppEnvDeploymentConfigType.PREVIOUS_DEPLOYMENTS,
                        ...(!isCompare
                            ? {
                                  identifierId: modifiedValue.identifierId,
                                  pipelineId: modifiedValue.pipelineId,
                              }
                            : {
                                  compareWithIdentifierId: modifiedValue.identifierId,
                                  compareWithPipelineId: modifiedValue.pipelineId,
                              }),
                    })
                } else {
                    updateSearchParams({
                        [isCompare
                            ? AppEnvDeploymentConfigQueryParams.COMPARE_WITH_CONFIG_TYPE
                            : AppEnvDeploymentConfigQueryParams.CONFIG_TYPE]: value,
                        ...(!isCompare
                            ? {
                                  identifierId: null,
                                  pipelineId: null,
                              }
                            : {
                                  compareWithIdentifierId: null,
                                  compareWithPipelineId: null,
                              }),
                    })
                }
            }
        }

    // DeploymentConfigDiff Props
    const renderCompareEnvironmentSelectorProps = () => ({
        id: 'compare-with-environment-selector',
        options: compareEnvironmentSelectorOptions,
        placeholder: 'Select Environment',
        classNamePrefix: 'compare-with-environment-selector',
        inputId: 'compare-with-environment-selector',
        name: 'compare-with-environment-selector',
        variant: SelectPickerVariantType.BORDERLESS,
        value: getOptionByValue(compareEnvironmentSelectorOptions, chartRefId || compareWith, {
            label: BASE_CONFIGURATIONS.name,
            value: '',
        }),
        onChange: onCompareEnvironmentChange,
    })

    const renderEnvironmentConfigTypeSelectorProps = (isCompare?: boolean) => ({
        id: `environment-config-type-selector-${isCompare ? 'compare' : 'current'}`,
        options: getEnvironmentConfigTypeOptions(
            isCompare ? compareEnvOptions?.previousDeployments : currentEnvOptions?.previousDeployments,
            isEnvProtected(environments, isCompare ? compareWith : compareTo, isBaseConfigProtected),
        ),
        placeholder: 'Select State',
        classNamePrefix: 'environment-config-type-selector',
        inputId: `environment-config-type-selector-${isCompare ? 'compare' : 'current'}`,
        name: `environment-config-type-selector-${isCompare ? 'compare' : 'current'}`,
        variant: SelectPickerVariantType.BORDERLESS,
        isSearchable: false,
        value: getOptionByValue(
            getEnvironmentConfigTypeOptions(
                isCompare ? compareEnvOptions?.previousDeployments : currentEnvOptions?.previousDeployments,
                isEnvProtected(environments, isCompare ? compareWith : compareTo, isBaseConfigProtected),
            ),
            !isCompare
                ? getPreviousDeploymentOptionValue(identifierId, pipelineId) || configType
                : getPreviousDeploymentOptionValue(compareWithIdentifierId, compareWithPipelineId) ||
                      compareWithConfigType,
            {
                label: BASE_CONFIGURATIONS.name,
                value: '',
            },
        ),
        onChange: onEnvironmentConfigTypeChange(isCompare),
    })

    const deploymentConfigDiffSelectors: DeploymentConfigDiffProps['selectorsConfig'] = {
        primaryConfig: [
            {
                id: 'compare-with-environment-selector',
                type: 'selectPicker',
                selectPickerProps: renderCompareEnvironmentSelectorProps(),
            },
            ...(compareWithConfigType !== AppEnvDeploymentConfigType.DEFAULT_VERSION
                ? [
                      {
                          id: `environment-config-type-selector-compare`,
                          type: 'selectPicker' as const,
                          selectPickerProps: renderEnvironmentConfigTypeSelectorProps(true),
                      },
                  ]
                : []),
        ],
        secondaryConfig: [
            {
                id: compareTo || BASE_CONFIGURATIONS.name,
                type: 'string',
                text: compareTo || BASE_CONFIGURATIONS.name,
            },
            ...((isEnvProtected(environments, compareTo, isBaseConfigProtected)
                ? [
                      {
                          id: `environment-config-type-selector-current`,
                          type: 'selectPicker',
                          selectPickerProps: renderEnvironmentConfigTypeSelectorProps(),
                      },
                  ]
                : []) as DeploymentConfigDiffProps['selectorsConfig']['secondaryConfig']),
        ],
    }

    const getNavHelpText = () => {
        const chart = currentEnvOptions?.defaultVersions.find(
            ({ chartRefId: _chartRefId }) => _chartRefId === chartRefId,
        )
        const compareWithText = `${chart ? `v${chart.chartVersion}(Default)` : compareWith || BASE_CONFIGURATIONS.name}`
        const compareToText = compareTo || BASE_CONFIGURATIONS.name

        return `Showing files from ${compareWithText} & ${compareToText}`
    }

    // ERROR SCREEN
    if ((comparisonDataErr || optionsErr) && !(comparisonDataLoader || optionsLoader)) {
        return <ErrorScreenManager code={comparisonDataErr?.code || optionsErr?.code} reload={reload} />
    }

    return (
        <DeploymentConfigDiff
            isLoading={comparisonDataLoader || !appEnvDeploymentConfigList || optionsLoader}
            {...appEnvDeploymentConfigList}
            goBackURL={goBackURL}
            selectorsConfig={deploymentConfigDiffSelectors}
            scrollIntoViewId={`${resourceType}-${resourceName}`}
            navHeading={`Comparing ${compareTo || BASE_CONFIGURATIONS.name}`}
            navHelpText={getNavHelpText()}
            sortOrder={sortOrder}
            onSortBtnClick={() => handleSorting(sortBy)}
        />
    )
}
