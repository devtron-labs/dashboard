import { useEffect, useMemo } from 'react'
import { useRouteMatch } from 'react-router-dom'

import {
    useUrlFilters,
    SelectPickerOptionType,
    SelectPickerVariantType,
    useAsync,
    DeploymentConfigDiff,
    DeploymentConfigDiffProps,
    SortingOrder,
    AppEnvDeploymentConfigType,
    getDefaultVersionAndPreviousDeploymentOptions,
    getAppEnvDeploymentConfigList,
    getSelectPickerOptionByValue,
    EnvResourceType,
} from '@devtron-labs/devtron-fe-common-lib'

import { getChartReferencesForAppAndEnv } from '@Services/service'
import { getOptions } from '@Components/deploymentConfig/service'

import { BASE_CONFIGURATIONS } from '../../AppConfig.constants'
import {
    AppEnvDeploymentConfigQueryParams,
    AppEnvDeploymentConfigQueryParamsType,
    DeploymentConfigCompareProps,
    DeploymentConfigParams,
} from '../../AppConfig.types'
import {
    getCompareEnvironmentSelectorOptions,
    getEnvironmentIdByEnvironmentName,
    getPreviousDeploymentOptionValue,
    getPreviousDeploymentValue,
    parseCompareWithSearchParams,
    getEnvironmentConfigTypeOptions,
    isEnvProtected,
    getConfigChartRefId,
    getManifestRequestValues,
    getDeploymentConfigDiffTabs,
} from './utils'
import { getConfigDiffData, getDeploymentTemplateData, getManifestData } from './service.utils'

export const DeploymentConfigCompare = ({
    environments,
    appName,
    envName,
    type = 'app',
    goBackURL = '',
    isBaseConfigProtected = false,
    getNavItemHref,
}: DeploymentConfigCompareProps) => {
    // HOOKS
    const { path, params } = useRouteMatch<DeploymentConfigParams>()
    const { compareTo, resourceType, resourceName, appId, envId } = params

    // CONSTANTS
    const isManifestView = resourceType === EnvResourceType.Manifest

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
        manifestChartRefId,
        compareWithManifestChartRefId,
        updateSearchParams,
        sortBy,
        sortOrder,
        handleSorting,
    } = useUrlFilters<string, AppEnvDeploymentConfigQueryParamsType>({
        parseSearchParams: parseCompareWithSearchParams({ type, compareTo, environments }),
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

    // Load chartReferences for the environment
    const [chartReferencesLoader, chartReferences, chartReferencesErr, reloadChartReferences] = useAsync(
        () =>
            Promise.all([
                getChartReferencesForAppAndEnv(+appId, getEnvironmentIdByEnvironmentName(environments, compareTo)),
                getChartReferencesForAppAndEnv(+appId, getEnvironmentIdByEnvironmentName(environments, compareWith)),
            ]),
        [isManifestView, appId, compareTo, compareWith],
        isManifestView,
    )

    useEffect(() => {
        if (!chartReferencesLoader && chartReferences) {
            const currentChartRefId = getConfigChartRefId(chartReferences[0].result)
            const compareChartRefId = getConfigChartRefId(chartReferences[1].result)

            updateSearchParams({
                manifestChartRefId: currentChartRefId,
                compareWithManifestChartRefId: compareChartRefId,
            })
        }

        return null
    }, [chartReferencesLoader, chartReferences])

    const fetchManifestData = async () => {
        const [{ result: currentList }, { result: compareList }] = await Promise.all([
            getDeploymentTemplateData({ type, appName, envName, configType, compareName: compareTo }),
            getDeploymentTemplateData({
                type,
                appName,
                envName,
                configType: compareWithConfigType,
                compareName: compareWith,
            }),
        ])

        const currentManifestRequestValues = getManifestRequestValues(currentList)
        const compareManifestRequestValues = getManifestRequestValues(compareList)

        const _manifestChartRefId = currentManifestRequestValues?.chartRefId ?? manifestChartRefId
        const _compareWithManifestChartRefId = compareManifestRequestValues?.chartRefId ?? compareWithManifestChartRefId

        updateSearchParams({
            manifestChartRefId: _manifestChartRefId,
            compareWithManifestChartRefId: _compareWithManifestChartRefId,
        })

        return Promise.all([
            getManifestData({
                appId: +appId,
                envId: envId ? +envId : null,
                manifestChartRefId: _manifestChartRefId,
                configType,
                values: currentManifestRequestValues?.data,
                identifierId,
                pipelineId,
            }),
            getManifestData({
                appId: +appId,
                envId: compareWith ? getEnvironmentIdByEnvironmentName(environments, compareWith) : null,
                manifestChartRefId: _compareWithManifestChartRefId,
                configType: compareWithConfigType,
                values: compareManifestRequestValues?.data,
                identifierId: compareWithIdentifierId,
                pipelineId: compareWithPipelineId,
            }),
        ])
    }

    // Load data for comparing the two environments
    const [comparisonDataLoader, comparisonData, comparisonDataErr, reloadComparisonData] = useAsync(
        () =>
            isManifestView
                ? fetchManifestData()
                : Promise.all([
                      getConfigDiffData({
                          type,
                          appName,
                          envName,
                          compareName: compareTo,
                          configType,
                          identifierId,
                          pipelineId,
                      }),
                      getConfigDiffData({
                          type,
                          appName,
                          envName,
                          compareName: compareWith,
                          configType: compareWithConfigType,
                          identifierId: chartRefId || compareWithIdentifierId,
                          pipelineId: compareWithPipelineId,
                      }),
                  ]),
        [
            isManifestView,
            compareTo,
            compareWith,
            compareWithConfigType,
            configType,
            identifierId,
            compareWithIdentifierId,
            pipelineId,
            compareWithPipelineId,
            chartRefId,
            manifestChartRefId,
            compareWithManifestChartRefId,
        ],
        isManifestView
            ? !!manifestChartRefId && !!compareWithManifestChartRefId
            : !!configType && !!compareWithConfigType,
    )

    const reload = () => {
        reloadOptions()
        reloadComparisonData()
        reloadChartReferences()
    }

    // Generate the deployment configuration list for the environments using comparison data
    const appEnvDeploymentConfigList = useMemo(() => {
        if (!comparisonDataLoader && comparisonData) {
            const [{ result: currentList }, { result: compareList }] = comparisonData

            const configData = getAppEnvDeploymentConfigList({
                currentList,
                compareList,
                getNavItemHref,
                sortOrder,
                isManifestView,
            })
            return configData
        }

        return null
    }, [comparisonDataLoader, comparisonData, sortOrder, isManifestView])

    // SELECT PICKER OPTIONS
    /** Compare Environment Select Picker Options  */
    const compareEnvironmentSelectorOptions = getCompareEnvironmentSelectorOptions(
        environments,
        currentEnvOptions?.defaultVersions,
        type,
    )

    // METHODS
    const onCompareEnvironmentChange = ({ value }: SelectPickerOptionType) => {
        handleSorting('')

        if (typeof value === 'number') {
            updateSearchParams({
                chartRefId: value,
                compareWithManifestChartRefId: isManifestView ? value : null,
                compareWithConfigType: AppEnvDeploymentConfigType.DEFAULT_VERSION,
                compareWithIdentifierId: null,
                compareWithPipelineId: null,
            })
        } else if (typeof value === 'string') {
            updateSearchParams({
                compareWith: value,
                chartRefId: null,
                manifestChartRefId: null,
                compareWithManifestChartRefId: null,
                compareWithIdentifierId: null,
                compareWithPipelineId: null,
                compareWithConfigType: AppEnvDeploymentConfigType.PUBLISHED_ONLY,
            })
        }
    }

    const onEnvironmentConfigTypeChange =
        (isCompare?: boolean) =>
        ({ value }: SelectPickerOptionType) => {
            handleSorting('')

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
                                  manifestChartRefId: isManifestView ? modifiedValue.chartRefId : null,
                              }
                            : {
                                  compareWithIdentifierId: modifiedValue.identifierId,
                                  compareWithPipelineId: modifiedValue.pipelineId,
                                  compareWithManifestChartRefId: isManifestView ? modifiedValue.chartRefId : null,
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
                                  manifestChartRefId: isManifestView ? manifestChartRefId : null,
                              }
                            : {
                                  compareWithIdentifierId: null,
                                  compareWithPipelineId: null,
                                  compareWithManifestChartRefId: isManifestView ? compareWithManifestChartRefId : null,
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
        variant: SelectPickerVariantType.BORDER_LESS,
        value: getSelectPickerOptionByValue(compareEnvironmentSelectorOptions, chartRefId || compareWith, {
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
            isManifestView,
        ),
        placeholder: 'Select State',
        classNamePrefix: 'environment-config-type-selector',
        inputId: `environment-config-type-selector-${isCompare ? 'compare' : 'current'}`,
        name: `environment-config-type-selector-${isCompare ? 'compare' : 'current'}`,
        variant: SelectPickerVariantType.BORDER_LESS,
        isSearchable: false,
        disableDescriptionEllipsis: true,
        value: getSelectPickerOptionByValue(
            getEnvironmentConfigTypeOptions(
                isCompare ? compareEnvOptions?.previousDeployments : currentEnvOptions?.previousDeployments,
                isEnvProtected(environments, isCompare ? compareWith : compareTo, isBaseConfigProtected),
                isManifestView,
            ),
            !isCompare
                ? getPreviousDeploymentOptionValue(identifierId, pipelineId, manifestChartRefId) || configType
                : getPreviousDeploymentOptionValue(
                      compareWithIdentifierId,
                      compareWithPipelineId,
                      compareWithManifestChartRefId,
                  ) || compareWithConfigType,
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
            ...(compareWithConfigType !== AppEnvDeploymentConfigType.DEFAULT_VERSION &&
            (compareEnvOptions?.previousDeployments.length ||
                isEnvProtected(environments, compareWith, isBaseConfigProtected))
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
            ...((currentEnvOptions?.previousDeployments.length ||
            isEnvProtected(environments, compareTo, isBaseConfigProtected)
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

    const getNavHelpText = (): DeploymentConfigDiffProps['navHelpText'] => {
        if (isManifestView) {
            return `The manifest is generated locally from the configuration files. Server-side testing of chart validity (eg. whether an API is supported) is NOT done. K8s based templating may be different depending on cluster version.`
        }

        const chart = currentEnvOptions?.defaultVersions.find(
            ({ chartRefId: _chartRefId }) => _chartRefId === chartRefId,
        )
        const compareWithText = `${chart ? `v${chart.chartVersion}(Default)` : compareWith || BASE_CONFIGURATIONS.name}`
        const compareToText = compareTo || BASE_CONFIGURATIONS.name

        return `Showing files from ${compareWithText} & ${compareToText}`
    }

    const deploymentConfigDiffTabs = getDeploymentConfigDiffTabs(path, params)

    const onTabClick = (tab: string) => {
        const _isManifestView = tab === deploymentConfigDiffTabs[1].value
        if (!_isManifestView) {
            updateSearchParams({
                manifestChartRefId: null,
                compareWithManifestChartRefId: null,
            })
        }
    }

    const tabConfig: DeploymentConfigDiffProps['tabConfig'] = {
        tabs: deploymentConfigDiffTabs,
        onClick: onTabClick,
    }

    const onSorting = () => handleSorting(sortOrder !== SortingOrder.DESC ? 'sort-config' : '')

    const sortingConfig: DeploymentConfigDiffProps['sortingConfig'] = {
        handleSorting: onSorting,
        sortBy,
        sortOrder,
    }

    return (
        <DeploymentConfigDiff
            isLoading={comparisonDataLoader || !appEnvDeploymentConfigList || optionsLoader}
            errorConfig={{
                error:
                    (comparisonDataErr || optionsErr || chartReferencesErr) &&
                    !(comparisonDataLoader || optionsLoader || chartReferencesLoader),
                code: comparisonDataErr?.code || optionsErr?.code || chartReferencesErr?.code,
                reload,
            }}
            {...appEnvDeploymentConfigList}
            goBackURL={goBackURL}
            selectorsConfig={deploymentConfigDiffSelectors}
            scrollIntoViewId={`${resourceType}${resourceName ? `-${resourceName}` : ''}`}
            navHeading={`Comparing ${compareTo || BASE_CONFIGURATIONS.name}`}
            navHelpText={getNavHelpText()}
            tabConfig={tabConfig}
            sortingConfig={!isManifestView ? sortingConfig : null}
        />
    )
}
