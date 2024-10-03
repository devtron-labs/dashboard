import { useEffect, useMemo, useRef, useState } from 'react'
import { generatePath, useLocation, useRouteMatch } from 'react-router-dom'

import {
    AppEnvDeploymentConfigType,
    getAppEnvDeploymentConfig,
    getAppEnvDeploymentConfigList,
    getDefaultVersionAndPreviousDeploymentOptions,
    SelectPickerOptionType,
    getSelectPickerOptionByValue,
    SelectPickerVariantType,
    useAsync,
    useUrlFilters,
    DeploymentWithConfigType,
    EnvResourceType,
    abortPreviousRequests,
    getIsRequestAborted,
    DeploymentConfigDiffState,
    ComponentSizeType,
} from '@devtron-labs/devtron-fe-common-lib'

import { getOptions } from '@Components/deploymentConfig/service'

import {
    PipelineConfigDiffQueryParams,
    PipelineConfigDiffQueryParamsType,
    UsePipelineDeploymentConfigProps,
} from './types'
import {
    getComparisonDataBasedOnDeploy,
    getPipelineDeploymentConfigSelectorOptions,
    parseCompareWithSearchParams,
} from './utils'
import { getDeploymentTemplateResolvedData } from './service.utils'

export const usePipelineDeploymentConfig = ({
    appId,
    envId,
    appName,
    envName,
    isRollbackTriggerSelected,
    pipelineId,
    wfrId,
}: UsePipelineDeploymentConfigProps) => {
    // HOOKS
    const { path, params } = useRouteMatch()
    const { search } = useLocation()

    // STATES
    const [convertVariables, setConvertVariables] = useState(false)

    // REFS
    const deploymentTemplateResolvedDataAbortControllerRef = useRef(new AbortController())

    // SEARCH PARAMS & SORTING
    const urlFilters = useUrlFilters<string, PipelineConfigDiffQueryParamsType>({
        parseSearchParams: parseCompareWithSearchParams(isRollbackTriggerSelected),
    })
    const { deploy, mode, updateSearchParams, handleSorting } = urlFilters

    const [previousDeploymentsLoader, previousDeployments, previousDeploymentsErr, reloadPreviousDeployments] =
        useAsync(
            () =>
                getOptions(appId, envId).then(
                    ({ result }) => getDefaultVersionAndPreviousDeploymentOptions(result).previousDeployments,
                ),
            [envId],
            !!appId && !!envId,
        )

    // ASYNC CALLS
    const [
        pipelineDeploymentConfigLoading,
        pipelineDeploymentConfigRes,
        pipelineDeploymentConfigErr,
        reloadPipelineDeploymentConfig,
    ] = useAsync(
        async () => {
            const isLastDeployedConfigAvailable = previousDeployments.length !== 0

            return Promise.all([
                isLastDeployedConfigAvailable
                    ? getAppEnvDeploymentConfig({
                          params: {
                              configArea: 'AppConfiguration',
                              appName,
                              envName,
                              configType: AppEnvDeploymentConfigType.PREVIOUS_DEPLOYMENTS,
                              identifierId: previousDeployments[0].deploymentTemplateHistoryId,
                              pipelineId,
                          },
                      })
                    : null,
                getAppEnvDeploymentConfig({
                    params: {
                        configArea: 'AppConfiguration',
                        appName,
                        envName,
                        configType: AppEnvDeploymentConfigType.PUBLISHED_ONLY,
                    },
                }),
                isRollbackTriggerSelected && wfrId
                    ? getAppEnvDeploymentConfig({
                          params: {
                              configArea: 'CdRollback',
                              appName,
                              envName,
                              pipelineId,
                              wfrId,
                          },
                      })
                    : null,
            ])
        },
        [isRollbackTriggerSelected, wfrId],
        !previousDeploymentsLoader && !!previousDeployments && (!isRollbackTriggerSelected || !!wfrId),
    )

    // CONSTANTS
    const recentDeploymentConfig = pipelineDeploymentConfigRes?.[0]?.result ?? null
    const latestDeploymentConfig = pipelineDeploymentConfigRes?.[1]?.result ?? null
    const specificDeploymentConfig = pipelineDeploymentConfigRes?.[2]?.result ?? null
    const isLastDeployedConfigAvailable = pipelineDeploymentConfigRes?.[0] !== null

    const [
        deploymentTemplateResolvedDataLoader,
        deploymentTemplateResolvedData,
        deploymentTemplateResolvedDataErr,
        reloadDeploymentTemplateResolvedData,
    ] = useAsync(
        () =>
            abortPreviousRequests(() => {
                const compareData = getComparisonDataBasedOnDeploy({
                    deploy,
                    latestDeploymentConfig,
                    specificDeploymentConfig,
                    recentDeploymentConfig,
                })

                return Promise.all([
                    getDeploymentTemplateResolvedData({
                        appName,
                        envName,
                        data: compareData,
                        abortControllerRef: deploymentTemplateResolvedDataAbortControllerRef,
                    }),
                    getDeploymentTemplateResolvedData({
                        appName,
                        envName,
                        data: recentDeploymentConfig,
                        abortControllerRef: deploymentTemplateResolvedDataAbortControllerRef,
                    }),
                ])
            }, deploymentTemplateResolvedDataAbortControllerRef),
        [convertVariables, pipelineDeploymentConfigRes],
        convertVariables && !!pipelineDeploymentConfigRes,
    )

    useEffect(() => {
        if (!isLastDeployedConfigAvailable && deploy === DeploymentWithConfigType.LATEST_TRIGGER_CONFIG) {
            updateSearchParams({ deploy: DeploymentWithConfigType.LAST_SAVED_CONFIG })
        }
    }, [isLastDeployedConfigAvailable])

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
            recentDeploymentConfig?.deploymentTemplate &&
            (deploy === DeploymentWithConfigType.LATEST_TRIGGER_CONFIG || isConfigPresent())

        return hasReviewableConfig || !recentDeploymentConfig
    }

    const canDeployWithConfig = () => {
        const canDeployLatest =
            deploy === DeploymentWithConfigType.LATEST_TRIGGER_CONFIG && !!recentDeploymentConfig?.deploymentTemplate

        return canDeployLatest || isConfigPresent()
    }

    const getNavItemHref = (resourceType: EnvResourceType, resourceName: string) =>
        `${generatePath(path, params)}/${resourceType}${resourceName ? `/${resourceName}` : ''}${search}`

    const pipelineDeploymentConfig = useMemo(() => {
        if (
            convertVariables
                ? !deploymentTemplateResolvedDataLoader && deploymentTemplateResolvedData
                : !pipelineDeploymentConfigLoading && pipelineDeploymentConfigRes
        ) {
            const compareData = getComparisonDataBasedOnDeploy({
                deploy,
                latestDeploymentConfig,
                specificDeploymentConfig,
                recentDeploymentConfig,
            })

            return getAppEnvDeploymentConfigList({
                currentList: compareData || {
                    configMapData: null,
                    deploymentTemplate: null,
                    secretsData: null,
                    isAppAdmin: false,
                },
                compareList: recentDeploymentConfig || {
                    configMapData: null,
                    deploymentTemplate: null,
                    secretsData: null,
                    isAppAdmin: false,
                },
                getNavItemHref,
                convertVariables,
                ...(convertVariables
                    ? {
                          currentDeploymentTemplateResolvedData: deploymentTemplateResolvedData[0].result,
                          compareDeploymentTemplateResolvedData: deploymentTemplateResolvedData[1].result,
                      }
                    : {}),
            })
        }

        return null
    }, [
        pipelineDeploymentConfigLoading,
        pipelineDeploymentConfigRes,
        deploy,
        mode,
        convertVariables,
        deploymentTemplateResolvedData,
    ])

    const reload = () => {
        reloadPreviousDeployments()
        reloadPipelineDeploymentConfig()
        reloadDeploymentTemplateResolvedData()
    }

    // DEPLOYMENT CONFIG SELECTOR PROPS
    const isConfigAvailable = ({ value }: SelectPickerOptionType) =>
        !(
            (value === DeploymentWithConfigType.SPECIFIC_TRIGGER_CONFIG &&
                !specificDeploymentConfig?.deploymentTemplate) ||
            (value === DeploymentWithConfigType.LATEST_TRIGGER_CONFIG && !recentDeploymentConfig?.deploymentTemplate) ||
            (value === DeploymentWithConfigType.LAST_SAVED_CONFIG && !latestDeploymentConfig?.deploymentTemplate)
        )

    const onDeploymentConfigChange = ({ value }: SelectPickerOptionType) => {
        handleSorting('')
        updateSearchParams({
            [PipelineConfigDiffQueryParams.DEPLOY]: value as PipelineConfigDiffQueryParamsType['deploy'],
        })
    }

    const isOptionDisabled = (option: SelectPickerOptionType) => !isConfigAvailable(option)

    const deploymentConfigSelectorOptions = getPipelineDeploymentConfigSelectorOptions(
        isLastDeployedConfigAvailable,
        isRollbackTriggerSelected,
        isConfigAvailable,
    )

    const deploymentConfigSelectorProps = {
        id: 'deployment-config-selector',
        options: deploymentConfigSelectorOptions,
        placeholder: 'Select Deployment Config',
        classNamePrefix: 'deployment-config-selector',
        inputId: 'deployment-config-selector',
        name: 'deployment-config-selector',
        variant: SelectPickerVariantType.BORDER_LESS,
        isSearchable: false,
        disableDescriptionEllipsis: true,
        value: getSelectPickerOptionByValue(
            deploymentConfigSelectorOptions,
            deploy,
            'options' in deploymentConfigSelectorOptions[0]
                ? deploymentConfigSelectorOptions[0].options[isRollbackTriggerSelected ? 2 : 0]
                : null,
        ),
        onChange: onDeploymentConfigChange,
        isOptionDisabled,
        menuSize: ComponentSizeType.medium,
    }

    const scopeVariablesConfig = {
        convertVariables,
        onConvertVariablesClick: () => setConvertVariables(!convertVariables),
    }

    const isLoading =
        previousDeploymentsLoader || pipelineDeploymentConfigLoading || deploymentTemplateResolvedDataLoader
    const isError =
        previousDeploymentsErr ||
        pipelineDeploymentConfigErr ||
        (deploymentTemplateResolvedDataErr && !getIsRequestAborted(deploymentTemplateResolvedDataErr))

    return {
        pipelineDeploymentConfigLoading: isLoading || (!isError && !pipelineDeploymentConfig),
        pipelineDeploymentConfig,
        errorConfig: {
            error: isError && !isLoading,
            code:
                previousDeploymentsErr?.code ||
                pipelineDeploymentConfigErr?.code ||
                deploymentTemplateResolvedDataErr?.code,
            reload,
        },
        deploymentConfigSelectorProps,
        diffFound: pipelineDeploymentConfig?.configList.some(
            ({ diffState }) => diffState !== DeploymentConfigDiffState.NO_DIFF,
        ),
        noLastDeploymentConfig: !isLastDeployedConfigAvailable,
        noSpecificDeploymentConfig: specificDeploymentConfig === null,
        canReviewConfig,
        canDeployWithConfig,
        scopeVariablesConfig,
        urlFilters,
    }
}
