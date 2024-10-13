import { OptionsOrGroups, GroupBase } from 'react-select'

import {
    AppEnvDeploymentConfigDTO,
    DeploymentWithConfigType,
    EnvResourceType,
    ERROR_STATUS_CODE,
    ResponseType,
    SelectPickerOptionType,
} from '@devtron-labs/devtron-fe-common-lib'

import { PipelineConfigDiffQueryParams, PipelineConfigDiffQueryParamsType } from './types'

const tooltipProps = (showTooltip = false) =>
    showTooltip
        ? {
              content: (
                  <>
                      <h2 className="fs-12 fw-6 lh-18 m-0">Config not available!</h2>
                      <p className="fs-12 fw-4 lh-18 m-0">Please select a different image or configuration to deploy</p>
                  </>
              ),
              placement: 'left' as const,
              arrow: false,
              className: 'w-200 mr-6',
          }
        : {}

export const getPipelineDeploymentConfigSelectorOptions = (
    isLastDeployedConfigAvailable: boolean,
    isRollbackTriggerSelected: boolean,
    isConfigAvailable,
): OptionsOrGroups<SelectPickerOptionType, GroupBase<SelectPickerOptionType>> => [
    {
        label: 'Select a configuration to deploy',
        options: [
            {
                label: 'Last saved config',
                value: DeploymentWithConfigType.LAST_SAVED_CONFIG,
                description: 'Use last saved configuration to deploy',
                tooltipProps: tooltipProps(!isConfigAvailable(DeploymentWithConfigType.LAST_SAVED_CONFIG)),
            },
            ...(isLastDeployedConfigAvailable
                ? [
                      {
                          label: 'Last deployed config',
                          value: DeploymentWithConfigType.LATEST_TRIGGER_CONFIG,
                          description: 'Retain currently deployed configuration',
                          tooltipProps: tooltipProps(
                              !isConfigAvailable(DeploymentWithConfigType.LATEST_TRIGGER_CONFIG),
                          ),
                      },
                  ]
                : []),
            ...(isRollbackTriggerSelected
                ? [
                      {
                          label: 'Config deployed with selected image',
                          value: DeploymentWithConfigType.SPECIFIC_TRIGGER_CONFIG,
                          description: 'Use configuration deployed with selected image',
                          tooltipProps: tooltipProps(
                              !isConfigAvailable(DeploymentWithConfigType.SPECIFIC_TRIGGER_CONFIG),
                          ),
                      },
                  ]
                : []),
        ],
    },
]

export const getComparisonDataBasedOnDeploy = ({
    deploy,
    latestDeploymentConfig,
    specificDeploymentConfig,
    recentDeploymentConfig,
}: {
    deploy: DeploymentWithConfigType
    latestDeploymentConfig: AppEnvDeploymentConfigDTO
    specificDeploymentConfig: AppEnvDeploymentConfigDTO
    recentDeploymentConfig: AppEnvDeploymentConfigDTO
}) => {
    if (deploy === DeploymentWithConfigType.SPECIFIC_TRIGGER_CONFIG) {
        return specificDeploymentConfig
    }
    if (deploy === DeploymentWithConfigType.LATEST_TRIGGER_CONFIG) {
        return recentDeploymentConfig
    }
    return latestDeploymentConfig
}

export const parseCompareWithSearchParams =
    (isRollbackTriggerSelected: boolean) =>
    (searchParams: URLSearchParams): PipelineConfigDiffQueryParamsType => {
        let deploy = searchParams.get(PipelineConfigDiffQueryParams.DEPLOY)
        if (!deploy) {
            deploy = isRollbackTriggerSelected
                ? DeploymentWithConfigType.SPECIFIC_TRIGGER_CONFIG
                : DeploymentWithConfigType.LAST_SAVED_CONFIG
        }

        return {
            [PipelineConfigDiffQueryParams.DEPLOY]: deploy as DeploymentWithConfigType,
            [PipelineConfigDiffQueryParams.RESOURCE_NAME]: searchParams.get(
                PipelineConfigDiffQueryParams.RESOURCE_NAME,
            ),
            [PipelineConfigDiffQueryParams.RESOURCE_TYPE]: searchParams.get(
                PipelineConfigDiffQueryParams.RESOURCE_TYPE,
            ) as EnvResourceType,
            [PipelineConfigDiffQueryParams.MODE]: searchParams.get(PipelineConfigDiffQueryParams.MODE),
        }
    }

export const getPipelineDeploymentConfigFromPromiseSettled = (
    res: PromiseSettledResult<ResponseType<AppEnvDeploymentConfigDTO>>,
) => (res.status === 'fulfilled' ? res.value?.result ?? null : null)

export const getPipelineDeploymentConfigErrFromPromiseSettled = (
    res: PromiseSettledResult<ResponseType<AppEnvDeploymentConfigDTO>>,
) => (res.status === 'rejected' && res.reason?.code !== ERROR_STATUS_CODE.NOT_FOUND ? res.reason : null)
