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

import { useParams } from 'react-router-dom'

import { CMSecretComponentType, ErrorScreenManager, Progressing, useQuery } from '@devtron-labs/devtron-fe-common-lib'

import { getAppChartRefForAppAndEnv } from '@Services/service'

import { ConfigMapSecretContainer } from './ConfigMapSecretContainer'
import { CM_SECRET_COMPONENT_NAME } from './constants'
import { CMSecretWrapperProps } from './types'

export const ConfigMapSecretWrapper = (props: CMSecretWrapperProps) => {
    // PROPS
    const { componentType = CMSecretComponentType.ConfigMap, onErrorRedirectURL, isTemplateView } = props

    // HOOKS
    const { appId, envId, name } = useParams<{ appId: string; envId: string; name: string }>()

    const {
        data: appChartRef,
        isLoading,
        isFetching,
        error: appChartRefErr,
        refetch,
    } = useQuery({
        queryFn: ({ signal }) => getAppChartRefForAppAndEnv(+appId, +envId, isTemplateView, signal),
        queryKey: [componentType, appId, envId, isTemplateView],
        select: ({ result }) => result,
    })

    const appChartRefLoading = isLoading || isFetching

    if (appChartRefLoading) {
        return <Progressing fullHeight pageLoader />
    }

    if (appChartRefErr) {
        return <ErrorScreenManager code={appChartRefErr.code} redirectURL={onErrorRedirectURL} reload={refetch} />
    }

    return (
        <ConfigMapSecretContainer
            key={`${CM_SECRET_COMPONENT_NAME[componentType]}-${name}`}
            appChartRef={appChartRef}
            {...props}
        />
    )
}
