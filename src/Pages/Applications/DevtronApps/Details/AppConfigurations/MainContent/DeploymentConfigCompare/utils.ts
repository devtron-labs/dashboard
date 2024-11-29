import { GroupBase, OptionsOrGroups } from 'react-select'
import moment from 'moment'

import {
    AppEnvDeploymentConfigDTO,
    AppEnvDeploymentConfigType,
    DeploymentConfigDiffProps,
    SelectPickerOptionType,
    TemplateListDTO,
    YAMLStringify,
} from '@devtron-labs/devtron-fe-common-lib'

import { Moment12HourFormat } from '@Config/constants'

import {
    AppEnvDeploymentConfigQueryParamsType,
    EnvironmentOptionType,
    AppEnvDeploymentConfigQueryParams,
    DeploymentConfigCompareProps,
} from '../../AppConfig.types'
import { BASE_CONFIGURATIONS } from '../../AppConfig.constants'

export const getPreviousDeploymentOptionValue = (identifierId: number, pipelineId?: number, chartRefId?: number) => {
    if (identifierId && pipelineId) {
        return `${AppEnvDeploymentConfigType.PREVIOUS_DEPLOYMENTS}-${identifierId}-${pipelineId}${chartRefId ? `-${chartRefId}` : ''}`
    }
    if (identifierId) {
        return `${AppEnvDeploymentConfigType.DEFAULT_VERSION}-${identifierId}`
    }
    return null
}

export const getPreviousDeploymentValue = (value: string) => {
    const valueSplit = value.split('-')
    if (valueSplit[0] === AppEnvDeploymentConfigType.PREVIOUS_DEPLOYMENTS) {
        return {
            configType: AppEnvDeploymentConfigType.PREVIOUS_DEPLOYMENTS,
            identifierId: +valueSplit[1],
            pipelineId: +valueSplit[2],
            chartRefId: valueSplit[3] ? +valueSplit[3] : null,
        }
    }

    return null
}

export const getEnvironmentIdByEnvironmentName = (environments: EnvironmentOptionType[], name: string) =>
    environments.find(({ name: _name }) => name === _name)?.id ?? BASE_CONFIGURATIONS.id

/**
 * Returns the application and environment IDs for comparison based on the given parameters.
 *
 * @param params - Object containing appId, envId, environments, type, compareTo, and compareWith.
 * @param params.appId - The application ID.
 * @param params.envId - The environment ID.
 * @param params.environments - The list of environments.
 * @param params.type - The type of comparison (e.g., 'appGroup').
 * @param params.compareTo - The environment name to compare to.
 * @param params.compareWith - The environment name to compare with.
 * @returns Object containing compareToAppId, compareWithAppId, compareToEnvId, and compareWithEnvId.
 */
export const getAppAndEnvIds = ({
    appId,
    envId,
    environments,
    type,
    compareTo,
    compareWith,
}: Pick<DeploymentConfigCompareProps, 'environments' | 'type'> & {
    appId: string
    envId: string
    compareTo: string
    compareWith: string
}) => {
    // Default: use appId and envId
    let compareToAppId = +appId
    let compareWithAppId = +appId
    let compareToEnvId = getEnvironmentIdByEnvironmentName(environments, compareTo)
    let compareWithEnvId = getEnvironmentIdByEnvironmentName(environments, compareWith)

    // If type is 'appGroup', switch appId & envId
    if (type === 'appGroup') {
        compareToAppId = getEnvironmentIdByEnvironmentName(environments, compareTo)
        compareWithAppId = getEnvironmentIdByEnvironmentName(environments, compareWith)
        compareToEnvId = +envId
        compareWithEnvId = +envId
    }

    return { compareToAppId, compareWithAppId, compareToEnvId, compareWithEnvId }
}

export const parseCompareWithSearchParams =
    ({
        environments,
        type,
        compareTo,
    }: Pick<DeploymentConfigCompareProps, 'environments' | 'type'> & { compareTo: string }) =>
    (searchParams: URLSearchParams): AppEnvDeploymentConfigQueryParamsType => {
        const identifierId = searchParams.get(AppEnvDeploymentConfigQueryParams.IDENTIFIER_ID)
        const compareWithIdentifierId = searchParams.get(AppEnvDeploymentConfigQueryParams.COMPARE_WITH_IDENTIFIER_ID)
        const pipelineId = searchParams.get(AppEnvDeploymentConfigQueryParams.PIPELINE_ID)
        const compareWithPipelineId = searchParams.get(AppEnvDeploymentConfigQueryParams.COMPARE_WITH_PIPELINE_ID)
        const chartRefId = searchParams.get(AppEnvDeploymentConfigQueryParams.CHART_REF_ID)
        const manifestChartRefId = searchParams.get(AppEnvDeploymentConfigQueryParams.MANIFEST_CHART_REF_ID)
        const compareWithManifestChartRefId = searchParams.get(
            AppEnvDeploymentConfigQueryParams.COMPARE_WITH_MANIFEST_CHART_REF_ID,
        )
        let configType = searchParams.get(AppEnvDeploymentConfigQueryParams.CONFIG_TYPE)
        let compareWithConfigType = searchParams.get(AppEnvDeploymentConfigQueryParams.COMPARE_WITH_CONFIG_TYPE)
        let compareWith = searchParams.get(AppEnvDeploymentConfigQueryParams.COMPARE_WITH)

        if ((!chartRefId && !compareWithConfigType) || !configType) {
            if (!compareWith) {
                // If `type` is 'app' (Application), set `compareWith` to the first environment if available,
                // otherwise `null` (base configuration).
                if (type === 'app') {
                    compareWith = environments.length && !compareTo ? environments[0].name : null
                } else {
                    // If `type` is 'appGroup' (Application Groups), set `compareWith` to the first application.
                    // If the application to compare (`compareTo`) is the same as the first application,
                    // set `compareWith` to the second application if it exists; otherwise, set it to the first.
                    compareWith =
                        environments.length > 1 && compareTo === environments[0].name
                            ? environments[1].name
                            : environments[0].name
                }
            }
            compareWithConfigType = compareWithConfigType || AppEnvDeploymentConfigType.PUBLISHED_ONLY
            configType = configType || AppEnvDeploymentConfigType.PUBLISHED_ONLY
        }

        return {
            [AppEnvDeploymentConfigQueryParams.CONFIG_TYPE]: configType as AppEnvDeploymentConfigType,
            [AppEnvDeploymentConfigQueryParams.COMPARE_WITH]: compareWith,
            [AppEnvDeploymentConfigQueryParams.COMPARE_WITH_CONFIG_TYPE]:
                compareWithConfigType as AppEnvDeploymentConfigType,
            [AppEnvDeploymentConfigQueryParams.IDENTIFIER_ID]: identifierId ? parseInt(identifierId, 10) : null,
            [AppEnvDeploymentConfigQueryParams.PIPELINE_ID]: pipelineId ? parseInt(pipelineId, 10) : null,
            [AppEnvDeploymentConfigQueryParams.COMPARE_WITH_IDENTIFIER_ID]: compareWithIdentifierId
                ? parseInt(compareWithIdentifierId, 10)
                : null,
            [AppEnvDeploymentConfigQueryParams.COMPARE_WITH_PIPELINE_ID]: compareWithPipelineId
                ? parseInt(compareWithPipelineId, 10)
                : null,
            [AppEnvDeploymentConfigQueryParams.CHART_REF_ID]: chartRefId ? parseInt(chartRefId, 10) : null,
            [AppEnvDeploymentConfigQueryParams.MANIFEST_CHART_REF_ID]: manifestChartRefId
                ? parseInt(manifestChartRefId, 10)
                : null,
            [AppEnvDeploymentConfigQueryParams.COMPARE_WITH_MANIFEST_CHART_REF_ID]: compareWithManifestChartRefId
                ? parseInt(compareWithManifestChartRefId, 10)
                : null,
        }
    }

/**
 * Get the options for the compare environment.
 *
 * @param environmentList - List of environments.
 * @param defaultValuesList - List of chart default values.
 * @returns The environments options for the select picker.
 */
export const getCompareEnvironmentSelectorOptions = (
    environmentList: EnvironmentOptionType[] = [],
    defaultValuesList: TemplateListDTO[] = [],
    type: DeploymentConfigCompareProps['type'] = 'app',
): OptionsOrGroups<SelectPickerOptionType, GroupBase<SelectPickerOptionType>> => [
    ...(type === 'app'
        ? [
              {
                  label: BASE_CONFIGURATIONS.name,
                  value: '',
              },
          ]
        : []),
    ...(type === 'app'
        ? [
              {
                  label: 'Environments',
                  options: environmentList.map(({ name }) => ({
                      label: name,
                      value: name,
                  })),
              },
          ]
        : environmentList.map(({ name }) => ({
              label: name,
              value: name,
          }))),
    ...(type === 'app'
        ? [
              {
                  label: 'Chart default values',
                  options:
                      defaultValuesList.map(({ chartRefId, chartVersion }) => ({
                          label: `v${chartVersion} (Default)`,
                          value: chartRefId,
                      })) || [],
              },
          ]
        : []),
]

/**
 * Get the configuration type options for the environment.
 *
 * @param previousDeploymentsList - List of previous deployments.
 * @returns The configuration type options for the select picker.
 */
export const getEnvironmentConfigTypeOptions = (
    previousDeploymentsList: TemplateListDTO[] = [],
    isApprovalPolicyConfigured = false,
    isManifestView = false,
): OptionsOrGroups<SelectPickerOptionType, GroupBase<SelectPickerOptionType>> => [
    {
        label: 'Published only',
        value: AppEnvDeploymentConfigType.PUBLISHED_ONLY,
        description: 'Configurations that will be deployed in the next deployment',
    },
    ...(isApprovalPolicyConfigured
        ? [
              {
                  label: 'Drafts only',
                  value: AppEnvDeploymentConfigType.DRAFT_ONLY,
                  description: 'Configurations in draft or approval pending state',
              },
              {
                  label: 'Saved (Includes drafts)',
                  value: AppEnvDeploymentConfigType.PUBLISHED_WITH_DRAFT,
                  description: 'Last saved configurations including any drafts',
              },
          ]
        : []),
    {
        label: 'Previous deployments',
        options: previousDeploymentsList.map(
            ({ finishedOn, chartVersion, pipelineId, deploymentTemplateHistoryId, chartRefId }) => ({
                label: `${moment(finishedOn).format(Moment12HourFormat)} (v${chartVersion})`,
                value: getPreviousDeploymentOptionValue(
                    deploymentTemplateHistoryId,
                    pipelineId,
                    isManifestView ? chartRefId : null,
                ),
            }),
        ),
    },
]

export const deploymentConfigDiffTabs = {
    CONFIGURATION: 'Configuration',
    MANIFEST: 'Manifest Output',
}

export const getDeploymentConfigDiffTabs = (): DeploymentConfigDiffProps['tabConfig']['tabs'] =>
    Object.values(deploymentConfigDiffTabs)

export const getConfigChartRefId = (data: any) =>
    data.latestEnvChartRef || data.latestAppChartRef || data.latestChartRef

const getDeploymentDraftData = (config: AppEnvDeploymentConfigDTO) => {
    try {
        const parsedDraftData = JSON.parse(
            config?.deploymentTemplate?.deploymentDraftData?.configData[0].draftMetadata.data || null,
        )

        return parsedDraftData
    } catch {
        return null
    }
}

const getDraftConfigChartRefId = (config: AppEnvDeploymentConfigDTO) =>
    getDeploymentDraftData(config)?.chartRefId ?? null

export const getManifestRequestValues = (config: AppEnvDeploymentConfigDTO): { data: string; chartRefId: number } => {
    if (!config) {
        return null
    }

    const { deploymentTemplate } = config
    const parsedDraftData = getDeploymentDraftData(config)
    const _data =
        parsedDraftData?.envOverrideValues ||
        parsedDraftData?.valuesOverride ||
        parsedDraftData?.defaultAppOverride ||
        deploymentTemplate?.data ||
        null

    return {
        data: _data ? YAMLStringify(_data) ?? '' : '',
        chartRefId: getDraftConfigChartRefId(config),
    }
}

export const isConfigTypeNonDraftOrPublished = (type: AppEnvDeploymentConfigType) =>
    type !== AppEnvDeploymentConfigType.DRAFT_ONLY &&
    type !== AppEnvDeploymentConfigType.PUBLISHED_WITH_DRAFT &&
    type !== AppEnvDeploymentConfigType.PUBLISHED_ONLY

export const isConfigTypePublished = (type: AppEnvDeploymentConfigType) =>
    type === AppEnvDeploymentConfigType.PUBLISHED_WITH_DRAFT || type === AppEnvDeploymentConfigType.PUBLISHED_ONLY
