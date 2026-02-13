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

import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import {
    AppEnvDeploymentConfigType,
    DEPLOYMENT_CONFIG_DIFF_SORT_KEY,
    DeploymentConfigDiffProps,
    DeploymentConfigDiffState,
    DeploymentHistorySingleValue,
    DeploymentStrategyType,
    DeploymentWithConfigType,
    EnvResourceType,
    getAppEnvDeploymentConfig,
    getAppEnvDeploymentConfigList,
    getCompareSecretsData,
    getDefaultVersionAndPreviousDeploymentOptions,
    getDeploymentManifest,
    showError,
    TemplateListType,
    useAsync,
    useMainContext,
    useQuery,
    useUrlFilters,
    YAMLStringify,
} from '@devtron-labs/devtron-fe-common-lib'

import { URLS } from '@Config/routes'
import { getChartList } from '@Pages/Applications/DevtronApps/Details/AppConfigurations/MainContent/DeploymentTemplate/service'
import { deploymentConfigDiffTabs, getDeploymentConfigDiffTabs } from '@Pages/Shared'
import { getTemplateOptions } from '@Services/service'

import {
    PipelineConfigDiffQueryParams,
    PipelineConfigDiffQueryParamsType,
    UsePipelineDeploymentConfigProps,
} from './types'
import {
    getComparisonDataBasedOnDeployAndStrategy,
    getPipelineDeploymentConfigErrFromPromiseSettled,
    getPipelineDeploymentConfigFromPromiseSettled,
    getPipelineDeploymentConfigSelectorConfig,
    parseCompareWithSearchParams,
} from './utils'

export const usePipelineDeploymentConfig = ({
    appId,
    envId,
    appName,
    envName,
    isRollbackTriggerSelected,
    pipelineId,
    wfrId,
    deploymentStrategy,
    setDeploymentStrategy,
    pipelineStrategyOptions,
    isCDNode,
}: UsePipelineDeploymentConfigProps) => {
    // HOOKS
    const { pathname, search } = useLocation()
    const navigate = useNavigate()
    const { isSuperAdmin } = useMainContext()

    // STATES
    const [convertVariables, setConvertVariables] = useState(false)

    const [resourceTypeParam] = (pathname.split(`${URLS.APP_DIFF_VIEW}/`)[1] || '').split('/')

    const isManifestView = resourceTypeParam === EnvResourceType.Manifest
    const selectedTab =
        resourceTypeParam === EnvResourceType.Manifest
            ? deploymentConfigDiffTabs.MANIFEST
            : deploymentConfigDiffTabs.CONFIGURATION

    // SEARCH PARAMS & SORTING
    const urlFilters = useUrlFilters<string, PipelineConfigDiffQueryParamsType>({
        parseSearchParams: parseCompareWithSearchParams(isRollbackTriggerSelected),
    })
    const { sortBy, sortOrder, deploy, mode, updateSearchParams, handleSorting } = urlFilters

    useEffect(() => {
        // INITIAL DEFAULT SORTING
        if (sortBy !== DEPLOYMENT_CONFIG_DIFF_SORT_KEY) {
            handleSorting(DEPLOYMENT_CONFIG_DIFF_SORT_KEY)
        }
    }, [])

    // FETCH PREVIOUS DEPLOYMENTS
    const [previousDeploymentsLoader, previousDeployments, previousDeploymentsErr, reloadPreviousDeployments] =
        useAsync(
            () =>
                getTemplateOptions(appId, envId).then(
                    ({ result }) => getDefaultVersionAndPreviousDeploymentOptions(result).previousDeployments,
                ),
            [envId],
            !!appId && !!envId && isCDNode,
        )

    const isLastDeployedConfigAvailable = previousDeployments?.length !== 0
    const lastDeploymentWfrId = previousDeployments?.[0]?.wfrId ?? null

    // FETCH PIPELINE DEPLOYMENT CONFIG
    const [pipelineDeploymentConfigLoading, pipelineDeploymentConfigRes, , reloadPipelineDeploymentConfig] = useAsync(
        async () => {
            const lastDeployedConfigWithoutStrategyPayload = {
                configArea: 'AppConfiguration' as const,
                appName,
                envName,
                configType: AppEnvDeploymentConfigType.PREVIOUS_DEPLOYMENTS,
                wfrId: previousDeployments[0]?.wfrId,
                // NOTE: receiving pipelineId as string even though its type is number
                pipelineId: Number(pipelineId),
            }

            const payloads = [
                isLastDeployedConfigAvailable ? lastDeployedConfigWithoutStrategyPayload : null,
                // Last deployed config with strategy
                isLastDeployedConfigAvailable && deploymentStrategy
                    ? ({
                          ...lastDeployedConfigWithoutStrategyPayload,
                          strategy: deploymentStrategy,
                      } as const)
                    : null,
                // NOTE: this is to fetch the last saved config
                {
                    configArea: 'AppConfiguration',
                    appName,
                    envName,
                    configType: AppEnvDeploymentConfigType.PUBLISHED_ONLY,
                    ...(deploymentStrategy ? { strategy: deploymentStrategy } : {}),
                } as const,
                // NOTE: this is to fetch the Config deployed at the selected deployment
                isRollbackTriggerSelected && wfrId
                    ? ({
                          configArea: 'CdRollback' as const,
                          appName,
                          envName,
                          // NOTE: receiving pipelineId as string even tho its type is number
                          pipelineId: Number(pipelineId),
                          wfrId,
                          ...(deploymentStrategy ? { strategy: deploymentStrategy } : {}),
                      } as const)
                    : null,
            ] as const

            // NOTE: since we can only ever compare against last deployed config
            // in rollback modal; we need 2 sets of comparison:
            // 1. b/w Last deployed & Last saved
            // 2. b/w Last deployed & Config deployed at selected
            // 3. b/w last deployed and last deployed (not getting secret for this case as only strategy is changing)
            // all above with same/ other strategies
            const [secretsData, secretsDataCDRollback, ..._pipelineDeploymentConfigRes] = await Promise.allSettled([
                !isSuperAdmin && payloads[0] && payloads[2] ? getCompareSecretsData([payloads[0], payloads[2]]) : null,
                !isSuperAdmin && payloads[0] && payloads[3] ? getCompareSecretsData([payloads[0], payloads[3]]) : null,
                ...payloads.map(
                    (payload) =>
                        payload && getAppEnvDeploymentConfig({ params: payload, appId: null, isTemplateView: false }),
                ),
            ])

            // NOTE: for security reasons secretsData from getAppEnvDeploymentConfig
            // will be null if user is not app admin. therefore need to override it
            // with masked values from getCompareSecretsData api
            // setting pipelineConfig - last saved config (current published)
            if (
                _pipelineDeploymentConfigRes[2].status === 'fulfilled' &&
                _pipelineDeploymentConfigRes[2].value &&
                !_pipelineDeploymentConfigRes[2].value.result.isAppAdmin &&
                secretsData.status === 'fulfilled' &&
                secretsData.value?.[1]
            ) {
                _pipelineDeploymentConfigRes[2].value.result.secretsData = secretsData.value[1].secretsData
            }

            // Rollback case
            if (isRollbackTriggerSelected && wfrId) {
                // setting pipelineConfig - last deployed config (w/o deployment strategy)
                if (
                    _pipelineDeploymentConfigRes[0].status === 'fulfilled' &&
                    _pipelineDeploymentConfigRes[0].value &&
                    !_pipelineDeploymentConfigRes[0].value.result.isAppAdmin &&
                    secretsDataCDRollback.status === 'fulfilled' &&
                    secretsDataCDRollback.value?.[0]
                ) {
                    _pipelineDeploymentConfigRes[0].value.result.secretsData =
                        secretsDataCDRollback.value[0].secretsData
                }

                // setting pipelineConfig - last deployed config (with deployment strategy)
                if (
                    _pipelineDeploymentConfigRes[1].status === 'fulfilled' &&
                    _pipelineDeploymentConfigRes[1].value &&
                    !_pipelineDeploymentConfigRes[1].value.result.isAppAdmin &&
                    secretsDataCDRollback.status === 'fulfilled' &&
                    secretsDataCDRollback.value?.[0]
                ) {
                    // we can use 0th secret data it will not impact strategy
                    _pipelineDeploymentConfigRes[1].value.result.secretsData =
                        secretsDataCDRollback.value[0].secretsData
                    _pipelineDeploymentConfigRes[1].value.result.secretsData =
                        secretsDataCDRollback.value[0].secretsData
                }
            }
            // Deploy case
            else {
                // setting pipelineConfig - last deployed config (w/o deployment strategy)
                if (
                    _pipelineDeploymentConfigRes[0].status === 'fulfilled' &&
                    _pipelineDeploymentConfigRes[0].value &&
                    !_pipelineDeploymentConfigRes[0].value.result.isAppAdmin &&
                    secretsData.status === 'fulfilled' &&
                    secretsData.value?.[0]
                ) {
                    _pipelineDeploymentConfigRes[0].value.result.secretsData = secretsData.value[0].secretsData
                }

                // setting pipelineConfig - last deployed config (with deployment strategy)
                if (
                    _pipelineDeploymentConfigRes[1].status === 'fulfilled' &&
                    _pipelineDeploymentConfigRes[1].value &&
                    !_pipelineDeploymentConfigRes[1].value.result.isAppAdmin &&
                    secretsData.status === 'fulfilled' &&
                    secretsData.value?.[0]
                ) {
                    // we can use 0th secret data it will not impact strategy
                    _pipelineDeploymentConfigRes[1].value.result.secretsData = secretsData.value[0].secretsData
                    _pipelineDeploymentConfigRes[1].value.result.secretsData = secretsData.value[0].secretsData
                }
            }

            // setting pipelineConfig - rollback config
            if (
                _pipelineDeploymentConfigRes[3].status === 'fulfilled' &&
                _pipelineDeploymentConfigRes[3].value &&
                !_pipelineDeploymentConfigRes[3].value.result.isAppAdmin &&
                secretsDataCDRollback.status === 'fulfilled' &&
                secretsDataCDRollback.value?.[1]
            ) {
                _pipelineDeploymentConfigRes[3].value.result.secretsData = secretsDataCDRollback.value[1].secretsData
            }

            return _pipelineDeploymentConfigRes
        },
        [isRollbackTriggerSelected && wfrId, deploymentStrategy],
        isCDNode && !previousDeploymentsLoader && !!previousDeployments && (!isRollbackTriggerSelected || !!wfrId),
    )

    // CONSTANTS
    const {
        recentDeploymentConfigWithoutStrategy,
        recentDeploymentConfig,
        latestDeploymentConfig,
        specificDeploymentConfig,
    } = useMemo(() => {
        if (!pipelineDeploymentConfigLoading && pipelineDeploymentConfigRes) {
            return {
                recentDeploymentConfigWithoutStrategy: getPipelineDeploymentConfigFromPromiseSettled(
                    pipelineDeploymentConfigRes[0],
                ),
                recentDeploymentConfig: getPipelineDeploymentConfigFromPromiseSettled(pipelineDeploymentConfigRes[1]),
                latestDeploymentConfig: getPipelineDeploymentConfigFromPromiseSettled(pipelineDeploymentConfigRes[2]),
                specificDeploymentConfig: getPipelineDeploymentConfigFromPromiseSettled(pipelineDeploymentConfigRes[3]),
            }
        }

        return {
            recentDeploymentConfigWithoutStrategy: null,
            recentDeploymentConfig: null,
            latestDeploymentConfig: null,
            specificDeploymentConfig: null,
        }
    }, [pipelineDeploymentConfigRes, pipelineDeploymentConfigLoading])

    const getManifestData = async (signal: AbortSignal) => {
        if (!pipelineDeploymentConfigRes) {
            return null
        }

        const prevDeployments = previousDeployments || []

        const lastDeployedChart = prevDeployments[0] || null
        const lastDeployedChartRefId = lastDeployedChart?.chartRefId || null

        const specificImageChart = prevDeployments.find((deployment) => deployment.wfrId === wfrId)
        const specificImageChartRefId = specificImageChart?.chartRefId || null

        const { selectedChartRefId: lastSavedChartRefId } = await getChartList({
            appId: String(appId),
            envId: envId ? String(envId) : null,
            isTemplateView: false,
            signal,
        })

        const nullResponse: Awaited<ReturnType<typeof getDeploymentManifest>> = {
            result: {
                data: '',
                resolvedData: '',
                variableSnapshot: {},
            },
            code: 200,
            status: 'OK',
        }

        // Last Deployed, Last Saved, Specific Image
        const manifestData = await Promise.all([
            lastDeployedChartRefId
                ? getDeploymentManifest(
                      {
                          appId,
                          envId,
                          chartRefId: lastDeployedChartRefId,
                          pipelineId,
                          deploymentTemplateHistoryId: lastDeployedChart?.deploymentTemplateHistoryId || null,
                          type: TemplateListType.DeployedOnSelfEnvironment,
                      },
                      signal,
                  )
                : structuredClone(nullResponse),
            getDeploymentManifest(
                {
                    appId,
                    envId,
                    chartRefId: lastSavedChartRefId,
                    values: latestDeploymentConfig?.deploymentTemplate?.data
                        ? YAMLStringify(latestDeploymentConfig.deploymentTemplate.data)
                        : '',
                },
                signal,
            ),
            isRollbackTriggerSelected && wfrId && specificImageChartRefId
                ? getDeploymentManifest(
                      {
                          appId,
                          envId,
                          chartRefId: specificImageChartRefId,
                          pipelineId,
                          deploymentTemplateHistoryId: specificImageChart?.deploymentTemplateHistoryId || null,
                          type: TemplateListType.DeployedOnSelfEnvironment,
                      },
                      signal,
                  )
                : structuredClone(nullResponse),
        ])

        return {
            lastDeployedManifest: manifestData[0]?.result || null,
            lastSavedManifest: manifestData[1]?.result || null,
            specificImageManifest: manifestData[2]?.result || null,
        }
    }

    const {
        data: manifestDetails,
        isFetching: isLoadingManifestDetails,
        error: manifestDetailsError,
        refetch: refetchManifestDetails,
    } = useQuery<
        Awaited<ReturnType<typeof getManifestData>>,
        Awaited<ReturnType<typeof getManifestData>>,
        [string, string, typeof pipelineDeploymentConfigRes, number | undefined],
        false
    >({
        queryKey: ['getManifestData', selectedTab, pipelineDeploymentConfigRes, wfrId],
        queryFn: ({ signal }) => getManifestData(signal),
        enabled: selectedTab === deploymentConfigDiffTabs.MANIFEST,
    })

    const pipelineDeploymentConfigErr = useMemo(() => {
        if (!pipelineDeploymentConfigLoading && pipelineDeploymentConfigRes) {
            return (
                getPipelineDeploymentConfigErrFromPromiseSettled(pipelineDeploymentConfigRes[0]) ||
                getPipelineDeploymentConfigErrFromPromiseSettled(pipelineDeploymentConfigRes[1]) ||
                getPipelineDeploymentConfigErrFromPromiseSettled(pipelineDeploymentConfigRes[2]) ||
                getPipelineDeploymentConfigErrFromPromiseSettled(pipelineDeploymentConfigRes[3])
            )
        }

        return null
    }, [pipelineDeploymentConfigRes, pipelineDeploymentConfigLoading])

    useEffect(() => {
        if (!isLastDeployedConfigAvailable && deploy === DeploymentWithConfigType.LATEST_TRIGGER_CONFIG) {
            updateSearchParams({ deploy: DeploymentWithConfigType.LAST_SAVED_CONFIG })
        }
    }, [isLastDeployedConfigAvailable])

    useEffect(() => {
        if (previousDeploymentsErr || pipelineDeploymentConfigErr) {
            showError(previousDeploymentsErr || pipelineDeploymentConfigErr)
        }
    }, [previousDeploymentsErr, pipelineDeploymentConfigErr])

    // METHODS
    const isConfigPresent = () => {
        const hasSpecificConfig =
            deploy === DeploymentWithConfigType.SPECIFIC_TRIGGER_CONFIG &&
            !!specificDeploymentConfig?.deploymentTemplate
        const hasLastSavedConfig =
            deploy === DeploymentWithConfigType.LAST_SAVED_CONFIG && !!latestDeploymentConfig?.deploymentTemplate

        return hasSpecificConfig || hasLastSavedConfig
    }

    const canReviewConfig = () => {
        const hasReviewableConfig =
            recentDeploymentConfigWithoutStrategy?.deploymentTemplate &&
            (deploy === DeploymentWithConfigType.LATEST_TRIGGER_CONFIG || isConfigPresent())

        return hasReviewableConfig || !recentDeploymentConfigWithoutStrategy
    }

    const canDeployWithConfig = () => {
        const canDeployLatest =
            deploy === DeploymentWithConfigType.LATEST_TRIGGER_CONFIG &&
            !!recentDeploymentConfigWithoutStrategy?.deploymentTemplate
        return canDeployLatest || isConfigPresent()
    }

    const getNavItemHref = (resourceType: EnvResourceType, resourceName: string) =>
        `${pathname.split(`/${URLS.APP_DIFF_VIEW}/`)[0]}/${URLS.APP_DIFF_VIEW}/${resourceType}${resourceName ? `/${resourceName}` : ''}${search}`

    const onTabChange = async (tab: typeof selectedTab) => {
        navigate(
            getNavItemHref(
                tab === deploymentConfigDiffTabs.MANIFEST
                    ? EnvResourceType.Manifest
                    : EnvResourceType.DeploymentTemplate,
                '',
            ),
            { replace: true },
        )
    }

    const tabConfig: DeploymentConfigDiffProps['tabConfig'] = useMemo(
        () => ({
            tabs: getDeploymentConfigDiffTabs(),
            activeTab: selectedTab,
            onClick: onTabChange,
        }),
        [selectedTab, search, pathname],
    )

    const getSelectedManifest = () => {
        if (deploy === DeploymentWithConfigType.SPECIFIC_TRIGGER_CONFIG) {
            return manifestDetails?.specificImageManifest || null
        }

        if (deploy === DeploymentWithConfigType.LAST_SAVED_CONFIG) {
            return manifestDetails?.lastSavedManifest || null
        }

        return manifestDetails?.lastDeployedManifest || null
    }

    const pipelineDeploymentConfig: Pick<
        DeploymentConfigDiffProps,
        'configList' | 'tabConfig' | 'navList' | 'collapsibleNavList'
    > = useMemo(() => {
        if (!pipelineDeploymentConfigLoading && pipelineDeploymentConfigRes) {
            if (selectedTab === deploymentConfigDiffTabs.CONFIGURATION) {
                const compareData = getComparisonDataBasedOnDeployAndStrategy({
                    deploy,
                    latestDeploymentConfig,
                    specificDeploymentConfig,
                    recentDeploymentConfig: deploymentStrategy
                        ? recentDeploymentConfig
                        : recentDeploymentConfigWithoutStrategy,
                })

                const { configList, ...rest } = getAppEnvDeploymentConfigList({
                    currentList: compareData || {
                        configMapData: null,
                        deploymentTemplate: null,
                        secretsData: null,
                        isAppAdmin: false,
                    },
                    compareList: recentDeploymentConfigWithoutStrategy || {
                        configMapData: null,
                        deploymentTemplate: null,
                        secretsData: null,
                        isAppAdmin: false,
                    },
                    getNavItemHref,
                    convertVariables,
                    sortingConfig: { sortBy, sortOrder },
                })

                // filtering out tooltipContent from secondary config, as we are not showing tooltip in right side
                return {
                    ...rest,
                    tabConfig,
                    configList: configList.map((list) => ({
                        ...list,
                        secondaryConfig: {
                            ...list.secondaryConfig,
                            list: {
                                ...list.secondaryConfig.list,
                                values: {
                                    ...list.secondaryConfig.list.values,
                                    strategy: Object.fromEntries(
                                        Object.entries(list.secondaryConfig.list.values.strategy ?? {}).filter(
                                            ([key]) => key !== 'tooltipContent',
                                        ),
                                    ) as DeploymentHistorySingleValue,
                                },
                            },
                        },
                    })),
                }
            }

            if (selectedTab === deploymentConfigDiffTabs.MANIFEST && manifestDetails) {
                const configData = getAppEnvDeploymentConfigList<true>({
                    currentList: getSelectedManifest(),
                    compareList: manifestDetails.lastDeployedManifest,
                    getNavItemHref,
                    convertVariables,
                    isManifestView: true,
                })

                return {
                    ...configData,
                    tabConfig,
                }
            }
        }

        return null
    }, [
        pipelineDeploymentConfigLoading,
        pipelineDeploymentConfigRes,
        deploy,
        mode,
        convertVariables,
        sortBy,
        sortOrder,
        tabConfig,
        selectedTab,
        manifestDetails,
    ])

    const reload = async () => {
        reloadPreviousDeployments()
        reloadPipelineDeploymentConfig()

        if (selectedTab === deploymentConfigDiffTabs.MANIFEST) {
            await refetchManifestDetails()
        }
    }

    // DEPLOYMENT CONFIG SELECTOR PROPS
    const isConfigAvailable = (configType: DeploymentWithConfigType) =>
        !(
            (configType === DeploymentWithConfigType.SPECIFIC_TRIGGER_CONFIG &&
                !specificDeploymentConfig?.deploymentTemplate) ||
            (configType === DeploymentWithConfigType.LATEST_TRIGGER_CONFIG &&
                !recentDeploymentConfig?.deploymentTemplate) ||
            (configType === DeploymentWithConfigType.LAST_SAVED_CONFIG && !latestDeploymentConfig?.deploymentTemplate)
        )

    const onDeploymentConfigChange = (value: DeploymentWithConfigType) => {
        updateSearchParams({
            [PipelineConfigDiffQueryParams.DEPLOY]: value,
        })
    }

    const onStrategyChange = (value: DeploymentStrategyType) => {
        setDeploymentStrategy(value)
    }

    const radioSelectConfig = getPipelineDeploymentConfigSelectorConfig({
        isLastDeployedConfigAvailable,
        isRollbackTriggerSelected,
        isConfigAvailable,
        deploy,
        deploymentStrategy,
        onDeploymentConfigChange,
        onStrategyChange,
        pipelineStrategyOptions,
    })

    const scopeVariablesConfig = {
        convertVariables,
        onConvertVariablesClick: () => setConvertVariables(!convertVariables),
    }

    const isManifestViewLoading = selectedTab === deploymentConfigDiffTabs.MANIFEST && isLoadingManifestDetails
    const isLoading = previousDeploymentsLoader || pipelineDeploymentConfigLoading || isManifestViewLoading

    const isManifestViewError = selectedTab === deploymentConfigDiffTabs.MANIFEST && manifestDetailsError
    const isError = previousDeploymentsErr || pipelineDeploymentConfigErr || isManifestViewError

    return {
        pipelineDeploymentConfigLoading: isLoading || (!isError && !pipelineDeploymentConfig),
        pipelineDeploymentConfig,
        errorConfig: {
            error: isError && !isLoading,
            code:
                previousDeploymentsErr?.code ||
                pipelineDeploymentConfigErr?.code ||
                (isManifestViewError ? manifestDetailsError?.code : null),
            reload,
        },
        radioSelectConfig,
        diffFound: pipelineDeploymentConfig?.configList.some(
            ({ diffState }) => diffState !== DeploymentConfigDiffState.NO_DIFF,
        ),
        noLastDeploymentConfig: !isLastDeployedConfigAvailable,
        noSpecificDeploymentConfig: specificDeploymentConfig === null,
        canReviewConfig,
        canDeployWithConfig,
        scopeVariablesConfig: selectedTab === deploymentConfigDiffTabs.CONFIGURATION ? scopeVariablesConfig : null,
        urlFilters,
        lastDeploymentWfrId,
        navHelpText: isManifestView
            ? 'The manifest is generated locally from the configuration files. Server-side testing of chart validity (eg. whether an API is supported) is NOT done. K8s based templating may be different depending on cluster version.'
            : null,
    }
}
