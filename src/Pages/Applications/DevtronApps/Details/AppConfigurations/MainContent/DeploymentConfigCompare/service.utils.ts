import {
    AppEnvDeploymentConfigDTO,
    AppEnvDeploymentConfigType,
    getAppEnvDeploymentConfig,
    ResponseType,
    TemplateListType,
} from '@devtron-labs/devtron-fe-common-lib'

import { getDeploymentManisfest } from '@Components/deploymentConfig/service'

import { DeploymentConfigCompareProps } from '../../AppConfig.types'

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
    appId,
    envId,
    configType,
    values,
    identifierId,
    pipelineId,
    manifestChartRefId,
}: {
    appId: number
    envId: number
    configType: AppEnvDeploymentConfigType
    values: string
    identifierId: number
    pipelineId: number
    manifestChartRefId: number
}) => {
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

    return !isDraftSelected || values
        ? getDeploymentManisfest({
              appId: +appId,
              valuesAndManifestFlag: 2,
              chartRefId: manifestChartRefId,
              ...(envId
                  ? {
                        envId: +envId,
                    }
                  : {}),
              ...(envId && !values && !isDefaultSelected
                  ? {
                        type:
                            identifierId && pipelineId
                                ? TemplateListType.DeployedOnSelfEnvironment
                                : TemplateListType.PublishedOnEnvironments,
                        deploymentTemplateHistoryId: identifierId,
                        pipelineId,
                    }
                  : {}),
              ...(values && !isDefaultSelected
                  ? {
                        values,
                    }
                  : {}),
          })
        : nullResponse
}
