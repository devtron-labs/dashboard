import {
    AppEnvDeploymentConfigDTO,
    AppEnvDeploymentConfigType,
    getAppEnvDeploymentConfig,
    ResponseType,
    TemplateListType,
} from '@devtron-labs/devtron-fe-common-lib'

import { getDeploymentManisfest } from '@Components/deploymentConfig/service'

import { DeploymentConfigCompareProps } from '../../AppConfig.types'
import { getEnvironmentIdByEnvironmentName } from './utils'

export const getConfigDiffData = ({
    type,
    appName,
    envName,
    compareName,
    configType,
    identifierId,
    pipelineId,
}: { configType: AppEnvDeploymentConfigType; compareName: string; identifierId: number; pipelineId: number } & Pick<
    DeploymentConfigCompareProps,
    'appName' | 'envName' | 'type'
>) =>
    getAppEnvDeploymentConfig({
        ...(type === 'app'
            ? {
                  appName,
                  envName: compareName || '',
              }
            : {
                  appName: compareName || '',
                  envName,
              }),
        configType,
        identifierId,
        pipelineId,
    })

export const getDeploymentTemplateData = ({
    configType,
    type,
    appName,
    envName,
    compareName,
}: { configType: AppEnvDeploymentConfigType; compareName: string } & Pick<
    DeploymentConfigCompareProps,
    'type' | 'appName' | 'envName'
>) => {
    const nullResponse: ResponseType<AppEnvDeploymentConfigDTO> = {
        code: 200,
        status: 'OK',
        result: null,
    }

    return configType !== AppEnvDeploymentConfigType.PREVIOUS_DEPLOYMENTS &&
        configType !== AppEnvDeploymentConfigType.DEFAULT_VERSION
        ? getAppEnvDeploymentConfig({
              ...(type === 'app'
                  ? {
                        appName,
                        envName: compareName || '',
                    }
                  : {
                        appName: compareName || '',
                        envName,
                    }),
              configType,
          })
        : nullResponse
}

export const getManifestData = ({
    type,
    appId: _appId,
    envId: _envId,
    configType,
    compareName,
    values,
    identifierId,
    pipelineId,
    manifestChartRefId,
    environments,
}: {
    appId: string
    envId: string
    configType: AppEnvDeploymentConfigType
    compareName: string
    values: string
    identifierId: number
    pipelineId: number
    manifestChartRefId: number
} & Pick<DeploymentConfigCompareProps, 'type' | 'environments'>) => {
    // Default: use appId and envId
    let appId = +_appId
    let envId = getEnvironmentIdByEnvironmentName(environments, compareName)

    // If type is 'appGroup', switch appId & envId
    if (type === 'appGroup') {
        appId = getEnvironmentIdByEnvironmentName(environments, compareName)
        envId = _envId ? +_envId : null
    }

    const nullResponse = {
        code: 200,
        status: 'OK',
        result: {
            data: '',
            resolvedData: '',
            variableSnapshot: null,
        },
    }

    const isDraftSelected =
        configType === AppEnvDeploymentConfigType.DRAFT_ONLY ||
        configType === AppEnvDeploymentConfigType.PUBLISHED_WITH_DRAFT
    const isDefaultSelected = configType === AppEnvDeploymentConfigType.DEFAULT_VERSION

    const deploymentManifestRequestData: Record<string, string | number> = {
        appId: +appId,
        valuesAndManifestFlag: 2,
        chartRefId: manifestChartRefId,
    }

    if (envId > -1) {
        deploymentManifestRequestData.envId = envId

        if (!values && !isDefaultSelected) {
            deploymentManifestRequestData.type =
                identifierId && pipelineId
                    ? TemplateListType.DeployedOnSelfEnvironment
                    : TemplateListType.PublishedOnEnvironments
            deploymentManifestRequestData.deploymentTemplateHistoryId = identifierId
            deploymentManifestRequestData.pipelineId = pipelineId
        }
    }

    if (values && !isDefaultSelected) {
        deploymentManifestRequestData.values = values
    }

    return !isDraftSelected || values ? getDeploymentManisfest(deploymentManifestRequestData) : nullResponse
}
