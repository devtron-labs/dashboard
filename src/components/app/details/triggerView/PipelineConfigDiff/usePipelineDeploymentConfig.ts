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
import { useLocation } from 'react-router-dom'

import {
    AppEnvDeploymentConfigType,
    DEPLOYMENT_CONFIG_DIFF_SORT_KEY,
    DeploymentConfigDiffState,
    DeploymentStrategyType,
    DeploymentWithConfigType,
    EnvResourceType,
    getAppEnvDeploymentConfig,
    getAppEnvDeploymentConfigList,
    getCompareSecretsData,
    getDefaultVersionAndPreviousDeploymentOptions,
    showError,
    useAsync,
    useMainContext,
    useUrlFilters,
} from '@devtron-labs/devtron-fe-common-lib'

import { URLS } from '@Config/routes'
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
}: UsePipelineDeploymentConfigProps) => {
    // HOOKS
    const { pathname, search } = useLocation()
    const { isSuperAdmin } = useMainContext()

    // STATES
    const [convertVariables, setConvertVariables] = useState(false)

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
            !!appId && !!envId,
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
            if (
                _pipelineDeploymentConfigRes[0].status === 'fulfilled' &&
                _pipelineDeploymentConfigRes[0].value &&
                !_pipelineDeploymentConfigRes[0].value.result.isAppAdmin &&
                secretsData.status === 'fulfilled' &&
                secretsData.value?.[0]
            ) {
                _pipelineDeploymentConfigRes[0].value.result.secretsData = secretsData.value[0].secretsData
            }

            if (
                _pipelineDeploymentConfigRes[1].status === 'fulfilled' &&
                _pipelineDeploymentConfigRes[1].value &&
                !_pipelineDeploymentConfigRes[1].value.result.isAppAdmin &&
                secretsData.status === 'fulfilled' &&
                secretsData.value?.[1]
            ) {
                // we can use 0th secret data it will not impact strategy
                _pipelineDeploymentConfigRes[1].value.result.secretsData = secretsData.value[0].secretsData
                _pipelineDeploymentConfigRes[1].value.result.secretsData = secretsData.value[0].secretsData
            }

            if (
                _pipelineDeploymentConfigRes[2].status === 'fulfilled' &&
                _pipelineDeploymentConfigRes[2].value &&
                !_pipelineDeploymentConfigRes[2].value.result.isAppAdmin &&
                secretsData.status === 'fulfilled' &&
                secretsData.value?.[2]
            ) {
                _pipelineDeploymentConfigRes[2].value.result.secretsData = secretsData.value[1].secretsData
            }

            if (
                _pipelineDeploymentConfigRes[3].status === 'fulfilled' &&
                _pipelineDeploymentConfigRes[3].value &&
                !_pipelineDeploymentConfigRes[3].value.result.isAppAdmin &&
                secretsDataCDRollback.status === 'fulfilled' &&
                secretsDataCDRollback.value?.[3]
            ) {
                _pipelineDeploymentConfigRes[3].value.result.secretsData = secretsDataCDRollback.value[2].secretsData
            }

            return _pipelineDeploymentConfigRes
        },
        [isRollbackTriggerSelected && wfrId, deploymentStrategy],
        !previousDeploymentsLoader && !!previousDeployments && (!isRollbackTriggerSelected || !!wfrId),
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

    const pipelineDeploymentConfig = useMemo(() => {
        if (!pipelineDeploymentConfigLoading && pipelineDeploymentConfigRes) {
            const compareData = getComparisonDataBasedOnDeployAndStrategy({
                deploy,
                latestDeploymentConfig,
                specificDeploymentConfig,
                recentDeploymentConfig: deploymentStrategy
                    ? recentDeploymentConfig
                    : recentDeploymentConfigWithoutStrategy,
            })

            return getAppEnvDeploymentConfigList({
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
    ])

    const reload = () => {
        reloadPreviousDeployments()
        reloadPipelineDeploymentConfig()
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

    const isLoading = previousDeploymentsLoader || pipelineDeploymentConfigLoading
    const isError = previousDeploymentsErr || pipelineDeploymentConfigErr

    return {
        pipelineDeploymentConfigLoading: isLoading || (!isError && !pipelineDeploymentConfig),
        pipelineDeploymentConfig,
        errorConfig: {
            error: isError && !isLoading,
            code: previousDeploymentsErr?.code || pipelineDeploymentConfigErr?.code,
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
        scopeVariablesConfig,
        urlFilters,
        lastDeploymentWfrId,
    }
}
