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
    getClusterListMin,
    getEnvironmentListMinPublic,
    post,
    ResponseType,
    SelectPickerOptionType,
    sortCallback,
} from '@devtron-labs/devtron-fe-common-lib'

import { Routes } from '../../config'
import { ScanListPayloadType, SecurityScansTabMultiFilterKeys } from './SecurityScansTab/types'
import { SEVERITY_FILTER_OPTIONS } from './Vulnerabilities/constants'
import {
    CVEControlList,
    CVEControlListPayload,
    GetVulnerabilityPolicyResponse,
    ResourceLevel,
    SecurityScanListResponseType,
} from './security.types'

export function getClusterListMinNoAuth() {
    const URL = `${Routes.CLUSTER}/autocomplete?auth=false`
    return get(URL)
}

export const getVulnerabilityFilterData = async (): Promise<
    Record<SecurityScansTabMultiFilterKeys, SelectPickerOptionType[]>
> => {
    const [envResponse, clusterResponse] = await Promise.allSettled([
        getEnvironmentListMinPublic(),
        getClusterListMin(),
    ])

    const environment = (envResponse?.status === 'fulfilled' ? envResponse.value.result : [])
        .map((env) => ({
            label: env.environment_name,
            value: `${env.id}`,
        }))
        .sort((a, b) => sortCallback('label', a, b))

    const cluster = (clusterResponse?.status === 'fulfilled' ? clusterResponse.value.result : [])
        .map((clusterDetails) => ({
            label: clusterDetails.cluster_name,
            value: `${clusterDetails.id}`,
        }))
        .sort((a, b) => sortCallback('label', a, b))

    return {
        severity: SEVERITY_FILTER_OPTIONS,
        cluster,
        environment,
    }
}

export function getSecurityScanList(
    payload: ScanListPayloadType,
    abortSignal: AbortSignal,
): Promise<SecurityScanListResponseType> {
    const URL = 'security/scan/list'
    return post(URL, payload, { signal: abortSignal }).then((response) => {
        const securityScans = response.result?.scanList || []
        return {
            result: {
                offset: response.result?.offset,
                totalCount: response.result?.total,
                pageSize: response.result?.size || 20,
                securityScans: securityScans.map((scan) => ({
                    appId: scan.appId,
                    envId: scan.envId,
                    name: scan.name,
                    imageScanDeployInfoId: scan.imageScanDeployInfoId,
                    environment: scan.environment,
                    severityCount: {
                        critical: scan.severityCount.critical,
                        high: scan.severityCount.high,
                        medium: scan.severityCount.medium,
                        low: scan.severityCount.low,
                        unknown: scan.severityCount.unknown,
                    },
                    totalSeverities: Object.values(scan.severityCount ?? {}).reduce(
                        (acc: number, curr: number) => acc + curr,
                        0,
                    ),
                    lastExecution: scan.lastChecked || '-',
                    fixableVulnerabilities: scan.fixableVulnerabilities,
                })),
            },
        }
    })
}

export function getVulnerabilities(level: ResourceLevel, id?: number): Promise<GetVulnerabilityPolicyResponse> {
    const URL = `security/policy/list?level=${level}`
    let qs = ``
    if (id) {
        qs = `&id=${id}`
    }
    return get(`${URL}${qs}`).then((response) => ({
        ...response,
        result: {
            ...response.result,
            level: response.result.level,
            policies: response.result.policies
                ? response.result.policies.map((p) => ({
                      ...p,
                      severities: p.severities,
                      cves: p.cves || [],
                  }))
                : [],
        },
    }))
}

export function savePolicy(payload): Promise<ResponseType> {
    const URL = `security/policy/save`
    return post(URL, payload)
}

export function updatePolicy(payload): Promise<ResponseType> {
    const URL = `security/policy/update`
    return post(URL, payload)
}

export function getCVEControlList(payload: CVEControlListPayload): Promise<ResponseType<CVEControlList>> {
    const URL = Routes.SECURITY_SCAN_CVE_EXPOSURE
    return post(URL, payload).then((response) => ({
        ...response,
        result: {
            totalCount: response.result?.total ?? 0,
            scanList: response.result?.list
                ? response.result.list.map((cve) => ({
                      appName: cve.appName ?? '',
                      envName: cve.envName ?? '',
                      policy: cve.blocked ? 'block' : 'whitelist',
                  }))
                : [],
        },
    }))
}
