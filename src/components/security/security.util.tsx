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
    BreadcrumbText,
    useBreadcrumb,
    getSecurityCenterBreadcrumb,
} from '@devtron-labs/devtron-fe-common-lib'

import { SECURITY_BREADCRUMB_CONFIG } from './constants'
import { VulnerabilityExposureFilterKeys, VulnerabilityExposureSearchParams } from './security.types'
import { matchPath } from 'react-router-dom'

export const parseVulnerabilityExposureSearchParams = (searchParams: URLSearchParams) => ({
    [VulnerabilityExposureFilterKeys.cluster]: searchParams.getAll(VulnerabilityExposureFilterKeys.cluster),
    [VulnerabilityExposureFilterKeys.environment]: searchParams.getAll(VulnerabilityExposureFilterKeys.environment),
    [VulnerabilityExposureSearchParams.cveName]: searchParams.get(VulnerabilityExposureSearchParams.cveName) ?? '',
})

export const getTippyContent = () => (
    <div className="px-12 pt-12 fs-13 fw-4">
        Devtron provides DevSecOps capabilities across your software development life cycle.
        <p className="pt-20 m-0">
            One of the key components of DevSecOps is the detection of security risks. Currently, Devtron supports the
            following types of scanning:
        </p>
        <ul className="pl-20">
            <li>Image Scan</li>
            <li>Code Scan</li>
            <li>Kubernetes Manifest Scan</li>
        </ul>
    </div>
)

export const getSecurityBreadcrumbAlias = (url: string): Parameters<typeof useBreadcrumb>[0] => {
    const cleanUrl = url.split('?')[0].split('#')[0]

    const alias = getSecurityCenterBreadcrumb()
    SECURITY_BREADCRUMB_CONFIG.forEach(({ key, route, heading }) => {
        const isActive = !!matchPath(cleanUrl, { path: route, exact: false })
        alias[key] = {
            component: <BreadcrumbText isActive={isActive} heading={heading} />,
            linked: false
    }
    })

    return { alias }
}
