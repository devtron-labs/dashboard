import {
    AppEnvDeploymentConfigDTO,
    AppEnvDeploymentConfigType,
    getAppEnvDeploymentConfig,
    ResponseType,
    TemplateListType,
} from '@devtron-labs/devtron-fe-common-lib'

import { getDeploymentManisfest } from '@Components/deploymentConfig/service'

import { GetConfigDiffDataProps, GetDeploymentTemplateDataProps, GetManifestDataProps } from '../../AppConfig.types'
import { getAppAndEnvIds } from './utils'

export const getConfigDiffData = ({
    type,
    appName,
    envName,
    compareName,
    configType,
    identifierId,
    pipelineId,
}: GetConfigDiffDataProps) =>
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
}: GetDeploymentTemplateDataProps) => {
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
}: GetManifestDataProps) => {
    const { compareToAppId: appId, compareToEnvId: envId } = getAppAndEnvIds({
        appId: _appId,
        envId: _envId,
        compareTo: compareName,
        compareWith: compareName,
        environments,
        type,
    })

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
