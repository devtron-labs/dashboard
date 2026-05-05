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

import { useMemo } from 'react'
import { generatePath, useLocation, useParams } from 'react-router-dom'

import { EnvResourceType } from '@devtron-labs/devtron-fe-common-lib'

import { URLS } from '@Config/routes'

import { DeploymentConfigCompareProps, DeploymentConfigParams } from '../../AppConfig.types'
import { DeploymentConfigCompare } from './DeploymentConfigCompare'
import { DeploymentConfigCompareWrapperProps } from './types'

const DeploymentConfigCompareWrapper = ({
    routePath,
    baseGoBackURL,
    appendEnvOverridePath = false,
    ...props
}: DeploymentConfigCompareWrapperProps) => {
    const params = useParams<DeploymentConfigParams>()
    const { resourceType: currentResourceType, resourceName: currentResourceName } = params
    const location = useLocation()

    const getNavItemHref = (resourceType: EnvResourceType, resourceName: string) =>
        `${generatePath(routePath, { ...params, resourceType, resourceName })}${location.search}`

    const calculatedGoBackURL = useMemo(() => {
        const envOverridePath = params.envId
            ? `/${URLS.APP_ENV_OVERRIDE_CONFIG}/${params.envId}`
            : `/${URLS.BASE_CONFIG}`
        if (
            currentResourceType === EnvResourceType.Manifest ||
            currentResourceType === EnvResourceType.PipelineStrategy
        ) {
            return `${baseGoBackURL}${appendEnvOverridePath ? envOverridePath : ''}`
        }
        return `${baseGoBackURL}${appendEnvOverridePath ? envOverridePath : ''}/${currentResourceType}${currentResourceName ? `/${currentResourceName}` : ''}`
    }, [baseGoBackURL, appendEnvOverridePath, currentResourceType, currentResourceName])

    return (
        <DeploymentConfigCompare
            {...(props as DeploymentConfigCompareProps)}
            goBackURL={calculatedGoBackURL}
            getNavItemHref={getNavItemHref}
            routePath={routePath}
        />
    )
}

export default DeploymentConfigCompareWrapper
