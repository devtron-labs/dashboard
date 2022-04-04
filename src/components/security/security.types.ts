import { VulnerabilityType } from '../common';
import { RouteComponentProps } from 'react-router-dom';

export interface SecurityPolicyClusterState {
  view: string;
  clusterSearch: string;
  clusterList: { id: number; name: string; }[];
}

export interface SecurityPolicyEnvironmentState {
  view: string;
  envSearch: string;
  envList: { id: number; name: string; namespace: string; }[];
}

export interface SecurityPolicyAppState {
  view: string;
  appSearch: string;
  appList: { id: number; name: string; }[];
}

export interface ReactSelectOptionType {
  value: string;
  label: string;
}

export interface SecurityScansTabState {
  responseCode: number;
  view: string;
  searchObject: ReactSelectOptionType;
  searchObjectValue: string;
  searchApplied: boolean;
  filters: {
    environments: ReactSelectOptionType[];
    clusters: ReactSelectOptionType[];
    severity: {
      label: string;
      value: number;
    }[];
  };
  filtersApplied: {
    environments: ReactSelectOptionType[];
    clusters: ReactSelectOptionType[];
    severity: {
      label: string;
      value: number;
    }[];
  },
  size: number;
  offset: number;
  pageSize: number;
  securityScans: SecurityScanType[];
  uniqueId: {
    imageScanDeployInfoId: number;
    appId: number;
    envId: number;
  },
  name: string;
}

export interface VulnerabilityExposureState {
  view: string;
  cve: string;
  searchApplied: boolean;
  searchObjectValue: string;
  form: {
    cve: string;
  };
  filters: {
    environments: ReactSelectOptionType[];
    clusters: ReactSelectOptionType[];
  };
  filtersApplied: {
    environments: ReactSelectOptionType[];
    clusters: ReactSelectOptionType[];
  },
  scanList: {
    appName: string;
    envName: string;
    appId: number;
    envId: number;
    appStore: boolean;
    policy: string;
  }[];
  offset: number;
  pageSize: number;
  size: number;
}

export interface SecurityScanType {
  name: string;
  appId: number;
  envId: number;
  lastExecution: string;
  imageScanDeployInfoId: number;
  type: string;
  environment: string;
  severityCount: {
    critical: number;
    moderate: number;
    low: number;
  }
}

export interface SecurityScanListResponseType {
  responseCode: number;
  result: {
    offset: number;
    size: number;
    pageSize: number;
    securityScans: SecurityScanType[];
  }
}

export interface SecurityScansResponseType {
  offset: number;
  size: number;
  pageSize: number;
  list: SecurityScanType[];
}

export interface ScanDetailsModalProps extends RouteComponentProps<{}> {
  lastExecutionId: number;
  name: string;
  close: () => void;
}

export interface ScanDetailsModalState {
  view: string;
  scanExecutionId: number;
  appId: number;
  appName: string;
  envId: number;
  envName: string;
  pod: string;
  replicaSet: string;
  severityCount: {
    critical: number;
    moderate: number;
    low: number;
  },
  image: string;
  vulnerabilities: VulnerabilityType[];
}

export interface VulnerabilityUIMetaData {
  className: string
  title: string
  subTitle: string
}
//Generated for security policy

/**
 * Error object
 */
export interface Error {
  /**
   * Error code
   */
  code: number;
  /**
   * Error message
   */
  message: string;
}

/**
 * Resource Level can be one of global, cluster, environment, application
 */
export type ResourceLevel = "global" | "cluster" | "environment" | "application";
export type Severity = "critical" | "moderate" | "low";

/**
 * actions which can be taken on vulnerabilities
 */
export type VulnerabilityAction = "block" | "allow" | "inherit";

/**
 * Whether vulnerability is allowed or blocked and is it inherited or is it overriden
 */
export interface VulnerabilityPermission {
  action: VulnerabilityAction;
  inherited?: boolean;
  isOverriden?: boolean;
}

/**
 * Severity related information
 */
export interface SeverityPolicy {
  id: number;
  severity: Severity;
  policyOrigin: string;
  policy: VulnerabilityPermission;
}

/**
 * CVE related information
 */
export type CvePolicy = SeverityPolicy & {
  /**
   * In case of CVE policy this is same as cve name else it is blank
   */
  name?: string;
};

export interface VulnerabilityPolicy {
  /**
   * Is name of cluster or environment or application/environment
   */
  name?: string;
  /**
   * environment id in case of application
   */
  envId?: number;
  severities: SeverityPolicy[];
  /**
   * collapsible card in case of application and environment
   */
  isCollapsed?: boolean;
  cves: CvePolicy[];
}

export interface GetVulnerabilityPolicyResult {
  level: ResourceLevel;
  policies: VulnerabilityPolicy[];
}

/**
 * Only one of result or error will be present
 */
export interface GetVulnerabilityPolicyResponse {
  result?: GetVulnerabilityPolicyResult;
  error?: Error;
}

export interface IdVulnerabilityPolicyResult {
  id: number;
}

/**
 * Only one of result or error will be present
 */
export interface DeleteVulnerabilityPolicyResponse {
  result?: IdVulnerabilityPolicyResult;
  error?: Error;
}

/**
 * Only one of result or error will be present
 */
export interface UpdateVulnerabilityPolicyResponse {
  result?: IdVulnerabilityPolicyResult;
  error?: Error;
}

/**
 * Only one of result or error will be present
 */
export interface CreateVulnerabilityPolicyResponse {
  result?: IdVulnerabilityPolicyResult;
  error?: Error;
}

/**
 * Request object for vulnerability policy. For global policy dont set clusterId, envId and appId. For cluster set clusterId, for environment set envId, for app set appId and envId. Only one of severity or cve should be set.
 */
export interface CreateVulnerabilityPolicyRequest {
  clusterId?: number;
  envId?: number;
  appId?: number;
  severity?: string;
  cveId?: string;
  action?: VulnerabilityAction;
}

export interface FetchPolicyQueryParams {
  level: ResourceLevel;
  id?: number;
}