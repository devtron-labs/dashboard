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

import { Severity, SeverityCount, OptionType } from '@devtron-labs/devtron-fe-common-lib'

export interface SecurityPolicyClusterState {
    view: string
    clusterSearch: string
    clusterList: { id: number; name: string }[]
}

export interface SecurityPolicyEnvironmentState {
    view: string
    envSearch: string
    envList: { id: number; name: string; namespace: string }[]
}

export interface SecurityPolicyAppState {
    view: string
    appSearch: string
    appList: { id: number; name: string }[]
}

export interface VulnerabilityExposureState {
    view: string
    cve: string
    searchApplied: boolean
    searchObjectValue: string
    form: {
        cve: string
    }
    filters: {
        environments: OptionType[]
        clusters: OptionType[]
    }
    filtersApplied: {
        environments: OptionType[]
        clusters: OptionType[]
    }
    scanList: {
        appName: string
        envName: string
        appId: number
        envId: number
        appStore: boolean
        policy: string
    }[]
    offset: number
    pageSize: number
    size: number
}

export interface SecurityScanType {
    name: string
    appId: number
    envId: number
    lastExecution: string
    imageScanDeployInfoId: number
    type: string
    environment: string
    severityCount: SeverityCount
}

export interface SecurityScanListResponseType {
    result: {
        offset: number
        totalCount: number
        pageSize: number
        securityScans: SecurityScanType[]
    }
}

export interface VulnerabilityUIMetaData {
    className: string
    title: string
    subTitle: string
}
// Generated for security policy

/**
 * Error object
 */
export interface Error {
    /**
     * Error code
     */
    code: number
    /**
     * Error message
     */
    message: string
}

/**
 * Resource Level can be one of global, cluster, environment, application
 */
export type ResourceLevel = 'global' | 'cluster' | 'environment' | 'application'

/**
 * actions which can be taken on vulnerabilities
 */

export enum VulnerabilityAction {
    block = 'block',
    allow = 'allow',
    inherit = 'inherit',
    blockiffixed = 'blockiffixed',
}

/**
 * Whether vulnerability is allowed or blocked and is it inherited or is it overriden
 */
export interface VulnerabilityPermission {
    action: VulnerabilityAction
    inherited?: boolean
    isOverriden?: boolean
}

/**
 * Severity related information
 */
export interface SeverityPolicy {
    id: number
    severity: Severity
    policyOrigin: string
    policy: VulnerabilityPermission
}

/**
 * CVE related information
 */
export type CvePolicy = SeverityPolicy & {
    /**
     * In case of CVE policy this is same as cve name else it is blank
     */
    name?: string
}

export interface VulnerabilityPolicy {
    /**
     * Is name of cluster or environment or application/environment
     */
    name?: string
    /**
     * environment id in case of application
     */
    envId?: number
    severities: SeverityPolicy[]
    /**
     * collapsible card in case of application and environment
     */
    isCollapsed?: boolean
    cves: CvePolicy[]
}

export interface GetVulnerabilityPolicyResult {
    level: ResourceLevel
    policies: VulnerabilityPolicy[]
}

/**
 * Only one of result or error will be present
 */
export interface GetVulnerabilityPolicyResponse {
    result?: GetVulnerabilityPolicyResult
    error?: Error
}

export interface IdVulnerabilityPolicyResult {
    id: number
}

/**
 * Only one of result or error will be present
 */
export interface DeleteVulnerabilityPolicyResponse {
    result?: IdVulnerabilityPolicyResult
    error?: Error
}

/**
 * Only one of result or error will be present
 */
export interface UpdateVulnerabilityPolicyResponse {
    result?: IdVulnerabilityPolicyResult
    error?: Error
}

/**
 * Only one of result or error will be present
 */
export interface CreateVulnerabilityPolicyResponse {
    result?: IdVulnerabilityPolicyResult
    error?: Error
}

/**
 * Request object for vulnerability policy. For global policy dont set clusterId, envId and appId. For cluster set clusterId, for environment set envId, for app set appId and envId. Only one of severity or cve should be set.
 */
export interface CreateVulnerabilityPolicyRequest {
    clusterId?: number
    envId?: number
    appId?: number
    severity?: string
    cveId?: string
    action?: VulnerabilityAction
}

export interface FetchPolicyQueryParams {
    level: ResourceLevel
    id?: number
}

export interface CveNamePolicy {
    name: string
    policy: VulnerabilityAction
}
export interface ClusterEnvironment extends CveNamePolicy {
    applications: CveNamePolicy[]
    isCollapsed: boolean
}

export interface CveClusters extends CveNamePolicy {
    environments: ClusterEnvironment[]
    isCollapsed: boolean
}
export interface AddCveModalState extends Pick<CveNamePolicy, 'policy'> {
    view: string
    cve: string
    clusters: CveClusters[]
}

export interface SecurityPolicyEditState {
    showWhitelistModal: boolean
    view: string
    isCveError: boolean
}

export interface AddCveModalProps extends Pick<SecurityPolicyEditState, 'isCveError'> {
    close: () => void
    saveCVE: (cve: string, policy: VulnerabilityAction) => void
    setCVEErrorToTrue: () => void
}
