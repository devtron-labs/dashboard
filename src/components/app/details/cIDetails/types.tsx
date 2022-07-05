import { CIMaterial } from '../triggerView/ciMaterial'

export interface RootObject {
    code: number
    status: string
}

export interface CIPipeline {
    name: string
    id: number
    parentCiPipeline: number
    parentAppId: number
    pipelineType: string
}

export interface History {
    id: number
    name: string
    status: string
    podStatus: string
    message: string
    startedOn: string
    finishedOn: string
    ciPipelineId: number
    namespace: string
    logLocation: string
    gitTriggers: Map<number, GitTriggers>
    ciMaterials: CiMaterial[]
    triggeredBy: number
    artifact: string
    artifactId: number
    triggeredByEmail: string
    stage?: 'POST' | 'DEPLOY' | 'PRE'
}

export interface CiMaterial {
    id: number
    gitMaterialId: number
    gitMaterialUrl: string
    gitMaterialName: string
    type: string
    value: string
    active: boolean
    lastFetchTime: string
    isRepoError: boolean
    repoErrorMsg: string
    isBranchError: boolean
    branchErrorMsg: string
    url: string
}

export interface WebHookData {
    Id: number
    EventActionType: string
    Data: any
}

export interface GitTriggers {
    Commit: string
    Author: string
    Date: Date
    Message: string
    Changes: string[]
    WebhookData: WebHookData
    GitRepoUrl: string
    GitRepoName: string
    CiConfigureSourceType: string
    CiConfigureSourceValue: string
}

export interface BranchRegex {
    material: CIMaterial
}
