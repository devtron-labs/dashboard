import {
    AppEnvDeploymentConfigDTO,
    AppEnvDeploymentConfigType,
    getAppEnvDeploymentConfig,
    getDeploymentManifest,
    GetDeploymentManifestProps,
    ResolvedDeploymentTemplateDTO,
    ResponseType,
    TemplateListType,
} from '@devtron-labs/devtron-fe-common-lib'
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
        params: {
            configArea: 'AppConfiguration',
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
        },
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
              params: {
                  configArea: 'AppConfiguration',
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
              },
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

    const nullResponse: ResponseType<ResolvedDeploymentTemplateDTO> = {
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

    const isHistoricData = !values && envId > -1

    const deploymentManifestRequestData: GetDeploymentManifestProps = {
        appId: +appId,
        chartRefId: manifestChartRefId,
        ...(envId > -1 && {
            envId,
        }),
        ...(!isDefaultSelected && {
            ...(isHistoricData
                ? {
                      type:
                          identifierId && pipelineId
                              ? TemplateListType.DeployedOnSelfEnvironment
                              : TemplateListType.PublishedOnEnvironments,
                      deploymentTemplateHistoryId: identifierId,
                      pipelineId,
                  }
                : {
                      values: values || null,
                  }),
        }),
    }

    return !isDraftSelected || values
        ? getDeploymentManifest(deploymentManifestRequestData)
        : Promise.resolve(nullResponse)
}
