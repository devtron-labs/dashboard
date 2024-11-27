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
    DeploymentAppTypes,
    DeploymentStrategy,
    AppEnvironment,
    DeploymentChartVersionType,
    ChartMetadataType,
    EnvListMinDTO,
    ResponseType,
    SeverityCount,
    Teams,
    SERVER_MODE,
} from '@devtron-labs/devtron-fe-common-lib'

export interface RootObject {
    code: number
    status?: string
    result: any
}

export interface CDPipelines {
    pipelines: CDPipeline[]
}

export interface PrePostStage {
    triggerType: 'AUTOMATIC' | 'MANUAL'
    name: string
    config: string
}

export interface CDPipeline {
    id: number
    environmentId: number
    environmentName: string
    description: string
    ciPipelineId: number
    triggerType: string
    name: string
    strategies: DeploymentStrategy[]
    deploymentTemplate: string
    preStage: PrePostStage
    postStage: PrePostStage
    preStageConfigMapSecretNames: { configMaps: string[]; secrets: string[] }
    postStageConfigMapSecretNames: { configMaps: string[]; secrets: string[] }
    runPreStageInEnv: boolean
    runPostStageInEnv: boolean
    isClusterCdActive: boolean
    deploymentAppType?: DeploymentAppTypes
    isDeploymentBlocked?: boolean
}

export interface AppListMin extends ResponseType {
    result?: { id: number; name: string }[]
}

export interface ProjectFilteredApps extends ResponseType {
    result?: {
        projectId: number
        projectName: string
        appList: {
            id: number
            name: string
        }[]
    }[]
}

export interface AppIdWorkflowNamesMapping {
    appIdWorkflowNamesMapping: { [key: string]: string[] }
}

export interface AppOtherEnvironment extends ResponseType {
    result?: AppEnvironment[]
}
export interface AllWorkflows extends ResponseType {
    result?: AppIdWorkflowNamesMapping
}

export interface HostURLConfig {
    id: number
    key: string
    value: string
    active: boolean
}

export interface HostURLConfigResponse extends ResponseType {
    result?: HostURLConfig
}

export interface ClusterEnvironmentDetailList extends ResponseType {
    result?: ClusterEnvironmentDetail[]
}

export interface ClusterEnvironmentDetail {
    id: number // envId
    environment_name: string
    active: boolean
    cluster_id: number
    cluster_name: string
    namespace: string
}

export interface ClusterListResponse extends ResponseType {
    result?: Cluster[]
}

export interface Cluster {
    id: number
    cluster_name: string
    active: boolean
    errorInConnecting?: string
    isVirtualCluster?: boolean
}

export interface LoginCountType extends ResponseType {
    result?: LoginCount
}

export interface LoginCount {
    emailId: string
    key: string
    value: string
}

export interface AppRouterType {
    isSuperAdmin?: boolean
    appListCount: number
    loginCount: number
    serverMode: SERVER_MODE
}

export interface ConfigOverrideWorkflowDetails {
    cdPipelines: string[]
    ciPipelineId: number
    ciPipelineName: string
    id: number
    name: string
}

export interface ConfigOverrideWorkflowDetailsResponse extends ResponseType {
    result?: {
        workflows: ConfigOverrideWorkflowDetails[]
    }
}

export interface MinChartRefDTO {
    chartMetadata: Record<string, ChartMetadataType>
    chartRefs: DeploymentChartVersionType[]
    latestAppChartRef: number
    latestChartRef: number
    latestEnvChartRef?: number
}

export interface ClusterEnvTeams {
    clusters: Cluster[]
    environments: EnvListMinDTO[]
    teams: Teams[]
}
