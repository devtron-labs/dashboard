import { MutableRefObject } from 'react'

import {
    AppEnvDeploymentConfigDTO,
    getAppEnvDeploymentConfig,
    getDeploymentTemplateValues,
} from '@devtron-labs/devtron-fe-common-lib'

import { UsePipelineDeploymentConfigProps } from './types'

export const getDeploymentTemplateResolvedData = ({
    appName,
    envName,
    data,
    abortControllerRef,
}: Pick<UsePipelineDeploymentConfigProps, 'appName' | 'envName'> & {
    data: AppEnvDeploymentConfigDTO
    abortControllerRef: MutableRefObject<AbortController>
}) =>
    data
        ? getAppEnvDeploymentConfig({
              params: {
                  configArea: 'ResolveData',
                  appName,
                  envName,
              },
              payload: {
                  values: getDeploymentTemplateValues(data.deploymentTemplate),
              },
              signal: abortControllerRef.current?.signal,
          })
        : { result: null }
