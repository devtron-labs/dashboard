import { MutableRefObject } from 'react'

import {
    AppEnvDeploymentConfigType,
    ConfigResourceType,
    getAppEnvDeploymentConfig,
} from '@devtron-labs/devtron-fe-common-lib'

import { getCMSecret } from '../ConfigMapSecretOld/ConfigMapSecret.service'

import { CMSecretComponentType, ConfigMapSecretContainerProps } from './types'

export const getConfigMapSecretConfigData = ({
    isJob,
    appName,
    envName,
    componentType,
    appId,
    envId,
    name,
    resourceId,
    abortRef,
}: Pick<ConfigMapSecretContainerProps, 'isJob' | 'appName' | 'envName' | 'componentType'> & {
    envId: string
    appId: string
    name: string
    resourceId: number
    abortRef: MutableRefObject<AbortController>
}) =>
    isJob
        ? getCMSecret(componentType, resourceId, appId, name, envId, abortRef.current.signal)
        : getAppEnvDeploymentConfig(
              {
                  appName,
                  envName,
                  configType: AppEnvDeploymentConfigType.PUBLISHED_ONLY,
                  resourceId,
                  resourceName: name,
                  resourceType:
                      componentType === CMSecretComponentType.ConfigMap
                          ? ConfigResourceType.ConfigMap
                          : ConfigResourceType.Secret,
              },
              abortRef.current.signal,
          )
