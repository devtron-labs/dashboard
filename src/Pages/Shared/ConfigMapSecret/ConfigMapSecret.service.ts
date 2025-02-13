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

import { MutableRefObject } from 'react'
import {
    get,
    post,
    trash,
    getResolvedDeploymentTemplate,
    ValuesAndManifestFlagDTO,
    GetResolvedDeploymentTemplateProps,
    AppEnvDeploymentConfigType,
    getAppEnvDeploymentConfig,
    ConfigResourceType,
    getIsRequestAborted,
    DraftMetadataDTO,
    showError,
    JobCMSecretDataDTO,
    CMSecretComponentType,
    GetTemplateAPIRouteType,
    getTemplateAPIRoute,
} from '@devtron-labs/devtron-fe-common-lib'

import { Routes } from '@Config/constants'

import { importComponentFromFELibrary } from '@Components/common'
import {
    GetConfigMapSecretConfigDataProps,
    GetConfigMapSecretConfigDataReturnType,
    UpdateConfigMapSecretProps,
    DeleteConfigMapSecretProps,
    DeleteEnvConfigMapSecretProps,
    OverrideConfigMapSecretProps,
    GetCMSecretProps,
    ConfigMapSecretManifestProps,
    ConfigMapSecretManifestDTO,
} from './types'

const getDraftByResourceName = importComponentFromFELibrary('getDraftByResourceName', null, 'function')

export const updateConfigMap = ({ id, appId, payload, signal, isTemplateView }: UpdateConfigMapSecretProps) => {
    const URL = isTemplateView
        ? getTemplateAPIRoute({ type: GetTemplateAPIRouteType.CONFIG_CM, queryParams: { id: appId } })
        : `${Routes.APP_CREATE_CONFIG_MAP}`

    return post(
        URL,
        {
            ...(id && { id }),
            appId,
            configData: [payload],
        },
        { signal },
    )
}

export const deleteConfigMap = ({ id, appId, name, isTemplateView }: DeleteConfigMapSecretProps) => {
    const URL = isTemplateView
        ? getTemplateAPIRoute({
              type: GetTemplateAPIRouteType.CONFIG_CM,
              queryParams: { id: appId, envId: id, name },
          })
        : `${Routes.APP_CREATE_CONFIG_MAP}/${appId}/${id}?name=${name}`

    return trash(URL)
}

export const deleteEnvConfigMap = ({ id, appId, envId, name, isTemplateView }: DeleteEnvConfigMapSecretProps) => {
    const url = isTemplateView
        ? getTemplateAPIRoute({
              type: GetTemplateAPIRouteType.CONFIG_CM,
              queryParams: {
                  id: appId,
                  envId,
                  // TODO: Confirm this
                  resourceId: id,
                  name,
              },
          })
        : `${Routes.APP_CREATE_ENV_CONFIG_MAP}/${appId}/${envId}/${id}?name=${name}`

    return trash(url)
}
export const overRideConfigMap = ({ appId, envId, payload, signal, isTemplateView }: OverrideConfigMapSecretProps) => {
    const url = isTemplateView
        ? getTemplateAPIRoute({
              type: GetTemplateAPIRouteType.CONFIG_CM,
              queryParams: {
                  id: appId,
              },
          })
        : Routes.APP_CREATE_ENV_CONFIG_MAP

    return post(
        url,
        {
            appId,
            environmentId: envId,
            configData: [payload],
        },
        { signal },
    )
}

export const updateSecret = ({ id, appId, payload, signal, isTemplateView }: UpdateConfigMapSecretProps) => {
    const URL = isTemplateView
        ? getTemplateAPIRoute({
              type: GetTemplateAPIRouteType.CONFIG_CS,
              queryParams: { id: appId },
          })
        : `${Routes.APP_CREATE_SECRET}`

    return post(
        URL,
        {
            ...(id && { id }),
            appId,
            configData: [payload],
        },
        { signal },
    )
}

export const deleteSecret = ({ id, appId, name, isTemplateView }: DeleteConfigMapSecretProps) => {
    const URL = isTemplateView
        ? getTemplateAPIRoute({
              type: GetTemplateAPIRouteType.CONFIG_CM,
              queryParams: { id: appId, envId: id, name },
          })
        : `${Routes.APP_CREATE_SECRET}/${appId}/${id}?name=${name}`

    return trash(URL)
}

export const deleteEnvSecret = ({ id, appId, envId, name, isTemplateView }: DeleteEnvConfigMapSecretProps) => {
    const url = isTemplateView
        ? getTemplateAPIRoute({
              type: GetTemplateAPIRouteType.CONFIG_CS,
              queryParams: {
                  id: appId,
                  envId,
                  // TODO: Check with BE
                  resourceId: id,
                  name,
              },
          })
        : `${Routes.APP_CREATE_ENV_SECRET}/${appId}/${envId}/${id}?name=${name}`

    return trash(url)
}

export const overRideSecret = ({ appId, envId, payload, signal, isTemplateView }: OverrideConfigMapSecretProps) => {
    const url = isTemplateView
        ? getTemplateAPIRoute({
              type: GetTemplateAPIRouteType.CONFIG_CS,
              queryParams: {
                  id: appId,
              },
          })
        : Routes.APP_CREATE_ENV_SECRET

    return post(
        url,
        {
            appId,
            environmentId: envId,
            configData: [payload],
        },
        { signal },
    )
}

export const getJobCMSecret = ({
    componentType,
    id,
    appId,
    envId,
    name,
    signal,
}: GetCMSecretProps): Promise<JobCMSecretDataDTO> => {
    let url = ''
    if (envId !== null && envId !== undefined) {
        url = `${
            componentType === CMSecretComponentType.Secret
                ? Routes.APP_CREATE_ENV_SECRET
                : Routes.APP_CREATE_ENV_CONFIG_MAP
        }/edit/${appId}/${envId}`
    } else {
        url = `${componentType === CMSecretComponentType.Secret ? Routes.APP_CREATE_SECRET : Routes.APP_CREATE_CONFIG_MAP}/edit/${appId}`
    }
    return get(`${url}/${id}?name=${name}`, { signal })
}

export const getConfigMapSecretConfigData = async <IsJob extends boolean = false>({
    isJob,
    appName,
    envName,
    componentType,
    appId,
    envId,
    name,
    resourceId,
    abortControllerRef,
    isTemplateView,
}: GetConfigMapSecretConfigDataProps<IsJob>) => {
    try {
        const { result } = await (isJob
            ? getJobCMSecret({
                  componentType,
                  id: resourceId,
                  appId,
                  name,
                  envId,
                  signal: abortControllerRef.current.signal,
              })
            : getAppEnvDeploymentConfig({
                  params: {
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
                  appId,
                  isTemplateView,
                  signal: abortControllerRef.current.signal,
              }))

        return result as GetConfigMapSecretConfigDataReturnType<IsJob>
    } catch (error) {
        if (!getIsRequestAborted(error)) {
            throw error
        }

        return null
    }
}

export const getConfigMapSecretConfigDraftData = async ({
    appId,
    envId,
    name,
    componentType,
    abortControllerRef,
}: Pick<
    GetConfigMapSecretConfigDataProps<false>,
    'abortControllerRef' | 'appId' | 'envId' | 'componentType' | 'name'
>) => {
    try {
        const res = await (getDraftByResourceName
            ? getDraftByResourceName(appId, envId ?? -1, componentType, name, abortControllerRef)
            : null)

        return res ? (res.result as DraftMetadataDTO) : null
    } catch (error) {
        if (!getIsRequestAborted(error)) {
            throw error
        }

        return null
    }
}

export const getConfigMapSecretResolvedValues = (
    params: Required<Pick<GetResolvedDeploymentTemplateProps, 'appId' | 'envId' | 'values'>>,
    signal?: AbortSignal,
) =>
    getResolvedDeploymentTemplate(
        {
            ...params,
            valuesAndManifestFlag: ValuesAndManifestFlagDTO.DEPLOYMENT_TEMPLATE,
            chartRefId: null,
        },
        signal,
    )

export const getConfigMapSecretManifest = async (
    params: ConfigMapSecretManifestProps,
    abortControllerRef?: MutableRefObject<AbortController>,
) => {
    try {
        const { result } = await post<
            ConfigMapSecretManifestDTO,
            Omit<ConfigMapSecretManifestProps, 'resourceType'> & { resourceType: ConfigResourceType }
        >(
            Routes.CONFIG_MANIFEST,
            {
                ...params,
                resourceType:
                    params.resourceType === CMSecretComponentType.ConfigMap
                        ? ConfigResourceType.ConfigMap
                        : ConfigResourceType.Secret,
            },
            { abortControllerRef },
        )

        return result
    } catch (error) {
        if (getIsRequestAborted(error)) {
            return null
        }

        showError(error)
        throw error
    }
}
