import { generatePath } from 'react-router-dom'
import { GroupBase, OptionsOrGroups } from 'react-select'
import moment from 'moment'

import {
    AppEnvDeploymentConfigDTO,
    AppEnvDeploymentConfigType,
    DeploymentConfigDiffProps,
    EnvResourceType,
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
    DeploymentConfigParams,
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

export const isEnvProtected = (
    environments: EnvironmentOptionType[],
    envName: string,
    isBaseConfigProtected?: boolean,
) => environments.find(({ name }) => name === envName)?.isProtected ?? isBaseConfigProtected

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
                // otherwise leave it empty (base configuration).
                if (type === 'app') {
                    compareWith = environments.length && !compareTo ? environments[0].name : ''
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
    isProtected = false,
    isManifestView = false,
): OptionsOrGroups<SelectPickerOptionType, GroupBase<SelectPickerOptionType>> => [
    {
        label: 'Published only',
        value: AppEnvDeploymentConfigType.PUBLISHED_ONLY,
        description: 'Configurations that will be deployed in the next deployment',
    },
    ...(isProtected
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

export const getDeploymentConfigDiffTabs = (
    path: string,
    params: DeploymentConfigParams,
): DeploymentConfigDiffProps['tabConfig']['tabs'] => [
    {
        value: 'Configuration',
        href: generatePath(path, {
            ...params,
            resourceType: EnvResourceType.DeploymentTemplate,
            resourceName: null,
        }),
    },
    {
        value: 'Manifest Output',
        href: generatePath(path, {
            ...params,
            resourceType: EnvResourceType.Manifest,
            resourceName: null,
        }),
    },
]

export const getConfigChartRefId = (data: any) =>
    data.latestEnvChartRef || data.latestAppChartRef || data.latestChartRef

const getDraftConfigChartRefId = (config: AppEnvDeploymentConfigDTO) => {
    const parsedDraftData = JSON.parse(
        config?.deploymentTemplate?.deploymentDraftData?.configData[0].draftMetadata.data || null,
    )

    return parsedDraftData?.chartRefId ?? null
}

export const getManifestRequestValues = (config: AppEnvDeploymentConfigDTO): { data: string; chartRefId: number } => {
    if (!config) {
        return null
    }

    const { deploymentTemplate } = config
    const parsedDraftData = JSON.parse(
        deploymentTemplate?.deploymentDraftData?.configData[0].draftMetadata.data || null,
    )
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
