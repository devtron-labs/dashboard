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

import { ChangeEvent } from 'react'

import {
    AppEnvDeploymentConfigDTO,
    DeploymentConfigDiffRadioSelectConfig,
    DeploymentStrategyType,
    DeploymentWithConfigType,
    ERROR_STATUS_CODE,
    ResponseType,
    STRATEGY_TYPE_TO_TITLE_MAP,
} from '@devtron-labs/devtron-fe-common-lib'

import { PIPELINE_CONFIG_VS_LABEL_MAP } from './constants'
import {
    GetPipelineDeploymentConfigSelectorConfigParams,
    PipelineConfigDiffQueryParams,
    PipelineConfigDiffQueryParamsType,
} from './types'

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

export const getPipelineDeploymentConfigSelectorConfig = ({
    isLastDeployedConfigAvailable,
    isConfigAvailable,
    isRollbackTriggerSelected,
    deploy,
    deploymentStrategy,
    onDeploymentConfigChange,
    onStrategyChange,
    pipelineStrategyOptions,
}: GetPipelineDeploymentConfigSelectorConfigParams): DeploymentConfigDiffRadioSelectConfig => {
    const handleChangeStrategy = (e: ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target
        onStrategyChange(value as DeploymentStrategyType)
    }

    const handleChangeDeploymentConfig = (e: ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target
        onDeploymentConfigChange(value as DeploymentWithConfigType)
    }

    return {
        triggerElementTitle: `${PIPELINE_CONFIG_VS_LABEL_MAP[deploy]}${deploymentStrategy ? ` with ${STRATEGY_TYPE_TO_TITLE_MAP[deploymentStrategy]} strategy` : ''}`,
        radioGroupConfig: [
            {
                title: 'Select a configuration',
                name: 'select-config',
                options: [
                    {
                        label: PIPELINE_CONFIG_VS_LABEL_MAP[DeploymentWithConfigType.LAST_SAVED_CONFIG],
                        value: DeploymentWithConfigType.LAST_SAVED_CONFIG,
                        description: 'Use last saved configuration to deploy',
                        tooltipProps: tooltipProps(!isConfigAvailable(DeploymentWithConfigType.LAST_SAVED_CONFIG)),
                    },
                    ...(isLastDeployedConfigAvailable
                        ? [
                              {
                                  label: PIPELINE_CONFIG_VS_LABEL_MAP[DeploymentWithConfigType.LATEST_TRIGGER_CONFIG],
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
                                  label: PIPELINE_CONFIG_VS_LABEL_MAP[DeploymentWithConfigType.SPECIFIC_TRIGGER_CONFIG],
                                  value: DeploymentWithConfigType.SPECIFIC_TRIGGER_CONFIG,
                                  description: 'Use configuration deployed with selected image',
                                  tooltipProps: tooltipProps(
                                      !isConfigAvailable(DeploymentWithConfigType.SPECIFIC_TRIGGER_CONFIG),
                                  ),
                              },
                          ]
                        : []),
                ],
                onChange: handleChangeDeploymentConfig,
                groupValue: deploy,
            },
            ...(pipelineStrategyOptions.length > 1 && deploymentStrategy
                ? [
                      {
                          title: 'Select strategy type',
                          name: 'select-strategy',
                          options: pipelineStrategyOptions.map(({ deploymentTemplate }) => ({
                              label: STRATEGY_TYPE_TO_TITLE_MAP[deploymentTemplate] ?? deploymentTemplate,
                              value: deploymentTemplate,
                          })),
                          onChange: handleChangeStrategy,
                          groupValue: deploymentStrategy,
                      },
                  ]
                : []),
        ],
    }
}

export const getComparisonDataBasedOnDeployAndStrategy = ({
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
            [PipelineConfigDiffQueryParams.MODE]: searchParams.get(PipelineConfigDiffQueryParams.MODE),
        }
    }

export const getPipelineDeploymentConfigFromPromiseSettled = (
    res: PromiseSettledResult<ResponseType<AppEnvDeploymentConfigDTO>>,
) => (res.status === 'fulfilled' ? res.value?.result ?? null : null)

export const getPipelineDeploymentConfigErrFromPromiseSettled = (
    res: PromiseSettledResult<ResponseType<AppEnvDeploymentConfigDTO>>,
) => (res.status === 'rejected' && res.reason?.code !== ERROR_STATUS_CODE.NOT_FOUND ? res.reason : null)
