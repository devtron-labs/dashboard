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
    handleUTCTime,
    post,
    ResponseType,
    sortCallback,
} from '@devtron-labs/devtron-fe-common-lib'
import { Routes } from '../../config'
import { SecurityScanListResponseType, ResourceLevel, GetVulnerabilityPolicyResponse, CVEControlList, CVEControlListPayload } from './security.types'
import { ScanListPayloadType } from './SecurityScansTab/types'

export function getClusterListMinNoAuth() {
    const URL = `${Routes.CLUSTER}/autocomplete?auth=false`
    return get(URL)
}

export function getVulnerabilityFilterData() {
    return Promise.all([getEnvironmentListMinPublic(), getClusterListMin()]).then(([envResponse, clusterResponse]) => {
        let environments = envResponse.result
            ? envResponse.result.map((env) => {
                  return {
                      label: env.environment_name,
                      value: `${env.id}`,
                  }
              })
            : []
        let clusters = clusterResponse
            ? clusterResponse.result.map((cluster) => {
                  return {
                      label: cluster.cluster_name,
                      value: `${cluster.id}`,
                  }
              })
            : []
        environments = environments.sort((a, b) => {
            return sortCallback('label', a, b)
        })
        clusters = clusters.sort((a, b) => {
            return sortCallback('label', a, b)
        })
        return {
            filters: {
                severity: [
                    { label: 'Critical', value: 'critical' },
                    { label: 'High', value: 'high' },
                    { label: 'Medium', value: 'medium' },
                    { label: 'Low', value: 'low' },
                    { label: 'Unknown', value: 'unknown' },
                ],
                clusters,
                environments,
            },
        }
    })
}

export function getSecurityScanList(payload: ScanListPayloadType, abortSignal: AbortSignal): Promise<SecurityScanListResponseType> {
    const URL = 'security/scan/list'
    return post(URL, payload, {signal: abortSignal}).then((response) => {
        const securityScans = response.result.scanList || []
        return {
            result: {
                offset: response.result.offset,
                totalCount: response.result.total,
                pageSize: response.result.size || 20,
                securityScans: securityScans.map((scan) => {
                    return {
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
                        lastExecution: scan.lastChecked || '-',
                    }
                }),
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
    return get(`${URL}${qs}`).then((response) => {
        return {
            ...response,
            result: {
                ...response.result,
                level: response.result.level,
                policies: response.result.policies
                    ? response.result.policies.map((p) => {
                          return {
                              ...p,
                              severities: p.severities,
                              cves: p.cves || [],
                          }
                      })
                    : [],
            },
        }
    })
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
    return post(URL, payload).then((response) => {
        return {
            ...response,
            result: {
                totalCount: response.result?.total ?? 0,
                scanList: response.result?.list
                    ? response.result.list.map((cve) => {
                          return {
                              appName: cve.appName ?? '',
                              envName: cve.envName ?? '',
                              policy: cve.blocked ? 'block' : 'whitelist',
                          }
                      })
                    : [],
            },
        }
    })
}
// mock api
export function getCVEPolicies(cve: string): Promise<ResponseType> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve({
                code: 200,
                status: 'ok',
                result: {
                    clusters: [
                        {
                            id: 1,
                            name: 'default_cluster',
                            policy: 'INHERIT',
                            isCollapsed: false,
                            environments: [
                                {
                                    id: 1,
                                    name: 'prod',
                                    policy: 'INHERIT',
                                    isCollapsed: false,
                                    applications: [
                                        {
                                            id: 1,
                                            name: 'dashoard',
                                            policy: 'INHERIT',
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            id: 2,
                            name: 'stage',
                            policy: 'INHERIT',
                            isCollapsed: true,
                            environments: [
                                {
                                    id: 1,
                                    name: 'devtron-prod',
                                    policy: 'INHERIT',
                                    isCollapsed: false,
                                    applications: [
                                        {
                                            id: 3,
                                            name: 'blobs',
                                            policy: 'INHERIT',
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            id: 3,
                            name: 'prod',
                            policy: 'INHERIT',
                            isCollapsed: true,
                            environments: [
                                {
                                    id: 1,
                                    name: 'prod',
                                    policy: 'INHERIT',
                                    isCollapsed: false,
                                    applications: [
                                        {
                                            id: 1,
                                            name: 'orch',
                                            policy: 'INHERIT',
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            })
        }, 500)
    })
}
