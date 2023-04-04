import { getClusterListMin, getEnvironmentListMinPublic } from '../../services/service';
import { Routes } from '../../config';
import { get, post, ResponseType, sortCallback } from '@devtron-labs/devtron-fe-common-lib';
import { SecurityScanListResponseType, ResourceLevel, GetVulnerabilityPolicyResponse } from './security.types';
import moment from 'moment';

export function getClusterListMinNoAuth() {
    const URL = `${Routes.CLUSTER}/autocomplete?auth=false`;
    return get(URL);
}

export function getInitData(payload) {
    return Promise.all([getEnvironmentListMinPublic(), getClusterListMinNoAuth(), getSecurityScanList(payload)]).then(([envResponse, clusterResponse, securityScanResponse]) => {
        let environments = envResponse.result ? envResponse.result.map((env) => {
            return {
                label: env.environment_name,
                value: env.id,
            }
        }) : [];
        let clusters = clusterResponse.result ? clusterResponse.result.map((cluster) => {
            return {
                label: cluster.cluster_name,
                value: cluster.id
            }
        }) : [];
        environments = environments.sort((a, b) => { return sortCallback("label", a, b) });
        clusters = clusters.sort((a, b) => { return sortCallback("label", a, b) });
        return {
            responseCode: securityScanResponse.responseCode,
            filters: {
                severity: [
                    { label: "Crtitical", value: 2 },
                    { label: "Moderate", value: 1 },
                    { label: "Low", value: 0 },
                ],
                clusters: clusters,
                environments: environments,
            },
            ...securityScanResponse.result
        }
    })
}

export function getVulnerabilityFilterData() {
    return Promise.all([getEnvironmentListMinPublic(), getClusterListMin()]).then(([envResponse, clusterResponse]) => {
        let environments = envResponse.result ? envResponse.result.map((env) => {
            return {
                label: env.environment_name,
                value: env.id,
            }
        }) : [];
        let clusters = clusterResponse ? clusterResponse.result.map((cluster) => {
            return {
                label: cluster.cluster_name,
                value: cluster.id
            }
        }) : [];
        environments = environments.sort((a, b) => { return sortCallback("label", a, b) });
        clusters = clusters.sort((a, b) => { return sortCallback("label", a, b) });
        return {
            filters: {
                severity: [
                    { label: "Crtitical", value: 2 },
                    { label: "Moderate", value: 1 },
                    { label: "Low", value: 0 },
                ],
                clusters: clusters,
                environments: environments,
            },
        }
    })
}

export function getSecurityScanList(payload): Promise<SecurityScanListResponseType> {
    const URL = `security/scan/list`;
    return post(URL, payload).then((response) => {
        let securityScans = response.result.scanList || [];
        return {
            responseCode: response.code,
            result: {
                offset: response.result.offset,
                size: response.result.total,
                pageSize: response.result.size || 20,
                securityScans: securityScans.map((scan) => {
                    return {
                        appId: scan.appId,
                        envId: scan.envId,
                        name: scan.name,
                        type: scan.type,
                        imageScanDeployInfoId: scan.imageScanDeployInfoId,
                        environment: scan.environment,
                        severityCount: {
                            critical: scan.severityCount.high,
                            moderate: scan.severityCount.moderate,
                            low: scan.severityCount.low,
                        },
                        lastExecution: moment(scan.lastChecked).utc(false).format("ddd DD MMM YYYY HH:mm:ss"),
                    }
                })
            }
        }
    })
}

export function getVulnerabilities(level: ResourceLevel, id?: number): Promise<GetVulnerabilityPolicyResponse> {
    const URL = `security/policy/list?level=${level}`;
    let qs = ``;
    if (id) qs = `&id=${id}`;
    return get(`${URL}${qs}`).then((response) => {
        return {
            ...response,
            result: {
                ...response.result,
                level: response.result.level,
                policies: response.result.policies ? response.result.policies.map((p) => {
                    return {
                        ...p,
                        severities: p.severities,
                        cves: p.cves || []
                    }
                }) : []
            }
        }
    })
}

export function savePolicy(payload): Promise<ResponseType> {
    const URL = `security/policy/save`;
    return post(URL, payload)
}

export function updatePolicy(payload): Promise<ResponseType> {
    const URL = `security/policy/update`;
    return post(URL, payload);
}

export function getCVEControlList(payload): Promise<ResponseType> {
    const URL = `security/scan/cve/exposure`;
    return post(URL, payload).then((response) => {
        return {
            ...response,
            result: {
                ...response.result,
                offset: response.result.offset || 0,
                size: response.result.total,
                pageSize: response.result.size,
                scanList: response.result.list ? response.result.list.map((cve) => {
                    return {
                        ...cve,
                        policy: cve.blocked ? "block" : "whitelist",
                    }
                }) : [],
            }
        }
    })
}
//mock api
export function getCVEPolicies(cve: string): Promise<ResponseType> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve({
                code: 200,
                status: "ok",
                result: {
                    clusters: [{
                        id: 1,
                        name: "default_cluster",
                        policy: "INHERIT",
                        isCollapsed: false,
                        environments: [{
                            id: 1,
                            name: "prod",
                            policy: "INHERIT",
                            isCollapsed: false,
                            applications: [{
                                id: 1,
                                name: "dashoard",
                                policy: "INHERIT",

                            }]
                        }]
                    },
                    {
                        id: 2,
                        name: "stage",
                        policy: "INHERIT",
                        isCollapsed: true,
                        environments: [{
                            id: 1,
                            name: "devtron-prod",
                            policy: "INHERIT",
                            isCollapsed: false,
                            applications: [{
                                id: 3,
                                name: "blobs",
                                policy: "INHERIT",

                            }]
                        }]
                    },
                    {
                        id: 3,
                        name: "prod",
                        policy: "INHERIT",
                        isCollapsed: true,
                        environments: [{
                            id: 1,
                            name: "prod",
                            policy: "INHERIT",
                            isCollapsed: false,
                            applications: [{
                                id: 1,
                                name: "orch",
                                policy: "INHERIT",

                            }]
                        }]
                    }]
                }
            })
        }, 500)
    })
}
