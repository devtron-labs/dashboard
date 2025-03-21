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

import { useEffect, useMemo, useRef, useState } from 'react'
import { generatePath, useHistory, useLocation, useRouteMatch } from 'react-router-dom'

import {
    useUrlFilters,
    SelectPickerOptionType,
    SelectPickerVariantType,
    useAsync,
    DeploymentConfigDiff,
    DeploymentConfigDiffProps,
    AppEnvDeploymentConfigType,
    getDefaultVersionAndPreviousDeploymentOptions,
    getAppEnvDeploymentConfigList,
    getSelectPickerOptionByValue,
    EnvResourceType,
    BASE_CONFIGURATION_ENV_ID,
    useMainContext,
    getCompareSecretsData,
    getAppEnvDeploymentConfig,
    DEPLOYMENT_CONFIG_DIFF_SORT_KEY,
    SortingOrder,
} from '@devtron-labs/devtron-fe-common-lib'

import { getTemplateOptions, getChartReferencesForAppAndEnv } from '@Services/service'

import { BASE_CONFIGURATIONS } from '../../AppConfig.constants'
import {
    AppEnvDeploymentConfigQueryParams,
    AppEnvDeploymentConfigQueryParamsType,
    DeploymentConfigCompareProps,
    DeploymentConfigParams,
} from '../../AppConfig.types'
import {
    getCompareEnvironmentSelectorOptions,
    getPreviousDeploymentOptionValue,
    getPreviousDeploymentValue,
    parseCompareWithSearchParams,
    getEnvironmentConfigTypeOptions,
    getConfigChartRefId,
    getManifestRequestValues,
    deploymentConfigDiffTabs,
    getDeploymentConfigDiffTabs,
    getAppAndEnvIds,
    isConfigTypeNonDraftOrPublished,
    isConfigTypePublished,
    getAppEnvDeploymentConfigPayload,
    getIdentifierIdBasedOnConfiguration,
} from './utils'
import { getDeploymentTemplateData, getManifestData } from './service.utils'
import { DeploymentConfigComparisonDataType } from './types'

export const DeploymentConfigCompare = ({
    environments,
    appName,
    envName,
    type = 'app',
    goBackURL = '',
    overwriteNavHeading,
    getNavItemHref,
    appOrEnvIdToResourceApprovalConfigurationMap,
}: DeploymentConfigCompareProps) => {
    // HOOKS
    const { push } = useHistory()
    const { path, params } = useRouteMatch<DeploymentConfigParams>()
    const { compareTo, resourceType, resourceName, appId, envId } = params
    const location = useLocation()
    const { isSuperAdmin } = useMainContext()

    // STATES
    const [convertVariables, setConvertVariables] = useState(false)
    const isDefaultLandingPreviousDeploymentSet = useRef<boolean>(false)

    // GLOBAL CONSTANTS
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

    useEffect(() => {
        // Set default initial sorting
        if (!isManifestView && sortBy !== DEPLOYMENT_CONFIG_DIFF_SORT_KEY) {
            handleSorting(DEPLOYMENT_CONFIG_DIFF_SORT_KEY)
        }
    }, [])

    useEffect(() => {
        // Set default query parameters
        updateSearchParams({
            configType,
            compareWith,
            compareWithConfigType,
        })
    }, [isManifestView])

    // CONSTANTS
    const { compareToAppId, compareToEnvId, compareWithAppId, compareWithEnvId } = useMemo(
        () =>
            getAppAndEnvIds({
                type,
                environments,
                appId,
                envId,
                compareWith,
                compareTo,
            }),
        [type, compareWith, compareTo, appId, envId, environments],
    )
    const isBaseConfigProtected =
        appOrEnvIdToResourceApprovalConfigurationMap?.[BASE_CONFIGURATION_ENV_ID]?.isApprovalApplicable

    // STATES
    const [selectedTab, setSelectedTab] = useState(
        isManifestView ? deploymentConfigDiffTabs.MANIFEST : deploymentConfigDiffTabs.CONFIGURATION,
    )

    // ASYNC CALLS
    // Load options for dropdown menus of previous deployments and default versions
    const [optionsLoader, options, optionsErr, reloadOptions] = useAsync(
        () =>
            Promise.all([
                getTemplateOptions(compareToAppId, compareToEnvId),
                getTemplateOptions(compareWithAppId, compareWithEnvId),
            ]),
        [compareToAppId, compareToEnvId, compareWithAppId, compareWithEnvId, isManifestView],
    )

    // Options for previous deployments and default versions
    const currentEnvOptions = useMemo(
        () => (!optionsLoader && options ? getDefaultVersionAndPreviousDeploymentOptions(options[0].result) : null),
        [options, optionsLoader],
    )
    const compareEnvOptions = useMemo(
        () => (!optionsLoader && options ? getDefaultVersionAndPreviousDeploymentOptions(options[1].result) : null),
        [options, optionsLoader],
    )

    useEffect(() => {
        if (!compareEnvOptions || isDefaultLandingPreviousDeploymentSet.current) {
            return
        }

        isDefaultLandingPreviousDeploymentSet.current = true

        if (!compareEnvOptions.previousDeployments?.length) {
            updateSearchParams({
                compareWith: null,
            })

            return
        }

        const previousDeploymentData = compareEnvOptions.previousDeployments[0]

        updateSearchParams({
            [AppEnvDeploymentConfigQueryParams.COMPARE_WITH_CONFIG_TYPE]:
                AppEnvDeploymentConfigType.PREVIOUS_DEPLOYMENTS,
            compareWithIdentifierId: isManifestView
                ? previousDeploymentData.deploymentTemplateHistoryId
                : previousDeploymentData.wfrId,
            compareWithPipelineId: previousDeploymentData.pipelineId,
            compareWithManifestChartRefId: isManifestView ? previousDeploymentData.chartRefId : null,
        })
    }, [compareEnvOptions])

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

        // Fetch chart references based on chartRefIds.
        // For draft configurations, chartRefId may not exist.
        // This applies when the config type is either 'PUBLISHED_ONLY' or 'PUBLISHED_WITH_DRAFT' (Saved with draft).
        const chartReferences = await Promise.all([
            !currentManifestRequestValues?.chartRefId && isConfigTypePublished(configType)
                ? getChartReferencesForAppAndEnv(compareToAppId, compareToEnvId, false)
                : null,
            !compareManifestRequestValues?.chartRefId && isConfigTypePublished(compareWithConfigType)
                ? getChartReferencesForAppAndEnv(compareWithAppId, compareWithEnvId, false)
                : null,
        ])
        const currentChartRefId = chartReferences[0] ? getConfigChartRefId(chartReferences[0].result) : null
        const compareChartRefId = chartReferences[1] ? getConfigChartRefId(chartReferences[1].result) : null

        const _manifestChartRefId = currentManifestRequestValues?.chartRefId ?? currentChartRefId ?? manifestChartRefId
        const _compareWithManifestChartRefId =
            compareManifestRequestValues?.chartRefId ?? compareChartRefId ?? compareWithManifestChartRefId

        return Promise.all([
            getManifestData({
                appId,
                envId,
                type,
                environments,
                compareName: compareTo,
                configType,
                manifestChartRefId: _manifestChartRefId,
                values: currentManifestRequestValues?.data,
                identifierId,
                pipelineId,
            }),
            getManifestData({
                appId,
                envId,
                type,
                environments,
                compareName: compareWith,
                configType: compareWithConfigType,
                manifestChartRefId: _compareWithManifestChartRefId,
                values: compareManifestRequestValues?.data,
                identifierId: compareWithIdentifierId,
                pipelineId: compareWithPipelineId,
            }),
        ])
    }

    const getComparisonData = async (): Promise<DeploymentConfigComparisonDataType> => {
        if (isManifestView) {
            const manifestData = await fetchManifestData()

            return {
                isManifestComparison: true,
                manifestData,
            }
        }

        // NOTE: ensure order of compare_to (rhs) and compare_with (lhs)
        const payloads = [
            getAppEnvDeploymentConfigPayload({
                type,
                appName,
                envName,
                compareName: compareTo,
                configType,
                identifierId,
                pipelineId,
            }),
            getAppEnvDeploymentConfigPayload({
                type,
                appName,
                envName,
                compareName: compareWith,
                configType: compareWithConfigType,
                identifierId: chartRefId || compareWithIdentifierId,
                pipelineId: compareWithPipelineId,
            }),
        ] as const

        const [secretsData, ...appConfigData] = await Promise.all([
            !isSuperAdmin ? getCompareSecretsData([...payloads]) : null,
            getAppEnvDeploymentConfig({
                params: payloads[0],
                appId,
                isTemplateView: false,
            }),
            getAppEnvDeploymentConfig({
                params: payloads[1],
                appId,
                isTemplateView: false,
            }),
        ])

        secretsData?.forEach((data, index) => {
            if (!appConfigData[index].result.isAppAdmin) {
                appConfigData[index].result.secretsData = data.secretsData
            }
        })

        return {
            isManifestComparison: false,
            appConfigData,
        }
    }

    // Load data for comparing the two environments
    const [comparisonDataLoader, comparisonData, comparisonDataErr, reloadComparisonData] = useAsync(
        getComparisonData,
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
            ? (!isConfigTypeNonDraftOrPublished(configType) || !!manifestChartRefId) &&
                  (!isConfigTypeNonDraftOrPublished(compareWithConfigType) || !!compareWithManifestChartRefId)
            : !!configType && !!compareWithConfigType,
    )

    const reload = () => {
        setConvertVariables(false)
        reloadOptions()
        reloadComparisonData()
    }

    // Generate the deployment configuration list for the environments using comparison data
    const appEnvDeploymentConfigList = useMemo(() => {
        if (!comparisonDataLoader && comparisonData) {
            const { isManifestComparison, appConfigData, manifestData } = comparisonData

            if (isManifestComparison) {
                const [{ result: currentList }, { result: compareList }] = manifestData
                return getAppEnvDeploymentConfigList({
                    currentList,
                    compareList,
                    getNavItemHref,
                    isManifestView: true,
                })
            }

            const [{ result: currentList }, { result: compareList }] = appConfigData
            if (options) {
                return getAppEnvDeploymentConfigList({
                    currentList,
                    compareList,
                    getNavItemHref,
                    isManifestView,
                    convertVariables,
                    compareToTemplateOptions: options[0].result,
                    compareWithTemplateOptions: options[1].result,
                    sortingConfig: { sortBy, sortOrder },
                })
            }
        }

        return null
    }, [comparisonDataLoader, comparisonData, isManifestView, convertVariables, options, sortBy, sortOrder])

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
                                  manifestChartRefId: null,
                              }
                            : {
                                  compareWithIdentifierId: null,
                                  compareWithPipelineId: null,
                                  compareWithManifestChartRefId: null,
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

    const getIdentifierForApprovalConfig = (isCompare: boolean) => {
        if (isCompare) {
            if (type === 'appGroup') {
                return compareWithAppId
            }

            return compareWithEnvId
        }
        if (type === 'appGroup') {
            return compareToAppId
        }
        return compareToEnvId
    }

    const renderEnvironmentConfigTypeSelectorProps = (isCompare?: boolean) => {
        const identifier = getIdentifierForApprovalConfig(isCompare)
        const isEnvProtected =
            appOrEnvIdToResourceApprovalConfigurationMap?.[identifier]?.isApprovalApplicable ?? isBaseConfigProtected

        return {
            id: `environment-config-type-selector-${isCompare ? 'compare' : 'current'}`,
            options: getEnvironmentConfigTypeOptions(
                isCompare ? compareEnvOptions?.previousDeployments : currentEnvOptions?.previousDeployments,
                isEnvProtected,
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
                    isEnvProtected,
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
        }
    }

    const deploymentConfigDiffSelectors: DeploymentConfigDiffProps['selectorsConfig'] = {
        primaryConfig: [
            {
                id: 'compare-with-environment-selector',
                type: 'selectPicker',
                selectPickerProps: renderCompareEnvironmentSelectorProps(),
            },
            ...(compareWithConfigType !== AppEnvDeploymentConfigType.DEFAULT_VERSION &&
            ((compareEnvOptions?.previousDeployments.length ||
                appOrEnvIdToResourceApprovalConfigurationMap?.[getIdentifierForApprovalConfig(true)]
                    ?.isApprovalApplicable) ??
                isBaseConfigProtected)
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
            ...(((currentEnvOptions?.previousDeployments.length ||
                appOrEnvIdToResourceApprovalConfigurationMap?.[getIdentifierForApprovalConfig(false)]
                    ?.isApprovalApplicable) ??
            isBaseConfigProtected
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

    const onTabClick = (tab: string) => {
        setSelectedTab(tab)
        const _isManifestView = tab === deploymentConfigDiffTabs.MANIFEST
        if (_isManifestView) {
            setConvertVariables(false)
        }

        const currentSearchParams = new URLSearchParams(location.search)

        // NOTE: need to find the corresponding chartRefId(s) for compareWith and compareTo
        // and set/delete them based on _isManifestView
        const _compareWithManifestChartRefId =
            chartRefId ??
            (currentSearchParams.has('compareWithIdentifierId') && _isManifestView
                ? compareEnvOptions.previousDeployments.find(
                      (prev) => prev.wfrId === Number(currentSearchParams.get('compareWithIdentifierId')),
                  )?.chartRefId ?? null
                : null)

        const _manifestChartRefId =
            currentSearchParams.has('identifierId') && _isManifestView
                ? currentEnvOptions.previousDeployments.find(
                      (prev) => prev.wfrId === Number(currentSearchParams.get('identifierId')),
                  )?.chartRefId ?? null
                : null

        if (identifierId) {
            currentSearchParams.set(
                'identifierId',
                getIdentifierIdBasedOnConfiguration({
                    identifierId,
                    isManifestView: _isManifestView,
                    previousDeployments: currentEnvOptions.previousDeployments,
                }),
            )
        }

        if (compareWithIdentifierId) {
            currentSearchParams.set(
                'compareWithIdentifierId',
                getIdentifierIdBasedOnConfiguration({
                    identifierId: compareWithIdentifierId,
                    isManifestView: _isManifestView,
                    previousDeployments: compareEnvOptions.previousDeployments,
                }),
            )
        }

        if (_compareWithManifestChartRefId) {
            currentSearchParams.set('compareWithManifestChartRefId', String(_compareWithManifestChartRefId))
        } else {
            // NOTE: make sure to not set null as URLSearchParams will save the null as string
            // i.e suppose we save 'hello' = null, we get ?hello=null as search param
            currentSearchParams.delete('compareWithManifestChartRefId')
        }

        if (_manifestChartRefId) {
            currentSearchParams.set('manifestChartRefId', String(_manifestChartRefId))
        } else {
            currentSearchParams.delete('manifestChartRefId')
        }

        push({
            pathname: generatePath(path, {
                ...params,
                resourceType: _isManifestView ? EnvResourceType.Manifest : EnvResourceType.DeploymentTemplate,
                resourceName: null,
            }),
            search: currentSearchParams.toString(),
        })
    }

    const tabConfig: DeploymentConfigDiffProps['tabConfig'] = {
        tabs: getDeploymentConfigDiffTabs(),
        activeTab: selectedTab,
        onClick: onTabClick,
    }

    const onSorting = () => handleSorting(sortOrder !== SortingOrder.DESC ? DEPLOYMENT_CONFIG_DIFF_SORT_KEY : '')

    const sortingConfig: DeploymentConfigDiffProps['sortingConfig'] = {
        handleSorting: onSorting,
        sortBy,
        sortOrder,
    }

    const scopeVariablesConfig: DeploymentConfigDiffProps['scopeVariablesConfig'] = {
        convertVariables,
        onConvertVariablesClick: () => setConvertVariables(!convertVariables),
    }

    // DATA CONSTANTS
    const isLoading = comparisonDataLoader || optionsLoader
    const isError = !!(comparisonDataErr || optionsErr)

    return (
        <DeploymentConfigDiff
            isLoading={isLoading || (!isError && !appEnvDeploymentConfigList)}
            errorConfig={{
                error: !isLoading && isError,
                code: comparisonDataErr?.code || optionsErr?.code,
                reload,
            }}
            {...appEnvDeploymentConfigList}
            goBackURL={goBackURL}
            selectorsConfig={deploymentConfigDiffSelectors}
            scrollIntoViewId={`${resourceType}${resourceName ? `-${resourceName}` : ''}`}
            navHeading={overwriteNavHeading || `Comparing ${compareTo || BASE_CONFIGURATIONS.name}`}
            navHelpText={getNavHelpText()}
            tabConfig={tabConfig}
            sortingConfig={!isManifestView ? sortingConfig : null}
            scopeVariablesConfig={!isManifestView ? scopeVariablesConfig : null}
        />
    )
}
