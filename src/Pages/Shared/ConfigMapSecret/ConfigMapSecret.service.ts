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

import {
    get,
    post,
    trash,
    ResponseType,
    getResolvedDeploymentTemplate,
    ValuesAndManifestFlagDTO,
    GetResolvedDeploymentTemplateProps,
    AppEnvDeploymentConfigType,
    getAppEnvDeploymentConfig,
    ConfigResourceType,
    getIsRequestAborted,
    DraftMetadataDTO,
} from '@devtron-labs/devtron-fe-common-lib'

import { Routes } from '@Config/constants'

import { importComponentFromFELibrary } from '@Components/common'
import {
    CMSecretDTO,
    CMSecretComponentType,
    GetConfigMapSecretConfigDataProps,
    GetConfigMapSecretConfigDataReturnType,
    UpdateConfigMapSecretProps,
    DeleteConfigMapSecretProps,
    DeleteEnvConfigMapSecretProps,
    OverrideConfigMapSecretProps,
    GetCMSecretProps,
} from './types'

const getDraftByResourceName = importComponentFromFELibrary('getDraftByResourceName', null, 'function')

export const updateConfigMap = ({ id, appId, payload, signal }: UpdateConfigMapSecretProps) =>
    post(
        `${Routes.APP_CREATE_CONFIG_MAP}`,
        {
            ...(id && { id }),
            appId,
            configData: [payload],
        },
        { signal },
    )

export const deleteConfigMap = ({ id, appId, name }: DeleteConfigMapSecretProps) =>
    trash(`${Routes.APP_CREATE_CONFIG_MAP}/${appId}/${id}?name=${name}`)

export const deleteEnvConfigMap = ({ id, appId, envId, name }: DeleteEnvConfigMapSecretProps) =>
    trash(`${Routes.APP_CREATE_ENV_CONFIG_MAP}/${appId}/${envId}/${id}?name=${name}`)

export const overRideConfigMap = ({ appId, envId, payload, signal }: OverrideConfigMapSecretProps) =>
    post(
        `${Routes.APP_CREATE_ENV_CONFIG_MAP}`,
        {
            appId,
            environmentId: envId,
            configData: [payload],
        },
        { signal },
    )

export const updateSecret = ({ id, appId, payload, signal }: UpdateConfigMapSecretProps) =>
    post(
        `${Routes.APP_CREATE_SECRET}`,
        {
            ...(id && { id }),
            appId,
            configData: [payload],
        },
        { signal },
    )

export const deleteSecret = ({ id, appId, name }: DeleteConfigMapSecretProps) =>
    trash(`${Routes.APP_CREATE_SECRET}/${appId}/${id}?name=${name}`)

export const deleteEnvSecret = ({ id, appId, envId, name }: DeleteEnvConfigMapSecretProps) =>
    trash(`${Routes.APP_CREATE_ENV_SECRET}/${appId}/${envId}/${id}?name=${name}`)

export const overRideSecret = ({ appId, envId, payload, signal }: OverrideConfigMapSecretProps) =>
    post(
        `${Routes.APP_CREATE_ENV_SECRET}`,
        {
            appId,
            environmentId: envId,
            configData: [payload],
        },
        { signal },
    )

export const getCMSecret = ({
    componentType,
    id,
    appId,
    envId,
    name,
    signal,
}: GetCMSecretProps): Promise<ResponseType<CMSecretDTO>> => {
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
}: GetConfigMapSecretConfigDataProps<IsJob>) => {
    try {
        const { result } = await (isJob
            ? getCMSecret({
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
            ? getDraftByResourceName(appId, envId ?? -1, componentType, name, abortControllerRef.current.signal)
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
