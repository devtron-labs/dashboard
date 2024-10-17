import { useEffect, useMemo, useState } from 'react'
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
    DeploymentConfigDiffState,
    ComponentSizeType,
    showError,
} from '@devtron-labs/devtron-fe-common-lib'

import { getTemplateOptions } from '@Services/service'

import {
    PipelineConfigDiffQueryParams,
    PipelineConfigDiffQueryParamsType,
    UsePipelineDeploymentConfigProps,
} from './types'
import {
    getComparisonDataBasedOnDeploy,
    getPipelineDeploymentConfigErrFromPromiseSettled,
    getPipelineDeploymentConfigFromPromiseSettled,
    getPipelineDeploymentConfigSelectorOptions,
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
}: UsePipelineDeploymentConfigProps) => {
    // HOOKS
    const { path, params } = useRouteMatch()
    const { search } = useLocation()

    // STATES
    const [convertVariables, setConvertVariables] = useState(false)

    // SEARCH PARAMS & SORTING
    const urlFilters = useUrlFilters<string, PipelineConfigDiffQueryParamsType>({
        parseSearchParams: parseCompareWithSearchParams(isRollbackTriggerSelected),
    })
    const { deploy, mode, updateSearchParams, handleSorting } = urlFilters

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
        async () =>
            Promise.allSettled([
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
            ]),
        [isRollbackTriggerSelected && wfrId],
        !previousDeploymentsLoader && !!previousDeployments && (!isRollbackTriggerSelected || !!wfrId),
    )

    // CONSTANTS
    const { recentDeploymentConfig, latestDeploymentConfig, specificDeploymentConfig } = useMemo(() => {
        if (!pipelineDeploymentConfigLoading && pipelineDeploymentConfigRes) {
            return {
                recentDeploymentConfig: getPipelineDeploymentConfigFromPromiseSettled(pipelineDeploymentConfigRes[0]),
                latestDeploymentConfig: getPipelineDeploymentConfigFromPromiseSettled(pipelineDeploymentConfigRes[1]),
                specificDeploymentConfig: getPipelineDeploymentConfigFromPromiseSettled(pipelineDeploymentConfigRes[2]),
            }
        }

        return {
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
                getPipelineDeploymentConfigErrFromPromiseSettled(pipelineDeploymentConfigRes[2])
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
        if (!pipelineDeploymentConfigLoading && pipelineDeploymentConfigRes) {
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
            })
        }

        return null
    }, [pipelineDeploymentConfigLoading, pipelineDeploymentConfigRes, deploy, mode, convertVariables])

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

    const onDeploymentConfigChange = ({ value }: SelectPickerOptionType) => {
        handleSorting('')
        updateSearchParams({
            [PipelineConfigDiffQueryParams.DEPLOY]: value as PipelineConfigDiffQueryParamsType['deploy'],
        })
    }

    const isOptionDisabled = ({ value }: SelectPickerOptionType<DeploymentWithConfigType>) => !isConfigAvailable(value)

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
        menuSize: ComponentSizeType.large,
    }

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
        lastDeploymentWfrId,
    }
}
